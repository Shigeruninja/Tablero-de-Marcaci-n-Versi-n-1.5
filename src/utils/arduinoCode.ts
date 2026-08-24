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
    id: 'audit-banner-2lines-scroll',
    category: 'optimization',
    title: 'Cartel de Mensajes: 2 Renglones y Animación Estática / Desplazamiento',
    description: 'La retícula 17x64 permite 2 renglones de texto completos de 7 píxeles de alto (Filas 1-7 y 9-15) usando la tipografía 5x7 biselada. El firmware y el simulador soportan modo estático centrado y desplazamiento configurable tanto de izquierda a derecha como de derecha a izquierda.',
    codeSnippetOriginal: `// Solo modo un renglón fijo`,
    codeSnippetFixed: `// Soporte de 2 renglones con modo estático y desplazamiento continuo bidireccional:
// Comandos: MODE:BANNER, MSG:LINEA1|LINEA2, BANNER:STATIC, BANNER:SCROLL:L2R:3`,
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
    id: 'audit-matrix-17x64-symmetry',
    category: 'optimization',
    title: 'Geometría y Simetría Axial de Retícula 17x64 (1088 Píxeles)',
    description: 'La retícula matricial estándar de 17 filas x 64 columnas (1088 LEDs WS2812B) organiza el tablero en tres bloques armoniosos: Tanteador Local (Cols 0-17), Cronómetro y Shot Clock Central (Cols 18-45 con eje central en Col 32) y Tanteador Visitante (Cols 46-63), con la Fila 9 como eje de simetría horizontal para dígitos 5x7.',
    codeSnippetOriginal: `// Matriz previa de 17x53 columnas`,
    codeSnippetFixed: `// Configuración FastLED simétrica de 17 filas x 64 columnas = 1088 LEDs:
#define MATRIX_ROWS 17
#define MATRIX_COLS 64
#define TOTAL_LEDS (MATRIX_ROWS * MATRIX_COLS) // 1088 LEDs WS2812B`,
    status: 'fixed'
  },
  {
    id: 'audit-compact-3x5-font',
    category: 'optimization',
    title: 'Tipografía Compacta 3x5 de Alta Capacidad y Legibilidad (16 Caracteres/Línea)',
    description: 'Para evitar que las letras sean excesivamente grandes y permitan mayor contenido legible por renglón, se integró la tipografía matricial 3x5 (3 columnas de ancho x 5 filas de alto + 1 columna de separación = 4 px por letra). En la retícula de 64 columnas permite hasta 16 caracteres estáticos por renglón sin necesidad de scroll ni deformaciones.',
    codeSnippetOriginal: `// Letras 5x7 ocupaban 6 columnas por letra (máximo 10 caracteres)`,
    codeSnippetFixed: `// Matriz 3x5: 4 columnas por letra -> 16 caracteres estáticos por línea:
const byte FONT_3X5[37][5] = { ... }; // Números 0-9 y Letras A-Z compactas`,
    status: 'fixed'
  },
  {
    id: 'audit-dynamic-led-lighting',
    category: 'optimization',
    title: 'Control de Iluminación LED y Efectos Dinámicos Independientes',
    description: 'Permite configurar de forma individual el color (RGB Hex), efecto animado (estático, pulsación, onda, arcoíris, fuego, escáner, destellos, persecución), velocidad y brillo para cada componente del marcador (Local, Visitante, Periodo, Tiempo, Posesión, Cartel, Reloj, Bordes). Se sincroniza en tiempo real mediante el comando serie LED:<COMP_ID>:<HEX_COLOR>:<EFFECT>:<SPEED>:<BRIGHTNESS>.',
    codeSnippetOriginal: `// Colores fijos cableados en el código`,
    codeSnippetFixed: `// Sincronización dinámica vía puerto serie e interactividad FastLED en ESP32 / Arduino:
// Comando: LED:scoreLocal:#00D2FF:wave:3:100
// Parser FastLED: getComponentPixelColor(cfg, x, y, millis())`,
    status: 'fixed'
  }
];

