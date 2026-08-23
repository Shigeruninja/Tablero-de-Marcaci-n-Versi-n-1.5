// Generador de código Arduino (.ino) y documentación del protocolo
import { CodeAuditItem } from '../types';

export const AUDIT_ITEMS: CodeAuditItem[] = [
  {
    id: 'audit-bt-spp-vs-ble',
    category: 'critical',
    title: 'Incompatibilidad de Web Bluetooth con HC-05 / HC-06 Clásico (SPP)',
    description: 'La API de Web Bluetooth de los navegadores (Chrome/Edge) sólo soporta Bluetooth Low Energy (BLE - GATT), NO Bluetooth Clásico SPP (Serial Port Profile 0x1101) usado por los módulos HC-05/HC-06. Al intentar conectar un HC-05 con Web Bluetooth, el navegador nunca encontrará el dispositivo o fallará el servicio.',
    codeSnippetOriginal: `// Intento de conexión directa con Web Bluetooth a HC-05:
const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: ['6e400001-...', '00001101-...'] // 0x1101 es SPP clásico
});`,
    codeSnippetFixed: `// SOLUCIÓN IMPLEMENTADA:
// 1. Para HC-05 / HC-06 o cable USB: Usar Web Serial API (navigator.serial).
//    Al emparejar el HC-05 en Windows/Mac/Android, crea un puerto COM virtual que Web Serial abre directo.
// 2. Para BLE inalámbrico directo: Usar placa ESP32 con BLE UART o módulo HM-10 / AT-09.`,
    status: 'fixed'
  },
  {
    id: 'audit-audio-dfplayer-relay',
    category: 'optimization',
    title: 'Chicharra y Música de Juego Estilo Básquetbol (DFPlayer Mini + Relé)',
    description: 'Para lograr el sonido de estadio potente y música de juego como en los partidos de básquetbol, el Arduino soporta dos vías: salida por Relé para bocina/sirena de 12V/220V, y control serie de un módulo DFPlayer Mini con tarjeta MicroSD para reproducir pistas de música de cancha (Fanfarria Charge, Defensa, Triples, Silbato y Chicharra NBA).',
    codeSnippetOriginal: `// Solo buzzer pasivo básico con tone()`,
    codeSnippetFixed: `// Soporte completo de Relé de alta potencia + DFPlayer Mini:
// Comandos: CMD:HORN, CMD:SND:CHARGE, CMD:SND:DEFENSE, CMD:SND:TRIPLE, CMD:SND:WHISTLE`,
    status: 'fixed'
  },
  {
    id: 'audit-rtc-buenos-aires',
    category: 'optimization',
    title: 'Sincronización horaria RTC (Buenos Aires UTC-3)',
    description: 'La función getBuenosAiresTime() calcula la hora oficial argentina precisa. Se optimizó el envío de comando CLK:HH:MM:SS:DD:MM:YYYY para actualizar tanto hora como fecha en el módulo RTC DS3231 con batería de respaldo.',
    codeSnippetOriginal: `sendCommand(\`CLK:\${timeStr}\`); // Solo enviaba HH:MM:SS`,
    codeSnippetFixed: `// Envío completo de tiempo y calendario para DS3231:
sendCommand(\`CLK:\${hours}:\${minutes}:\${seconds}:\${day}:\${month}:\${year}\`);`,
    status: 'fixed'
  },
  {
    id: 'audit-serial-buffer-overflow',
    category: 'warning',
    title: 'Delimitación de paquetes y Parser en Arduino sin bloqueo',
    description: 'Enviar comandos con salto de línea \\n requiere que el Arduino use un buffer de lectura no bloqueante con detección de delimitador para evitar congelar el bucle loop() y permitir que el cronómetro, el display LED y el reproductor de sonido sigan funcionando fluidamente.',
    codeSnippetOriginal: `// En Arduino típico: Serial.readString() bloquea el procesador varios milisegundos`,
    codeSnippetFixed: `// En el sketch provisto: buffer estático circular con delimitador '\\n' sin bloqueo`,
    status: 'fixed'
  }
];

export const ARDUINO_COMPLETE_SKETCH = `/*
 * ==================================================================================
 * TABLERO DEPORTIVO Y CARTEL LUMINOSO LED PARA GIMNASIO ESCOLAR
 * Compatible con: Arduino Uno / Nano / Mega / ESP32
 * 
 * Basado en la arquitectura del proyecto base y adaptado para:
 *   - Interfaz de Comunicación Bluetooth (HC-05 / HC-06 / ESP32 BLE) y USB Serial
 *   - Visualización de Marcador Completo (Local, Visitante, Tiempo, Periodo, 24s)
 *   - Displays de 7 Segmentos (MAX7219 / Tiras LED WS2812B / 74HC595)
 *   - Módulo RTC DS3231 con sincronización horaria Buenos Aires UTC-3
 *   - Relé para Chicharra / Bocina de Estadio de 12V/220V
 *   - Módulo de Audio MP3 DFPlayer Mini para música y efectos de básquetbol
 * ==================================================================================
 */

#include <Wire.h>
#include <RTClib.h>           // Librería Adafruit RTClib para DS3231
#include <LedControl.h>       // Librería LedControl para displays MAX7219
#include <SoftwareSerial.h>   // Para DFPlayer Mini en pines digitales

// --- ASIGNACIÓN DE PINES (AJUSTAR SEGÚN TU HARDWARE) ---
#define PIN_HORN_RELAY   8    // Salida para activar relé de la Chicharra / Bocina (12V / 220V)
#define PIN_BUZZER       9    // Buzzer sonoro secundario de aviso
#define PIN_MAX_DIN     12    // Datos MAX7219 (MOSI)
#define PIN_MAX_CS      10    // Chip Select MAX7219 (LOAD)
#define PIN_MAX_CLK     11    // Clock MAX7219 (SCK)

// Pines para módulo de audio DFPlayer Mini (Opcional para música y efectos de cancha)
#define PIN_DFP_RX       2    // Conectar a TX de DFPlayer Mini (a través de resistencia de 1k)
#define PIN_DFP_TX       3    // Conectar a RX de DFPlayer Mini
SoftwareSerial mp3Serial(PIN_DFP_RX, PIN_DFP_TX);

// Configuración MAX7219: 4 módulos en cascada (Local, Visitante, Tiempo, Periodo/24s)
LedControl lc = LedControl(PIN_MAX_DIN, PIN_MAX_CLK, PIN_MAX_CS, 4);

// Módulo RTC DS3231 (I2C: SDA A4, SCL A5 en Arduino Uno/Nano)
RTC_DS3231 rtc;
bool rtcPresente = false;

// --- ESTADO DEL TABLERO ---
enum ModoOperacion {
  MODO_TABLERO,
  MODO_RELOJ_RTC,
  MODO_CARTEL_MENSAJE
};

ModoOperacion modoActual = MODO_TABLERO;

int puntosLocal = 0;
int puntosVisitante = 0;
int faltasLocal = 0;
int faltasVisitante = 0;
int minutosTiempo = 10;
int segundosTiempo = 0;
int shotClockSegundos = 24;
bool shotClockActivo = false;
char periodoActual[4] = "1";
bool cronometroActivo = false;
char direccionTiempo = 'D'; // 'D' = Descendente (Regresiva), 'U' = Ascendente

unsigned long ultimoMillisCronometro = 0;
unsigned long ultimoMillisShotClock = 0;
unsigned long finBocinaMillis = 0;
bool bocinaActiva = false;

// Buffer de Recepción Serie
char bufferSerie[64];
byte indiceBuffer = 0;

// Declaración de funciones
void leerComandosSerie();
void procesarComando(char* cmd);
void actualizarDisplayTablero();
void mostrarHoraRTC();
void activarBocina(unsigned long duracionMs);
void reproducirPistaMP3(byte pista);
void enviarComandoDFP(byte cmd, byte param1, byte param2);

void setup() {
  // Inicializar Comunicación Serie (9600 baudios para HC-05 / USB)
  Serial.begin(9600);
  mp3Serial.begin(9600);
  
  // Pines de salida
  pinMode(PIN_HORN_RELAY, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_HORN_RELAY, LOW); // Relé apagado
  digitalWrite(PIN_BUZZER, LOW);

  // Inicializar displays MAX7219
  for (int i = 0; i < 4; i++) {
    lc.shutdown(i, false);
    lc.setIntensity(i, 12); // Brillo (0 a 15)
    lc.clearDisplay(i);
  }

  // Inicializar RTC DS3231
  if (rtc.begin()) {
    rtcPresente = true;
    if (rtc.lostPower()) {
      rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    }
  } else {
    rtcPresente = false;
    Serial.println(F("[AVISO] Modulo RTC DS3231 no detectado en bus I2C"));
  }

  // Configurar volumen de DFPlayer Mini (Volumen: 25 / 30)
  enviarComandoDFP(0x06, 0x00, 25);

  // Sonido de arranque corto
  activarBocina(150);
  actualizarDisplayTablero();
  
  Serial.println(F("OK:TABLERO_GIMNASIO_INICIADO"));
}

void loop() {
  // 1. Lectura de Comandos Serie sin bloqueo
  leerComandosSerie();

  unsigned long actualMillis = millis();

  // 2. Control de tiempo cronómetro principal
  if (modoActual == MODO_TABLERO && cronometroActivo) {
    if (actualMillis - ultimoMillisCronometro >= 1000) {
      ultimoMillisCronometro = actualMillis;
      
      if (direccionTiempo == 'D') {
        if (segundosTiempo > 0) {
          segundosTiempo--;
        } else if (minutosTiempo > 0) {
          minutosTiempo--;
          segundosTiempo = 59;
        } else {
          // ¡FIN DEL TIEMPO DE JUEGO!
          cronometroActivo = false;
          activarBocina(2500); // 2.5 seg de bocina/chicharra
          reproducirPistaMP3(1); // Pista 1: Chicharra final en DFPlayer
          Serial.println(F("EVT:TIEMPO_CERO"));
        }
      } else { // Ascendente
        segundosTiempo++;
        if (segundosTiempo >= 60) {
          segundosTiempo = 0;
          minutosTiempo++;
        }
      }
      actualizarDisplayTablero();
    }
  }

  // 3. Control de Reloj de Posesión (24 segundos)
  if (modoActual == MODO_TABLERO && shotClockActivo) {
    if (actualMillis - ultimoMillisShotClock >= 1000) {
      ultimoMillisShotClock = actualMillis;
      if (shotClockSegundos > 0) {
        shotClockSegundos--;
      } else {
        shotClockActivo = false;
        activarBocina(1000); // 1 seg de bocina de tiro
        reproducirPistaMP3(2); // Pista 2: Bocina shot clock
        Serial.println(F("EVT:SHOT_CLOCK_CERO"));
      }
      actualizarDisplayTablero();
    }
  }

  // 4. Modo Reloj RTC
  if (modoActual == MODO_RELOJ_RTC) {
    static unsigned long ultimoRefrescoReloj = 0;
    if (actualMillis - ultimoRefrescoReloj >= 1000) {
      ultimoRefrescoReloj = actualMillis;
      mostrarHoraRTC();
    }
  }

  // 5. Apagar bocina cuando expire su temporizador
  if (bocinaActiva && actualMillis >= finBocinaMillis) {
    digitalWrite(PIN_HORN_RELAY, LOW);
    digitalWrite(PIN_BUZZER, LOW);
    bocinaActiva = false;
  }
}

// --- PROCESAMIENTO DE COMANDOS SERIE ---
void leerComandosSerie() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\\n' || c == '\\r') {
      if (indiceBuffer > 0) {
        bufferSerie[indiceBuffer] = '\\0';
        procesarComando(bufferSerie);
        indiceBuffer = 0;
      }
    } else {
      if (indiceBuffer < sizeof(bufferSerie) - 1) {
        bufferSerie[indiceBuffer++] = c;
      }
    }
  }
}

void procesarComando(char* cmd) {
  // Comandos de Control de Tiempo
  if (strcmp(cmd, "CMD:START") == 0) {
    cronometroActivo = true;
    ultimoMillisCronometro = millis();
    Serial.println(F("ACK:START"));
  }
  else if (strcmp(cmd, "CMD:PAUSE") == 0) {
    cronometroActivo = false;
    Serial.println(F("ACK:PAUSE"));
  }
  else if (strcmp(cmd, "CMD:RESET") == 0) {
    cronometroActivo = false;
    Serial.println(F("ACK:RESET"));
    actualizarDisplayTablero();
  }
  else if (strcmp(cmd, "CMD:HORN") == 0) {
    activarBocina(2000); // 2 segundos
    reproducirPistaMP3(1);
    Serial.println(F("ACK:HORN"));
  }
  
  // Efectos de Sonido y Música de Estadio Multideporte (DFPlayer Mini / Relé)
  else if (strcmp(cmd, "CMD:SND:HORN") == 0) {
    activarBocina(2000);
    reproducirPistaMP3(1); // Pista 1: Chicharra principal
  }
  else if (strncmp(cmd, "CMD:SND:SHOT_WARN", 17) == 0 || strcmp(cmd, "CMD:SND:SHOT_WARN") == 0) {
    // Aviso sonoro de últimos 5 segundos de posesión (5s, 4s, 3s, 2s, 1s)
    reproducirPistaMP3(23); // Pista 23: Beep agudo de aviso de 24s
  }
  else if (strcmp(cmd, "CMD:SND:SHOT_EXPIRED") == 0 || strcmp(cmd, "CMD:SHOT_CLOCK_EXPIRED") == 0) {
    activarBocina(1000); // 1 segundo bocina de tablero
    reproducirPistaMP3(2); // Pista 2: Bocina violación de 24s
    Serial.println(F("ACK:SHOT_CLOCK_EXPIRED"));
  }
  else if (strcmp(cmd, "CMD:SND:CHARGE") == 0) {
    reproducirPistaMP3(3); // Pista 3: Fanfarria Charge
  }
  else if (strcmp(cmd, "CMD:SND:DEFENSE") == 0) {
    reproducirPistaMP3(4); // Pista 4: Ritmo Defense
  }
  else if (strcmp(cmd, "CMD:SND:TRIPLE") == 0) {
    reproducirPistaMP3(5); // Pista 5: Sonido Triple
  }
  else if (strcmp(cmd, "CMD:SND:WHISTLE") == 0) {
    reproducirPistaMP3(6); // Pista 6: Silbato arbitro
  }
  else if (strcmp(cmd, "CMD:SND:TIMEOUT") == 0) {
    activarBocina(600);
    reproducirPistaMP3(7); // Pista 7: Tono Timeout
  }
  // Futsal / Fútbol
  else if (strcmp(cmd, "CMD:SND:GOAL") == 0) {
    activarBocina(2500);
    reproducirPistaMP3(8); // Pista 8: Sirena de Gol + Euforia
  }
  else if (strcmp(cmd, "CMD:SND:OLE") == 0) {
    reproducirPistaMP3(9); // Pista 9: Cantico Ole Ole Ole
  }
  else if (strcmp(cmd, "CMD:SND:DOUBLE_WHISTLE") == 0) {
    reproducirPistaMP3(10); // Pista 10: Doble silbato falta
  }
  else if (strcmp(cmd, "CMD:SND:CARD") == 0) {
    reproducirPistaMP3(11); // Pista 11: Alarma tarjeta/falta
  }
  // Vóley
  else if (strcmp(cmd, "CMD:SND:SET_POINT") == 0) {
    reproducirPistaMP3(12); // Pista 12: Fanfarria Set Point
  }
  else if (strcmp(cmd, "CMD:SND:ACE") == 0) {
    reproducirPistaMP3(13); // Pista 13: Bloqueo / Ace
  }
  else if (strcmp(cmd, "CMD:SND:SERVE") == 0) {
    reproducirPistaMP3(14); // Pista 14: Silbato de saque
  }
  else if (strcmp(cmd, "CMD:SND:ROTATION") == 0) {
    reproducirPistaMP3(15); // Pista 15: Tono de rotacion
  }
  // Handball
  else if (strcmp(cmd, "CMD:SND:HANDBALL_GOAL") == 0) {
    activarBocina(1500);
    reproducirPistaMP3(16); // Pista 16: Gol Handball
  }
  else if (strcmp(cmd, "CMD:SND:2MIN") == 0) {
    reproducirPistaMP3(17); // Pista 17: Exclusion 2 minutos
  }
  else if (strcmp(cmd, "CMD:SND:PASSIVE") == 0) {
    reproducirPistaMP3(18); // Pista 18: Aviso juego pasivo
  }
  // Entrenamiento / Gimnasio
  else if (strcmp(cmd, "CMD:SND:COUNTDOWN") == 0) {
    reproducirPistaMP3(19); // Pista 19: 3, 2, 1, GO!
  }
  else if (strcmp(cmd, "CMD:SND:BELL") == 0) {
    reproducirPistaMP3(20); // Pista 20: Campana round boxeo
  }
  else if (strcmp(cmd, "CMD:SND:GONG") == 0) {
    reproducirPistaMP3(21); // Pista 21: Gong descanso
  }
  else if (strcmp(cmd, "CMD:SND:APPLAUSE") == 0) {
    reproducirPistaMP3(22); // Pista 22: Ovacion / Aplausos
  }

  // Reloj de Posesión (24s)
  else if (strcmp(cmd, "CMD:SHOT_CLOCK_START") == 0) {
    shotClockActivo = true;
    ultimoMillisShotClock = millis();
  }
  else if (strcmp(cmd, "CMD:SHOT_CLOCK_PAUSE") == 0) {
    shotClockActivo = false;
  }
  else if (strncmp(cmd, "CMD:SHOT_CLOCK_RESET:", 21) == 0) {
    shotClockSegundos = atoi(cmd + 21);
    actualizarDisplayTablero();
  }

  // Modos de Visualización
  else if (strcmp(cmd, "CMD:MODE_SCOREBOARD") == 0) {
    modoActual = MODO_TABLERO;
    actualizarDisplayTablero();
    Serial.println(F("ACK:MODE_SCOREBOARD"));
  }
  else if (strcmp(cmd, "CMD:MODE_CLOCK") == 0) {
    modoActual = MODO_RELOJ_RTC;
    mostrarHoraRTC();
    Serial.println(F("ACK:MODE_CLOCK"));
  }
  
  // Puntos Local (L:xx) y Visitante (V:xx)
  else if (strncmp(cmd, "L:", 2) == 0) {
    puntosLocal = atoi(cmd + 2);
    actualizarDisplayTablero();
  }
  else if (strncmp(cmd, "V:", 2) == 0) {
    puntosVisitante = atoi(cmd + 2);
    actualizarDisplayTablero();
  }
  
  // Tiempo y Periodo (T:MM:SS:Periodo:Direccion) -> Ejemplo: T:09:45:2:D
  else if (strncmp(cmd, "T:", 2) == 0) {
    char temp[32];
    strncpy(temp, cmd + 2, sizeof(temp));
    char* token = strtok(temp, ":");
    if (token) minutosTiempo = atoi(token);
    token = strtok(NULL, ":");
    if (token) segundosTiempo = atoi(token);
    token = strtok(NULL, ":");
    if (token) strncpy(periodoActual, token, sizeof(periodoActual));
    token = strtok(NULL, ":");
    if (token) direccionTiempo = token[0];

    actualizarDisplayTablero();
  }

  // Sincronización RTC (CLK:HH:MM:SS:DD:MM:YYYY)
  else if (strncmp(cmd, "CLK:", 4) == 0) {
    int h = 0, m = 0, s = 0, d = 1, mes = 1, y = 2026;
    sscanf(cmd + 4, "%d:%d:%d:%d:%d:%d", &h, &m, &s, &d, &mes, &y);
    if (rtcPresente) {
      rtc.adjust(DateTime(y, mes, d, h, m, s));
      Serial.println(F("ACK:RTC_SINCRONIZADO"));
    }
    if (modoActual == MODO_RELOJ_RTC) {
      mostrarHoraRTC();
    }
  }

  // Ajuste de Brillo (BRIGHT:0-100)
  else if (strncmp(cmd, "BRIGHT:", 7) == 0) {
    int brillo = map(atoi(cmd + 7), 0, 100, 0, 15);
    for (int i = 0; i < 4; i++) {
      lc.setIntensity(i, brillo);
    }
  }

  // Cambio de Color Reloj RTC (CLKCLR:CYAN/GREEN/AMBER/RED/BLUE/PURPLE/WHITE/LIME)
  else if (strncmp(cmd, "CLKCLR:", 7) == 0) {
    // Comando para matrices LED RGB (WS2812B / P10 Full Color)
    Serial.print(F("ACK:CLOCK_COLOR:"));
    Serial.println(cmd + 7);
  }
}

// --- ACTUALIZACIÓN DE DISPLAYS FÍSICOS (MAX7219) ---
void actualizarDisplayTablero() {
  if (modoActual != MODO_TABLERO) return;

  // Módulo 0: Puntos Local (2 dígitos)
  lc.setDigit(0, 0, puntosLocal / 10, false);
  lc.setDigit(0, 1, puntosLocal % 10, false);

  // Módulo 1: Puntos Visitante (2 dígitos)
  lc.setDigit(1, 0, puntosVisitante / 10, false);
  lc.setDigit(1, 1, puntosVisitante % 10, false);

  // Módulo 2: Minutos y Segundos (MM:SS)
  lc.setDigit(2, 0, minutosTiempo / 10, false);
  lc.setDigit(2, 1, minutosTiempo % 10, true); // Punto parpadeante
  lc.setDigit(2, 2, segundosTiempo / 10, false);
  lc.setDigit(2, 3, segundosTiempo % 10, false);

  // Módulo 3: Periodo y Reloj de 24s
  if (periodoActual[0] >= '0' && periodoActual[0] <= '9') {
    lc.setDigit(3, 0, periodoActual[0] - '0', false);
  } else {
    lc.setChar(3, 0, 'E', false);
  }
  lc.setDigit(3, 2, shotClockSegundos / 10, false);
  lc.setDigit(3, 3, shotClockSegundos % 10, false);
}

void mostrarHoraRTC() {
  if (!rtcPresente) return;
  DateTime now = rtc.now();

  lc.setDigit(2, 0, now.hour() / 10, false);
  lc.setDigit(2, 1, now.hour() % 10, true);
  lc.setDigit(2, 2, now.minute() / 10, false);
  lc.setDigit(2, 3, now.minute() % 10, false);

  lc.setDigit(3, 0, now.second() / 10, false);
  lc.setDigit(3, 1, now.second() % 10, false);
}

void activarBocina(unsigned long duracionMs) {
  digitalWrite(PIN_HORN_RELAY, HIGH);
  digitalWrite(PIN_BUZZER, HIGH);
  bocinaActiva = true;
  finBocinaMillis = millis() + duracionMs;
}

// --- COMUNICACIÓN CON DFPLAYER MINI (MÚSICA Y EFECTOS) ---
void reproducirPistaMP3(byte pista) {
  enviarComandoDFP(0x03, 0x00, pista); // Comando 0x03: Reproducir pista específica en carpeta raíz
}

void enviarComandoDFP(byte cmd, byte param1, byte param2) {
  byte paquete[10] = { 0x7E, 0xFF, 0x06, cmd, 0x00, param1, param2, 0x00, 0x00, 0xEF };
  
  // Cálculo de Checksum
  int checksum = 0 - (0xFF + 0x06 + cmd + 0x00 + param1 + param2);
  paquete[7] = (byte)(checksum >> 8);
  paquete[8] = (byte)(checksum & 0xFF);
  
  for (int i = 0; i < 10; i++) {
    mp3Serial.write(paquete[i]);
  }
}
`;