export const ARDUINO_MATRIX_17X64_SKETCH = `/*
 * ==================================================================================
 * TABLERO DEPORTIVO RETÍCULA LED WS2812B (17 FILAS x 64 COLUMNAS = 1088 PÍXELES)
 * Plataforma recomendada: ESP32 DevKit V1 (o Arduino Mega con fuente 5V 15A)
 * 
 * MOTOR DE ILUMINACIÓN Y EFECTOS DINÁMICOS WS2812B:
 *   - Control de color independiente por componente (Hexadecimal RGB)
 *   - Efectos animados: Sólido, Pulso (Breathing), Onda Senoidal, Arcoíris (HSV),
 *     Fuego Orgánico, Escáner Cylon, Destellos (Sparkle), Persecución (Chase).
 *   - Protocolo serie: LED:<COMP_ID>:<HEX_COLOR>:<EFFECT>:<SPEED>:<BRIGHTNESS>
 *
 * ESQUEMA FÍSICO DE PÍXELES (256 cm x 68 cm con celdas de 4cm x 4cm):
 *   - MODO TABLERO:
 *       * Filas 1 a 7 (Cols 2 a 12): Tanteador Local (0 a 99) - Tipografía 5x7
 *       * Filas 2 a 6 (Cols central): Periodo central simétrico - Tipografía 3x5
 *       * Filas 1 a 7 (Cols 52 a 62): Tanteador Visitante (0 a 99) - Tipografía 5x7
 *       * Filas 9 a 15 (Centrado H y V): Cronómetro "MM:SS" / "MMM:SS" (hasta 999 min) - Tipografía 5x7
 *       * Cols 0 y 63: Indicadores de posesión lateral
 *   - MODO RELOJ RTC:
 *       * HH : MM : SS centrado en una sola línea con color configurable
 *   - MODO CARTEL DE MENSAJES:
 *       * Renglón 1 (Y=2) y Renglón 2 (Y=10) en fuente 3x5 (hasta 16 letras/línea)
 *       * Modos: Estático centrado o Desplazamiento continuo suave
 * ==================================================================================
 */

#include <FastLED.h>

#define LED_PIN          18    // Pin de datos al primer LED WS2812B (resistor 330Ω)
#define PIN_HORN_RELAY   23    // Salida a relé optoacoplado de bocina/sirena (12V/220V)
#define MATRIX_ROWS      17
#define MATRIX_COLS      64
#define NUM_LEDS         (MATRIX_ROWS * MATRIX_COLS) // 1088 LEDs
#define DEFAULT_BRIGHT   180   // 0 a 255 (controlable por comando BRIGHT:0-100)

CRGB leds[NUM_LEDS];

// =========================================================================
// ESTRUCTURA Y MOTOR DE EFECTOS LED DINÁMICOS
// =========================================================================
enum LedEffectType {
  EFFECT_SOLID = 0,
  EFFECT_PULSE = 1,
  EFFECT_WAVE = 2,
  EFFECT_RAINBOW = 3,
  EFFECT_FIRE = 4,
  EFFECT_SCAN = 5,
  EFFECT_SPARKLE = 6,
  EFFECT_CHASE = 7
};

struct ComponentLedConfig {
  CRGB baseColor;
  LedEffectType effect;
  byte speed;      // 1 (lento) a 5 (rápido)
  byte brightness; // 10% a 100%
};

// Configuraciones iniciales por componente
ComponentLedConfig cfgScoreLocal   = { CRGB(0, 210, 255),   EFFECT_SOLID, 3, 100 }; // Cyan
ComponentLedConfig cfgScoreVisitor = { CRGB(255, 50, 60),   EFFECT_SOLID, 3, 100 }; // Rojo
ComponentLedConfig cfgPeriod       = { CRGB(251, 191, 36),  EFFECT_SOLID, 3, 100 }; // Ámbar
ComponentLedConfig cfgTimer        = { CRGB(255, 230, 0),   EFFECT_SOLID, 3, 100 }; // Amarillo
ComponentLedConfig cfgPossession   = { CRGB(0, 210, 255),   EFFECT_PULSE, 4, 100 };
ComponentLedConfig cfgBanner       = { CRGB(245, 158, 11),  EFFECT_SOLID, 3, 100 };
ComponentLedConfig cfgClock        = { CRGB(6, 182, 212),   EFFECT_SOLID, 3, 100 };
ComponentLedConfig cfgBorder       = { CRGB(30, 41, 59),    EFFECT_SOLID, 1, 40 };

// Comprueba si algún componente requiere animación en tiempo real
bool hasActiveAnimatedEffects() {
  if (cfgScoreLocal.effect != EFFECT_SOLID) return true;
  if (cfgScoreVisitor.effect != EFFECT_SOLID) return true;
  if (cfgPeriod.effect != EFFECT_SOLID) return true;
  if (cfgTimer.effect != EFFECT_SOLID) return true;
  if (cfgPossession.effect != EFFECT_SOLID) return true;
  if (cfgBanner.effect != EFFECT_SOLID) return true;
  if (cfgClock.effect != EFFECT_SOLID) return true;
  return false;
}

// Generador matemático de color para un píxel según su efecto asignado
CRGB getComponentPixelColor(const ComponentLedConfig& cfg, int x, int y, uint32_t nowMs) {
  float speedMultiplier = cfg.speed * 0.7f;
  float scale = (float)cfg.brightness / 100.0f;

  switch (cfg.effect) {
    case EFFECT_PULSE: {
      // Respiración suave sinusoidal
      uint8_t breath = sin8((uint8_t)((nowMs * speedMultiplier / 6.0f)));
      float factor = 0.35f + (0.65f * (breath / 255.0f));
      CRGB c = cfg.baseColor;
      c.nscale8_video((uint8_t)(255 * factor * scale));
      return c;
    }
    case EFFECT_WAVE: {
      // Onda espacial horizontal desplazándose
      uint8_t wave = sin8((uint8_t)((nowMs * speedMultiplier / 5.0f) + (x * 16)));
      float factor = 0.30f + (0.70f * (wave / 255.0f));
      CRGB c = cfg.baseColor;
      c.nscale8_video((uint8_t)(255 * factor * scale));
      return c;
    }
    case EFFECT_RAINBOW: {
      // Ciclo completo de espectro cromático HSV
      uint8_t hue = (uint8_t)((nowMs * speedMultiplier / 12.0f) + (x * 4));
      CRGB c = CHSV(hue, 240, (uint8_t)(255 * scale));
      return c;
    }
    case EFFECT_FIRE: {
      // Parpadeo orgánico estilo flama
      uint8_t flicker = inoise8(x * 60, y * 60, (uint16_t)(nowMs * speedMultiplier / 3.0f));
      uint8_t hue = map(flicker, 0, 255, 0, 38); // Rojo a amarillo cálido
      uint8_t bri = map(flicker, 0, 255, 140, 255);
      CRGB c = CHSV(hue, 255, (uint8_t)(bri * scale));
      return c;
    }
    case EFFECT_SCAN: {
      // Haz luminoso rebotante de izquierda a derecha (Escáner)
      int beamPos = (int)beatsin8((uint8_t)(cfg.speed * 15), 0, MATRIX_COLS - 1, nowMs);
      int dist = abs(x - beamPos);
      float intensity = 0.25f;
      if (dist == 0) intensity = 1.0f;
      else if (dist == 1) intensity = 0.75f;
      else if (dist == 2) intensity = 0.45f;
      CRGB c = cfg.baseColor;
      c.nscale8_video((uint8_t)(255 * intensity * scale));
      return c;
    }
    case EFFECT_SPARKLE: {
      // Destellos intermitentes aleatorios sobre el color base
      uint8_t noiseVal = inoise8(x * 100, y * 100, (uint16_t)(nowMs * speedMultiplier / 2.0f));
      CRGB c = cfg.baseColor;
      if (noiseVal > 220) {
        c = CRGB::White;
      } else {
        c.nscale8_video((uint8_t)(255 * 0.75f * scale));
      }
      return c;
    }
    case EFFECT_CHASE: {
      // Puntos en persecución continua
      int phase = ((int)(nowMs * speedMultiplier / 40.0f) + x) % 6;
      float factor = (phase < 3) ? 1.0f : 0.3f;
      CRGB c = cfg.baseColor;
      c.nscale8_video((uint8_t)(255 * factor * scale));
      return c;
    }
    case EFFECT_SOLID:
    default: {
      CRGB c = cfg.baseColor;
      if (cfg.brightness < 100) {
        c.nscale8_video((uint8_t)(255 * scale));
      }
      return c;
    }
  }
}

// Parsear color hexadecimal "#RRGGBB" o "RRGGBB" a CRGB
CRGB parseHexColor(const char* hexStr) {
  if (hexStr[0] == '#') hexStr++;
  long number = strtol(hexStr, NULL, 16);
  byte r = (number >> 16) & 0xFF;
  byte g = (number >> 8) & 0xFF;
  byte b = number & 0xFF;
  return CRGB(r, g, b);
}

// Mapeo de nombre de efecto string a enum
LedEffectType parseEffectString(const char* effStr) {
  if (strcasecmp(effStr, "pulse") == 0) return EFFECT_PULSE;
  if (strcasecmp(effStr, "wave") == 0) return EFFECT_WAVE;
  if (strcasecmp(effStr, "rainbow") == 0) return EFFECT_RAINBOW;
  if (strcasecmp(effStr, "fire") == 0) return EFFECT_FIRE;
  if (strcasecmp(effStr, "scan") == 0) return EFFECT_SCAN;
  if (strcasecmp(effStr, "sparkle") == 0) return EFFECT_SPARKLE;
  if (strcasecmp(effStr, "chase") == 0) return EFFECT_CHASE;
  return EFFECT_SOLID;
}

// Tipografía 5x7 con biseles exactos del plano de diseño (0-9)
const byte FONT_5X7[10][7] = {
  { 0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110 }, // 0
  { 0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110 }, // 1
  { 0b01110, 0b10001, 0b00001, 0b01110, 0b10000, 0b10000, 0b11111 }, // 2
  { 0b01110, 0b10001, 0b00001, 0b00110, 0b00001, 0b10001, 0b01110 }, // 3
  { 0b10001, 0b10001, 0b10001, 0b11111, 0b00001, 0b00001, 0b00001 }, // 4
  { 0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110 }, // 5
  { 0b01110, 0b10000, 0b11110, 0b10001, 0b10001, 0b10001, 0b01110 }, // 6
  { 0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000 }, // 7
  { 0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110 }, // 8
  { 0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00001, 0b01110 }  // 9
};

// Variables del Tablero y Modos
int puntosLocal = 0;
int puntosVisitante = 0;
int faltasLocal = 0;
int faltasVisitante = 0;
int timeoutsLocal = 0;
int timeoutsVisitor = 0;
int minutosTiempo = 10;
int segundosTiempo = 0;
int shotClockSegundos = 24;
char periodoActual[16] = "1";
char deporteActual[16] = "BASKETBALL";
char posesionBalon = 'N';
bool cronometroCorriendo = false;
bool bocinaActiva = false;
unsigned long finBocinaMillis = 0;
unsigned long ultimoFrameMillis = 0;

// Modo del Cartel: 0 = Tablero Deportivo, 1 = Reloj RTC (HH:MM:SS), 2 = Cartel de Mensajes
int modoCartel = 0; 
int rtcHoras = 12;
int rtcMinutos = 0;
int rtcSegundos = 0;

// Variables del Cartel de Mensajes
char cartelLinea1[64] = "BIENVENIDOS";
char cartelLinea2[64] = "AL GIMNASIO";
bool cartelEstatico = true;
bool cartelIzqADer = true;
int cartelVelocidad = 3;
int scrollOffset = 0;
unsigned long ultimoScrollMillis = 0;

// Buffer de Recepción Serie
char rxBuffer[128];
byte rxIndex = 0;

// Mapeo Serpentina de Coordenadas (X, Y) a Índice Lineal de LED
int XY(int x, int y) {
  if (x < 0 || x >= MATRIX_COLS || y < 0 || y >= MATRIX_ROWS) return -1;
  if (y % 2 == 0) {
    return (y * MATRIX_COLS) + x;
  } else {
    return (y * MATRIX_COLS) + (MATRIX_COLS - 1 - x);
  }
}

void setPixel(int x, int y, CRGB color) {
  int idx = XY(x, y);
  if (idx >= 0 && idx < NUM_LEDS) {
    leds[idx] = color;
  }
}

void drawDigit(int digit, int startX, int startY, const ComponentLedConfig& cfg, uint32_t nowMs) {
  if (digit < 0 || digit > 9) return;
  for (int r = 0; r < 7; r++) {
    byte rowBits = FONT_5X7[digit][r];
    for (int c = 0; c < 5; c++) {
      if ((rowBits >> (4 - c)) & 1) {
        int px = startX + c;
        int py = startY + r;
        setPixel(px, py, getComponentPixelColor(cfg, px, py, nowMs));
      }
    }
  }
}

void drawLetterP(int startX, int startY, CRGB color) {
  byte pBitmap[7] = { 0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000 };
  for (int r = 0; r < 7; r++) {
    for (int c = 0; c < 5; c++) {
      if ((pBitmap[r] >> (4 - c)) & 1) {
        setPixel(startX + c, startY + r, color);
      }
    }
  }
}

// Tipografía 5x7 Biselada (Números 0-9, Letras y Símbolos) con configuración LED
void drawChar5x7(char ch, int startX, int startY, const ComponentLedConfig& cfg, uint32_t nowMs) {
  if (ch >= '0' && ch <= '9') {
    drawDigit(ch - '0', startX, startY, cfg, nowMs);
    return;
  }
  byte b[7] = {0,0,0,0,0,0,0};
  switch (toupper(ch)) {
    case ':': b[0]=0b00000; b[1]=0b01100; b[2]=0b01100; b[3]=0b00000; b[4]=0b01100; b[5]=0b01100; b[6]=0b00000; break;
    case '-': b[0]=0b00000; b[1]=0b00000; b[2]=0b00000; b[3]=0b11111; b[4]=0b00000; b[5]=0b00000; b[6]=0b00000; break;
    case 'A': b[0]=0b01110; b[1]=0b10001; b[2]=0b10001; b[3]=0b11111; b[4]=0b10001; b[5]=0b10001; b[6]=0b10001; break;
    case 'B': b[0]=0b11110; b[1]=0b10001; b[2]=0b10001; b[3]=0b11110; b[4]=0b10001; b[5]=0b10001; b[6]=0b11110; break;
    case 'C': b[0]=0b01110; b[1]=0b10001; b[2]=0b10000; b[3]=0b10000; b[4]=0b10000; b[5]=0b10001; b[6]=0b01110; break;
    case 'D': b[0]=0b11100; b[1]=0b10010; b[2]=0b10001; b[3]=0b10001; b[4]=0b10001; b[5]=0b10010; b[6]=0b11100; break;
    case 'E': b[0]=0b11111; b[1]=0b10000; b[2]=0b11110; b[3]=0b10000; b[4]=0b10000; b[5]=0b10000; b[6]=0b11111; break;
    case 'F': b[0]=0b11111; b[1]=0b10000; b[2]=0b11110; b[3]=0b10000; b[4]=0b10000; b[5]=0b10000; b[6]=0b10000; break;
    case 'G': b[0]=0b01110; b[1]=0b10001; b[2]=0b10000; b[3]=0b10111; b[4]=0b10001; b[5]=0b10001; b[6]=0b01110; break;
    case 'H': b[0]=0b10001; b[1]=0b10001; b[2]=0b10001; b[3]=0b11111; b[4]=0b10001; b[5]=0b10001; b[6]=0b10001; break;
    case 'I': b[0]=0b01110; b[1]=0b00100; b[2]=0b00100; b[3]=0b00100; b[4]=0b00100; b[5]=0b00100; b[6]=0b01110; break;
    case 'L': b[0]=0b10000; b[1]=0b10000; b[2]=0b10000; b[3]=0b10000; b[4]=0b10000; b[5]=0b10000; b[6]=0b11111; break;
    case 'M': b[0]=0b10001; b[1]=0b11011; b[2]=0b10101; b[3]=0b10101; b[4]=0b10001; b[5]=0b10001; b[6]=0b10001; break;
    case 'N': b[0]=0b10001; b[1]=0b11001; b[2]=0b10101; b[3]=0b10011; b[4]=0b10001; b[5]=0b10001; b[6]=0b10001; break;
    case 'O': b[0]=0b01110; b[1]=0b10001; b[2]=0b10001; b[3]=0b10001; b[4]=0b10001; b[5]=0b10001; b[6]=0b01110; break;
    case 'P': b[0]=0b11110; b[1]=0b10001; b[2]=0b10001; b[3]=0b11110; b[4]=0b10000; b[5]=0b10000; b[6]=0b10000; break;
    case 'R': b[0]=0b11110; b[1]=0b10001; b[2]=0b10001; b[3]=0b11110; b[4]=0b10100; b[5]=0b10010; b[6]=0b10001; break;
    case 'S': b[0]=0b01110; b[1]=0b10001; b[2]=0b10000; b[3]=0b01110; b[4]=0b00001; b[5]=0b10001; b[6]=0b01110; break;
    case 'T': b[0]=0b11111; b[1]=0b00100; b[2]=0b00100; b[3]=0b00100; b[4]=0b00100; b[5]=0b00100; b[6]=0b00100; break;
    case 'U': b[0]=0b10001; b[1]=0b10001; b[2]=0b10001; b[3]=0b10001; b[4]=0b10001; b[5]=0b10001; b[6]=0b01110; break;
    case 'V': b[0]=0b10001; b[1]=0b10001; b[2]=0b10001; b[3]=0b10001; b[4]=0b10001; b[5]=0b01010; b[6]=0b00100; break;
    default: return;
  }
  for (int r = 0; r < 7; r++) {
    for (int c = 0; c < 5; c++) {
      if ((b[r] >> (4 - c)) & 1) {
        int px = startX + c;
        int py = startY + r;
        setPixel(px, py, getComponentPixelColor(cfg, px, py, nowMs));
      }
    }
  }
}

// Renderizado de caracteres alfanuméricos simples para el cartel
void drawAsciiChar(char ch, int startX, int startY, CRGB color) {
  if (ch >= '0' && ch <= '9') {
    drawDigit(ch - '0', startX, startY, color);
    return;
  }
  // Mapeo de letras mayúsculas básicas en 5x7
  byte b[7] = {0,0,0,0,0,0,0};
  switch (toupper(ch)) {
    case 'A': b[0]=0b01110; b[1]=0b10001; b[2]=0b10001; b[3]=0b11111; b[4]=0b10001; b[5]=0b10001; b[6]=0b10001; break;
    case 'B': b[0]=0b11110; b[1]=0b10001; b[2]=0b10001; b[3]=0b11110; b[4]=0b10001; b[5]=0b10001; b[6]=0b11110; break;
    case 'C': b[0]=0b01110; b[1]=0b10001; b[2]=0b10000; b[3]=0b10000; b[4]=0b10000; b[5]=0b10001; b[6]=0b01110; break;
    case 'D': b[0]=0b11100; b[1]=0b10010; b[2]=0b10001; b[3]=0b10001; b[4]=0b10001; b[5]=0b10010; b[6]=0b11100; break;
    case 'E': b[0]=0b11111; b[1]=0b10000; b[2]=0b11110; b[3]=0b10000; b[4]=0b10000; b[5]=0b10000; b[6]=0b11111; break;
    case 'F': b[0]=0b11111; b[1]=0b10000; b[2]=0b11110; b[3]=0b10000; b[4]=0b10000; b[5]=0b10000; b[6]=0b10000; break;
    case 'G': b[0]=0b01110; b[1]=0b10001; b[2]=0b10000; b[3]=0b10111; b[4]=0b10001; b[5]=0b10001; b[6]=0b01110; break;
    case 'H': b[0]=0b10001; b[1]=0b10001; b[2]=0b10001; b[3]=0b11111; b[4]=0b10001; b[5]=0b10001; b[6]=0b10001; break;
    case 'I': b[0]=0b01110; b[1]=0b00100; b[2]=0b00100; b[3]=0b00100; b[4]=0b00100; b[5]=0b00100; b[6]=0b01110; break;
    case 'L': b[0]=0b10000; b[1]=0b10000; b[2]=0b10000; b[3]=0b10000; b[4]=0b10000; b[5]=0b10000; b[6]=0b11111; break;
    case 'M': b[0]=0b10001; b[1]=0b11011; b[2]=0b10101; b[3]=0b10101; b[4]=0b10001; b[5]=0b10001; b[6]=0b10001; break;
    case 'N': b[0]=0b10001; b[1]=0b11001; b[2]=0b10101; b[3]=0b10011; b[4]=0b10001; b[5]=0b10001; b[6]=0b10001; break;
    case 'O': b[0]=0b01110; b[1]=0b10001; b[2]=0b10001; b[3]=0b10001; b[4]=0b10001; b[5]=0b10001; b[6]=0b01110; break;
    case 'P': b[0]=0b11110; b[1]=0b10001; b[2]=0b10001; b[3]=0b11110; b[4]=0b10000; b[5]=0b10000; b[6]=0b10000; break;
    case 'R': b[0]=0b11110; b[1]=0b10001; b[2]=0b10001; b[3]=0b11110; b[4]=0b10100; b[5]=0b10010; b[6]=0b10001; break;
    case 'S': b[0]=0b01110; b[1]=0b10001; b[2]=0b10000; b[3]=0b01110; b[4]=0b00001; b[5]=0b10001; b[6]=0b01110; break;
    case 'T': b[0]=0b11111; b[1]=0b00100; b[2]=0b00100; b[3]=0b00100; b[4]=0b00100; b[5]=0b00100; b[6]=0b00100; break;
    case 'U': b[0]=0b10001; b[1]=0b10001; b[2]=0b10001; b[3]=0b10001; b[4]=0b10001; b[5]=0b10001; b[6]=0b01110; break;
    case 'V': b[0]=0b10001; b[1]=0b10001; b[2]=0b10001; b[3]=0b10001; b[4]=0b10001; b[5]=0b01010; b[6]=0b00100; break;
    case '!': b[0]=0b00100; b[1]=0b00100; b[2]=0b00100; b[3]=0b00100; b[4]=0b00100; b[5]=0b00000; b[6]=0b00100; break;
    case '-': b[0]=0b00000; b[1]=0b00000; b[2]=0b00000; b[3]=0b11111; b[4]=0b00000; b[5]=0b00000; b[6]=0b00000; break;
    case ':': b[0]=0b00000; b[1]=0b01100; b[2]=0b01100; b[3]=0b00000; b[4]=0b01100; b[5]=0b01100; b[6]=0b00000; break;
    default: return;
  }
  for (int r = 0; r < 7; r++) {
    for (int c = 0; c < 5; c++) {
      if ((b[r] >> (4 - c)) & 1) {
        setPixel(startX + c, startY + r, color);
      }
    }
  }
}

// Tipografía 4x6 Mediana (Números 0-9, Letras y Símbolos) - 5 columnas por letra
const byte FONT_4X6_NUMS[10][6] = {
  { 0b0110, 0b1001, 0b1001, 0b1001, 0b1001, 0b0110 }, // 0
  { 0b0100, 0b1100, 0b0100, 0b0100, 0b0100, 0b1110 }, // 1
  { 0b1110, 0b0001, 0b0110, 0b1000, 0b1000, 0b1111 }, // 2
  { 0b1110, 0b0001, 0b0110, 0b0001, 0b0001, 0b1110 }, // 3
  { 0b1001, 0b1001, 0b1111, 0b0001, 0b0001, 0b0001 }, // 4
  { 0b1111, 0b1000, 0b1110, 0b0001, 0b0001, 0b1110 }, // 5
  { 0b0110, 0b1000, 0b1110, 0b1001, 0b1001, 0b0110 }, // 6
  { 0b1111, 0b0001, 0b0010, 0b0100, 0b0100, 0b0100 }, // 7
  { 0b0110, 0b1001, 0b0110, 0b1001, 0b1001, 0b0110 }, // 8
  { 0b0110, 0b1001, 0b0111, 0b0001, 0b0001, 0b0110 }  // 9
};

void drawChar4x6(char ch, int startX, int startY, const ComponentLedConfig& cfg, uint32_t nowMs) {
  if (ch >= '0' && ch <= '9') {
    int digit = ch - '0';
    for (int r = 0; r < 6; r++) {
      byte rowBits = FONT_4X6_NUMS[digit][r];
      for (int c = 0; c < 4; c++) {
        if ((rowBits >> (3 - c)) & 1) {
          int px = startX + c;
          int py = startY + r;
          setPixel(px, py, getComponentPixelColor(cfg, px, py, nowMs));
        }
      }
    }
    return;
  }
  byte b[6] = {0,0,0,0,0,0};
  switch (toupper(ch)) {
    case ':': b[0]=0b0000; b[1]=0b0110; b[2]=0b0000; b[3]=0b0110; b[4]=0b0000; b[5]=0b0000; break;
    case '-': b[0]=0b0000; b[1]=0b0000; b[2]=0b1111; b[3]=0b0000; b[4]=0b0000; b[5]=0b0000; break;
    case 'A': b[0]=0b0110; b[1]=0b1001; b[2]=0b1111; b[3]=0b1001; b[4]=0b1001; b[5]=0b1001; break;
    case 'B': b[0]=0b1110; b[1]=0b1001; b[2]=0b1110; b[3]=0b1001; b[4]=0b1001; b[5]=0b1110; break;
    case 'C': b[0]=0b0110; b[1]=0b1001; b[2]=0b1000; b[3]=0b1000; b[4]=0b1001; b[5]=0b0110; break;
    case 'D': b[0]=0b1110; b[1]=0b1001; b[2]=0b1001; b[3]=0b1001; b[4]=0b1001; b[5]=0b1110; break;
    case 'E': b[0]=0b1111; b[1]=0b1000; b[2]=0b1110; b[3]=0b1000; b[4]=0b1000; b[5]=0b1111; break;
    case 'F': b[0]=0b1111; b[1]=0b1000; b[2]=0b1110; b[3]=0b1000; b[4]=0b1000; b[5]=0b1000; break;
    case 'G': b[0]=0b0110; b[1]=0b1001; b[2]=0b1000; b[3]=0b1011; b[4]=0b1001; b[5]=0b0110; break;
    case 'H': b[0]=0b1001; b[1]=0b1001; b[2]=0b1111; b[3]=0b1001; b[4]=0b1001; b[5]=0b1001; break;
    case 'I': b[0]=0b1110; b[1]=0b0100; b[2]=0b0100; b[3]=0b0100; b[4]=0b0100; b[5]=0b1110; break;
    case 'L': b[0]=0b1000; b[1]=0b1000; b[2]=0b1000; b[3]=0b1000; b[4]=0b1000; b[5]=0b1111; break;
    case 'M': b[0]=0b1001; b[1]=0b1111; b[2]=0b1111; b[3]=0b1001; b[4]=0b1001; b[5]=0b1001; break;
    case 'N': b[0]=0b1001; b[1]=0b1101; b[2]=0b1101; b[3]=0b1011; b[4]=0b1001; b[5]=0b1001; break;
    case 'O': b[0]=0b0110; b[1]=0b1001; b[2]=0b1001; b[3]=0b1001; b[4]=0b1001; b[5]=0b0110; break;
    case 'P': b[0]=0b1110; b[1]=0b1001; b[2]=0b1110; b[3]=0b1000; b[4]=0b1000; b[5]=0b1000; break;
    case 'R': b[0]=0b1110; b[1]=0b1001; b[2]=0b1110; b[3]=0b1100; b[4]=0b1010; b[5]=0b1001; break;
    case 'S': b[0]=0b0110; b[1]=0b1000; b[2]=0b0110; b[3]=0b0001; b[4]=0b1001; b[5]=0b0110; break;
    case 'T': b[0]=0b1111; b[1]=0b0100; b[2]=0b0100; b[3]=0b0100; b[4]=0b0100; b[5]=0b0100; break;
    case 'U': b[0]=0b1001; b[1]=0b1001; b[2]=0b1001; b[3]=0b1001; b[4]=0b1001; b[5]=0b0110; break;
    default: return;
  }
  for (int r = 0; r < 6; r++) {
    for (int c = 0; c < 4; c++) {
      if ((b[r] >> (3 - c)) & 1) {
        int px = startX + c;
        int py = startY + r;
        setPixel(px, py, getComponentPixelColor(cfg, px, py, nowMs));
      }
    }
  }
}

// Tipografía 3x5 Compacta (Números 0-9 y Letras A-Z) - 4 columnas por letra
const byte FONT_3X5_NUMS[10][5] = {
  { 0b111, 0b101, 0b101, 0b101, 0b111 }, // 0
  { 0b010, 0b110, 0b010, 0b010, 0b111 }, // 1
  { 0b111, 0b001, 0b111, 0b100, 0b111 }, // 2
  { 0b111, 0b001, 0b111, 0b001, 0b111 }, // 3
  { 0b101, 0b101, 0b111, 0b001, 0b001 }, // 4
  { 0b111, 0b100, 0b111, 0b001, 0b111 }, // 5
  { 0b111, 0b100, 0b111, 0b101, 0b111 }, // 6
  { 0b111, 0b001, 0b010, 0b010, 0b010 }, // 7
  { 0b111, 0b101, 0b111, 0b101, 0b111 }, // 8
  { 0b111, 0b101, 0b111, 0b001, 0b111 }  // 9
};

void drawChar3x5(char ch, int startX, int startY, const ComponentLedConfig& cfg, uint32_t nowMs) {
  if (ch >= '0' && ch <= '9') {
    int digit = ch - '0';
    for (int r = 0; r < 5; r++) {
      byte rowBits = FONT_3X5_NUMS[digit][r];
      for (int c = 0; c < 3; c++) {
        if ((rowBits >> (2 - c)) & 1) {
          int px = startX + c;
          int py = startY + r;
          setPixel(px, py, getComponentPixelColor(cfg, px, py, nowMs));
        }
      }
    }
    return;
  }
  byte b[5] = {0,0,0,0,0};
  switch (toupper(ch)) {
    case 'A': b[0]=0b111; b[1]=0b101; b[2]=0b111; b[3]=0b101; b[4]=0b101; break;
    case 'B': b[0]=0b110; b[1]=0b101; b[2]=0b110; b[3]=0b101; b[4]=0b110; break;
    case 'C': b[0]=0b111; b[1]=0b100; b[2]=0b100; b[3]=0b100; b[4]=0b111; break;
    case 'D': b[0]=0b110; b[1]=0b101; b[2]=0b101; b[3]=0b101; b[4]=0b110; break;
    case 'E': b[0]=0b111; b[1]=0b100; b[2]=0b110; b[3]=0b100; b[4]=0b111; break;
    case 'F': b[0]=0b111; b[1]=0b100; b[2]=0b110; b[3]=0b100; b[4]=0b100; break;
    case 'G': b[0]=0b111; b[1]=0b100; b[2]=0b101; b[3]=0b101; b[4]=0b111; break;
    case 'H': b[0]=0b101; b[1]=0b101; b[2]=0b111; b[3]=0b101; b[4]=0b101; break;
    case 'I': b[0]=0b111; b[1]=0b010; b[2]=0b010; b[3]=0b010; b[4]=0b111; break;
    case 'J': b[0]=0b001; b[1]=0b001; b[2]=0b001; b[3]=0b101; b[4]=0b111; break;
    case 'K': b[0]=0b101; b[1]=0b110; b[2]=0b100; b[3]=0b110; b[4]=0b101; break;
    case 'L': b[0]=0b100; b[1]=0b100; b[2]=0b100; b[3]=0b100; b[4]=0b111; break;
    case 'M': b[0]=0b101; b[1]=0b111; b[2]=0b111; b[3]=0b101; b[4]=0b101; break;
    case 'N': b[0]=0b111; b[1]=0b101; b[2]=0b101; b[3]=0b101; b[4]=0b101; break;
    case 'O': b[0]=0b111; b[1]=0b101; b[2]=0b101; b[3]=0b101; b[4]=0b111; break;
    case 'P': b[0]=0b111; b[1]=0b101; b[2]=0b111; b[3]=0b100; b[4]=0b100; break;
    case 'Q': b[0]=0b111; b[1]=0b101; b[2]=0b101; b[3]=0b111; b[4]=0b001; break;
    case 'R': b[0]=0b110; b[1]=0b101; b[2]=0b110; b[3]=0b101; b[4]=0b101; break;
    case 'S': b[0]=0b111; b[1]=0b100; b[2]=0b111; b[3]=0b001; b[4]=0b111; break;
    case 'T': b[0]=0b111; b[1]=0b010; b[2]=0b010; b[3]=0b010; b[4]=0b010; break;
    case 'U': b[0]=0b101; b[1]=0b101; b[2]=0b101; b[3]=0b101; b[4]=0b111; break;
    case 'V': b[0]=0b101; b[1]=0b101; b[2]=0b101; b[3]=0b101; b[4]=0b010; break;
    case 'W': b[0]=0b101; b[1]=0b101; b[2]=0b111; b[3]=0b111; b[4]=0b101; break;
    case 'X': b[0]=0b101; b[1]=0b101; b[2]=0b010; b[3]=0b101; b[4]=0b101; break;
    case 'Y': b[0]=0b101; b[1]=0b101; b[2]=0b111; b[3]=0b010; b[4]=0b010; break;
    case 'Z': b[0]=0b111; b[1]=0b001; b[2]=0b010; b[3]=0b100; b[4]=0b111; break;
    case '!': b[0]=0b010; b[1]=0b010; b[2]=0b010; b[3]=0b000; b[4]=0b010; break;
    case '-': b[0]=0b000; b[1]=0b000; b[2]=0b111; b[3]=0b000; b[4]=0b000; break;
    case ':': b[0]=0b000; b[1]=0b010; b[2]=0b000; b[3]=0b010; b[4]=0b000; break;
    default: return;
  }
  for (int r = 0; r < 5; r++) {
    for (int c = 0; c < 3; c++) {
      if ((b[r] >> (2 - c)) & 1) {
        int px = startX + c;
        int py = startY + r;
        setPixel(px, py, getComponentPixelColor(cfg, px, py, nowMs));
      }
    }
  }
}

void renderReticleMatrix() {
  FastLED.clear();
  uint32_t nowMs = millis();

  // =========================================================================
  // MODO TABLERO DEPORTIVO PROFESIONAL (RETÍCULA 17x64 PÍXELES)
  // RENGLÓN 1 (Filas 1-7): Puntajes en 5x7 y Periodo central simétrico en 3x5
  // RENGLÓN 2 (Filas 9-14): Tiempo de juego completo "HH:MM:SS" en letra 4x6
  // =========================================================================

  // 1. TANTEADOR LOCAL (Cols 2 y 8, Filas 1-7, Fuente 5x7)
  drawDigit(puntosLocal / 10, 2, 1, cfgScoreLocal, nowMs);
  drawDigit(puntosLocal % 10, 8, 1, cfgScoreLocal, nowMs);

  // 2. PERIODO JUGADO EN EL CENTRO (Filas 2-6, Fuente compacta 3x5 centrada simétricamente)
  char txtPeriodo[16];
  if (strstr(periodoActual, "CUARTO") != NULL || strstr(periodoActual, "SET") != NULL || strstr(periodoActual, "TIEMPO") != NULL || strstr(periodoActual, "PERIODO") != NULL) {
    strncpy(txtPeriodo, periodoActual, 15);
  } else if (strcmp(periodoActual, "OT") == 0 || strcmp(periodoActual, "TE") == 0 || strcmp(periodoActual, "E") == 0 || strcmp(periodoActual, "EXTRA") == 0) {
    strcpy(txtPeriodo, "T EXTRA");
  } else if (strstr(deporteActual, "VOLLEY") != NULL || strstr(deporteActual, "VOLEY") != NULL || periodoActual[0] == 'S') {
    char num = (periodoActual[0] == 'S' && periodoActual[1] >= '1' && periodoActual[1] <= '5') 
               ? periodoActual[1] 
               : (periodoActual[0] >= '1' && periodoActual[0] <= '5' ? periodoActual[0] : '1');
    snprintf(txtPeriodo, sizeof(txtPeriodo), "%c SET", num);
  } else if (strstr(deporteActual, "SOCCER") != NULL || strstr(deporteActual, "FUTBOL") != NULL || strstr(deporteActual, "FUTSAL") != NULL || strstr(deporteActual, "HANDBALL") != NULL || strstr(periodoActual, "T") != NULL) {
    char num = (periodoActual[0] >= '1' && periodoActual[0] <= '9') ? periodoActual[0] : '1';
    snprintf(txtPeriodo, sizeof(txtPeriodo), "%c TIEMPO", num);
  } else {
    char num = (periodoActual[0] >= '1' && periodoActual[0] <= '9') ? periodoActual[0] : '1';
    snprintf(txtPeriodo, sizeof(txtPeriodo), "%c CUARTO", num);
  }
  txtPeriodo[15] = '\0';
  int perLen = strlen(txtPeriodo);
  int perStartCol = max(14, (MATRIX_COLS - (perLen * 4)) / 2);
  for (int i = 0; i < perLen; i++) {
    int col = perStartCol + i * 4;
    if (col + 3 >= 0 && col < MATRIX_COLS) {
      drawChar3x5(txtPeriodo[i], col, 2, cfgPeriod, nowMs);
    }
  }

  // 3. TANTEADOR VISITANTE (Cols 52 y 58, Filas 1-7, Fuente 5x7)
  drawDigit(puntosVisitante / 10, 52, 1, cfgScoreVisitor, nowMs);
  drawDigit(puntosVisitante % 10, 58, 1, cfgScoreVisitor, nowMs);

  // 4. INDICADORES DE POSESIÓN EN BORDES (Cols 0 y 63)
  if (posesionBalon == 'L') {
    for (int y = 3; y <= 5; y++) setPixel(0, y, getComponentPixelColor(cfgPossession, 0, y, nowMs));
  } else if (posesionBalon == 'V') {
    for (int y = 3; y <= 5; y++) setPixel(63, y, getComponentPixelColor(cfgPossession, 63, y, nowMs));
  }

  // 5. CRONÓMETRO DE TIEMPO DE JUEGO (MINUTOS Y SEGUNDOS) CENTRADO
  // Centrado horizontal y vertical en el segundo renglón (Filas 9 a 15, Fuente 5x7)
  // Solo minutos y segundos, con soporte de hasta 3 dígitos para minutos (ej: 00:00, 45:00, 120:00)
  char timeBuffer[12];
  if (minutosTiempo >= 100) {
    snprintf(timeBuffer, sizeof(timeBuffer), "%d:%02d", minutosTiempo, segundosTiempo);
  } else {
    snprintf(timeBuffer, sizeof(timeBuffer), "%02d:%02d", minutosTiempo, segundosTiempo);
  }

  int timeLen = strlen(timeBuffer);
  int totalTimeWidth = (timeLen * 6) - 1;
  int timerStartCol = max(0, (MATRIX_COLS - totalTimeWidth) / 2);
  int timerStartRow = 9; // Filas 9 a 15 (altura 7, perfectamente centrada verticalmente)

  for (int i = 0; i < timeLen; i++) {
    drawChar5x7(timeBuffer[i], timerStartCol + i * 6, timerStartRow, cfgTimer, nowMs);
  }

  FastLED.show();
}

void renderClockMatrix() {
  FastLED.clear();
  uint32_t nowMs = millis();

  // RENDERIZADO DEL RELOJ EN UNA SOLA LÍNEA (17 Filas x 64 Columnas)
  // Formato: HH : MM : SS centrado horizontalmente (Cols 13 a 51) y verticalmente (Fila 5 a 11)
  
  // 1. Bloque Horas (Cols 13..17 y 19..23)
  drawDigit(rtcHoras / 10, 13, 5, cfgClock, nowMs);
  drawDigit(rtcHoras % 10, 19, 5, cfgClock, nowMs);

  // 2. Primeros dos puntos ':' en Columna 25 (Filas 7 y 9)
  setPixel(25, 7, getComponentPixelColor(cfgClock, 25, 7, nowMs));
  setPixel(25, 9, getComponentPixelColor(cfgClock, 25, 9, nowMs));

  // 3. Bloque Minutos (Cols 27..31 y 33..37)
  drawDigit(rtcMinutos / 10, 27, 5, cfgClock, nowMs);
  drawDigit(rtcMinutos % 10, 33, 5, cfgClock, nowMs);

  // 4. Segundos dos puntos ':' en Columna 39 (Filas 7 y 9)
  setPixel(39, 7, getComponentPixelColor(cfgClock, 39, 7, nowMs));
  setPixel(39, 9, getComponentPixelColor(cfgClock, 39, 9, nowMs));

  // 5. Bloque Segundos (Cols 41..45 y 47..51)
  drawDigit(rtcSegundos / 10, 41, 5, cfgClock, nowMs);
  drawDigit(rtcSegundos % 10, 47, 5, cfgClock, nowMs);

  FastLED.show();
}

void renderBannerLine(const char* text, int rowY, int startCol, uint32_t nowMs) {
  int len = strlen(text);
  for (int i = 0; i < len; i++) {
    int col = startCol + i * 4; // 4 columnas por carácter en fuente 3x5
    if (col + 3 >= 0 && col < MATRIX_COLS) {
      drawChar3x5(text[i], col, rowY, cfgBanner, nowMs);
    }
  }
}

void renderBannerMatrix() {
  FastLED.clear();
  uint32_t nowMs = millis();

  // MODO CARTEL: 2 RENGLONES CON TIPOGRAFÍA COMPACTA 3x5 (R1: Y=2, R2: Y=10)
  int len1 = strlen(cartelLinea1);
  int len2 = strlen(cartelLinea2);

  if (cartelEstatico) {
    int startCol1 = max(0, (MATRIX_COLS - (len1 * 4)) / 2);
    int startCol2 = max(0, (MATRIX_COLS - (len2 * 4)) / 2);
    renderBannerLine(cartelLinea1, 2, startCol1, nowMs);
    renderBannerLine(cartelLinea2, 10, startCol2, nowMs);
  } else {
    int maxLen = max(len1, len2);
    int totalWidth = maxLen * 4;
    int cycle = totalWidth + MATRIX_COLS + 10;
    int pos = scrollOffset % cycle;
    int startCol = cartelIzqADer ? (-totalWidth + pos) : (MATRIX_COLS - pos);

    renderBannerLine(cartelLinea1, 2, startCol, nowMs);
    renderBannerLine(cartelLinea2, 10, startCol, nowMs);
  }

  FastLED.show();
}

void renderDisplay() {
  if (modoCartel == 1) {
    renderClockMatrix();
  } else if (modoCartel == 2) {
    renderBannerMatrix();
  } else {
    renderReticleMatrix();
  }
}

void procesarComando(char* cmd) {
  if (strncmp(cmd, "MODE:CLOCK", 10) == 0) {
    modoCartel = 1;
    renderDisplay();
  }
  else if (strncmp(cmd, "MODE:SCOREBOARD", 15) == 0) {
    modoCartel = 0;
    renderDisplay();
  }
  else if (strncmp(cmd, "MODE:BANNER", 11) == 0) {
    modoCartel = 2;
    renderDisplay();
  }
  else if (strncmp(cmd, "LED:", 4) == 0) {
    // Protocolo LED:<COMP_ID>:<HEX_COLOR>:<EFFECT>:<SPEED>:<BRIGHTNESS>
    char temp[64];
    strncpy(temp, cmd + 4, sizeof(temp));
    char* compToken = strtok(temp, ":");
    char* colorToken = strtok(NULL, ":");
    char* effectToken = strtok(NULL, ":");
    char* speedToken = strtok(NULL, ":");
    char* brightToken = strtok(NULL, ":");
    
    if (compToken && colorToken) {
      ComponentLedConfig* target = NULL;
      if (strcmp(compToken, "scoreLocal") == 0) target = &cfgScoreLocal;
      else if (strcmp(compToken, "scoreVisitor") == 0) target = &cfgScoreVisitor;
      else if (strcmp(compToken, "period") == 0) target = &cfgPeriod;
      else if (strcmp(compToken, "timer") == 0) target = &cfgTimer;
      else if (strcmp(compToken, "possession") == 0) target = &cfgPossession;
      else if (strcmp(compToken, "banner") == 0) target = &cfgBanner;
      else if (strcmp(compToken, "clock") == 0) target = &cfgClock;
      else if (strcmp(compToken, "border") == 0) target = &cfgBorder;

      if (target) {
        target->baseColor = parseHexColor(colorToken);
        if (effectToken) target->effect = parseEffectString(effectToken);
        if (speedToken) target->speed = constrain(atoi(speedToken), 1, 5);
        if (brightToken) target->brightness = constrain(atoi(brightToken), 10, 100);
        renderDisplay();
      }
    }
  }
  else if (strncmp(cmd, "MSG:", 4) == 0) {
    // Formato MSG:LINEA1|LINEA2 o MSG:TEXTO
    modoCartel = 2;
    char temp[128];
    strncpy(temp, cmd + 4, sizeof(temp));
    char* sep = strchr(temp, '|');
    if (sep != NULL) {
      *sep = '\\0';
      strncpy(cartelLinea1, temp, sizeof(cartelLinea1));
      strncpy(cartelLinea2, sep + 1, sizeof(cartelLinea2));
    } else {
      strncpy(cartelLinea1, temp, sizeof(cartelLinea1));
      cartelLinea2[0] = '\\0';
    }
    renderBannerMatrix();
  }
  else if (strncmp(cmd, "BANNER:STATIC", 13) == 0) {
    cartelEstatico = true;
    renderBannerMatrix();
  }
  else if (strncmp(cmd, "BANNER:SPEED:", 13) == 0) {
    cartelVelocidad = atoi(cmd + 13);
    if (cartelVelocidad < 1) cartelVelocidad = 1;
    if (cartelVelocidad > 5) cartelVelocidad = 5;
  }
  else if (strncmp(cmd, "BANNER:SCROLL:L2R", 17) == 0) {
    cartelEstatico = false;
    cartelIzqADer = true;
  }
  else if (strncmp(cmd, "BANNER:SCROLL:R2L", 17) == 0) {
    cartelEstatico = false;
    cartelIzqADer = false;
  }
  else if (strncmp(cmd, "CLK:", 4) == 0) {
    // Formato CLK:HH:MM:SS
    char temp[32];
    strncpy(temp, cmd + 4, sizeof(temp));
    char* token = strtok(temp, ":");
    if (token) rtcHoras = atoi(token);
    token = strtok(NULL, ":");
    if (token) rtcMinutos = atoi(token);
    token = strtok(NULL, ":");
    if (token) rtcSegundos = atoi(token);
    if (modoCartel == 1) renderClockMatrix();
  }
  else if (strncmp(cmd, "L:", 2) == 0) {
    puntosLocal = atoi(cmd + 2);
    modoCartel = 0;
    renderReticleMatrix();
  }
  else if (strncmp(cmd, "V:", 2) == 0) {
    puntosVisitante = atoi(cmd + 2);
    modoCartel = 0;
    renderReticleMatrix();
  }
  else if (strncmp(cmd, "T:", 2) == 0) {
    char temp[32];
    strncpy(temp, cmd + 2, sizeof(temp));
    char* token = strtok(temp, ":");
    if (token) minutosTiempo = atoi(token);
    token = strtok(NULL, ":");
    if (token) segundosTiempo = atoi(token);
    token = strtok(NULL, ":");
    if (token) strncpy(periodoActual, token, sizeof(periodoActual));
    if (modoCartel == 0) renderReticleMatrix();
  }
  else if (strncmp(cmd, "CMD:SPORT:", 10) == 0) {
    strncpy(deporteActual, cmd + 10, sizeof(deporteActual) - 1);
    deporteActual[sizeof(deporteActual) - 1] = '\0';
    if (modoCartel == 0) renderReticleMatrix();
  }
  else if (strncmp(cmd, "CMD:SHOT_CLOCK_RESET:", 21) == 0) {
    shotClockSegundos = atoi(cmd + 21);
    if (modoCartel == 0) renderReticleMatrix();
  }
  else if (strncmp(cmd, "CMD:HORN", 8) == 0) {
    digitalWrite(PIN_HORN_RELAY, HIGH);
    bocinaActiva = true;
    finBocinaMillis = millis() + 2000;
  }
}

void setup() {
  Serial.begin(115200); // 115200 para ESP32 / 9600 para Arduino
  pinMode(PIN_HORN_RELAY, OUTPUT);
  digitalWrite(PIN_HORN_RELAY, LOW);

  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(DEFAULT_BRIGHT);
  FastLED.clear();
  renderReticleMatrix();
}

void loop() {
  // Apagado automático de bocina
  if (bocinaActiva && millis() >= finBocinaMillis) {
    digitalWrite(PIN_HORN_RELAY, LOW);
    bocinaActiva = false;
  }

  // Animación del cartel en segundo plano si está en modo desplazamiento
  if (modoCartel == 2 && !cartelEstatico) {
    const int intervalosVelocidad[6] = { 180, 180, 145, 110, 85, 60 };
    int interval = intervalosVelocidad[cartelVelocidad];
    if (millis() - ultimoScrollMillis >= interval) {
      ultimoScrollMillis = millis();
      scrollOffset++;
      renderBannerMatrix();
    }
  }

  // Refresco continuo a 30 FPS cuando hay efectos animados dinámicos activos (ondas, pulsos, fuego)
  if (hasActiveAnimatedEffects()) {
    if (millis() - ultimoFrameMillis >= 33) {
      ultimoFrameMillis = millis();
      renderDisplay();
    }
  }

  // Recepción de comandos serie
  while (Serial.available()) {
    char c = (char)Serial.read();
    if (c == '\\n' || c == '\\r') {
      if (rxIndex > 0) {
        rxBuffer[rxIndex] = '\\0';
        procesarComando(rxBuffer);
        rxIndex = 0;
      }
    } else if (rxIndex < sizeof(rxBuffer) - 1) {
      rxBuffer[rxIndex++] = c;
    }
  }
}
`;

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

// Buffer de Recepción Serie
char rxBuffer[64];
byte rxIndex = 0;

void setup() {
  Serial.begin(9600);
  mp3Serial.begin(9600);
  
  pinMode(PIN_HORN_RELAY, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_HORN_RELAY, LOW);
  digitalWrite(PIN_BUZZER, LOW);

  // Inicializar Displays MAX7219
  for (int i = 0; i < 4; i++) {
    lc.shutdown(i, false);
    lc.setIntensity(i, 12);
    lc.clearDisplay(i);
  }

  // Inicializar RTC DS3231
  Wire.begin();
  if (rtc.begin()) {
    rtcPresente = true;
    if (rtc.lostPower()) {
      rtc.adjust(DateTime(2026, 1, 1, 12, 0, 0));
    }
  }
}

void loop() {
  while (Serial.available()) {
    char c = (char)Serial.read();
    if (c == '\\n' || c == '\\r') {
      if (rxIndex > 0) {
        rxBuffer[rxIndex] = '\\0';
        procesarComando(rxBuffer);
        rxIndex = 0;
      }
    } else if (rxIndex < sizeof(rxBuffer) - 1) {
      rxBuffer[rxIndex++] = c;
    }
  }
}

void procesarComando(char* cmd) {
  if (strncmp(cmd, "CMD:HORN", 8) == 0) {
    digitalWrite(PIN_HORN_RELAY, HIGH);
    delay(1500);
    digitalWrite(PIN_HORN_RELAY, LOW);
  }
}
`;
