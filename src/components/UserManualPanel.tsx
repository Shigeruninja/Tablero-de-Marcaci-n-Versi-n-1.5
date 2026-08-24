import React, { useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  Trophy, 
  Clock, 
  Radio, 
  Keyboard, 
  Volume2, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Terminal, 
  ShieldCheck,
  Search,
  Download,
  Share2,
  Laptop,
  Smartphone,
  Sparkles,
  Music,
  Sliders
} from 'lucide-react';
import { sounds } from '../utils/audio';

export const UserManualPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('intro');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    sounds.playClick();
    setTimeout(() => setCopiedText(null), 2000);
  };

  const sections = [
    { id: 'intro', label: '1. Introducción y Arquitectura', icon: BookOpen },
    { id: 'hardware', label: '2. Matriz LED 17x64 y Tipografías', icon: Cpu },
    { id: 'connection', label: '3. Enlace USB / Bluetooth / WiFi', icon: Radio },
    { id: 'sports', label: '4. Operación por Deporte', icon: Trophy },
    { id: 'clock_shotclock', label: '5. Cronómetro y 24s / 14s', icon: Clock },
    { id: 'macros', label: '6. Macros de Teclado PC y HUD', icon: Keyboard },
    { id: 'audio', label: '7. Sonidos y Plantillas Deportivas', icon: Music },
    { id: 'led_effects', label: '8. Iluminación LED y Efectos RGB', icon: Sparkles },
    { id: 'protocol', label: '9. Protocolo Serie ASCII y Comandos', icon: Terminal },
    { id: 'windows11', label: '10. Instalación en Windows 11 y Android', icon: Laptop },
    { id: 'faq', label: '11. Preguntas Frecuentes y Soluciones', icon: HelpCircle },
  ];

  const filteredSections = sections.filter(s => 
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    searchQuery === ''
  );

  const downloadMarkdownManual = () => {
    const markdownContent = `# 📖 MANUAL DE USUARIO Y GUÍA DE OPERACIÓN OFICIAL
## TABLERO DEPORTIVO MULTIDEPORTE ELECTRÓNICO & CONTROLADOR DE GIMNASIO ESCOLAR
*Versión 2.5 Pro LED Edition - Arduino UNO / Mega / ESP32*

---

### 1. INTRODUCCIÓN Y ARQUITECTURA GENERAL
El Sistema de Tablero Deportivo Escolar es una plataforma profesional de cronometraje, tanteador electrónico y señalización luminosa-acústica diseñada para gimnasios educativos, clubes y polideportivos.
- **Mesa de Control Web (PC / Notebook / Tablet)**: Interfaz reactiva para operadores con reloj de alta precisión, macros de teclado físico, sintetizador Web Audio polifónico, reproductor de audio personalizado y previsualización virtual de la retícula LED.
- **Tablero Físico (Arduino / ESP32)**: Microcontrolador con biblioteca FastLED que gestiona la retícula LED WS2812B de 17 filas x 64 columnas (1088 LEDs), reloj RTC DS3231 con batería y relé de bocina electromecánica de 220V/12V (Pin D8).

---

### 2. MATRIZ RETICULAR LED (17x64 PÍXELES) Y TIPOGRAFÍAS PROPORCIONALES
El cartel luminoso físico (256 cm x 68 cm con celdas de 4cm x 4cm) organiza sus 1088 LEDs en 2 renglones principales con tres familias tipográficas optimizadas para máxima visibilidad desde 50 metros:
1. **Renglón 1 (Filas 1 a 7)**:
   - **Tanteadores Local y Visitante (Cols 2-12 y Cols 52-62)**: Tipografía 5x7 Biselada de alto impacto con 1 píxel de separación.
   - **Periodo Central (Cols 16-48, Filas 2-6)**: Tipografía 3x5 Compacta simétricamente centrada ("1 CUARTO", "2 TIEMPO", "1 SET", "T EXTRA").
   - **Indicadores de Posesión Lateral**: Columnas 0 y 63 en filas 3 a 5.
2. **Renglón 2 (Filas 9 a 15)**:
   - **Cronómetro de Juego Centrado**: Centrado exacto horizontal (eje Columna 32) y vertical (Filas 9 a 15) en Tipografía 5x7 Biselada. Solo contiene minutos y segundos con soporte dinámico de 2 o 3 dígitos para minutos (ej: 00:00, 45:00, 120:00).
3. **Cartel de Mensajes (2 Renglones)**: Renglón 1 en Filas 2 a 6 (Y=2), Renglón 2 en Filas 10 a 14 (Y=10) en tipografía 3x5 con modos estático o desplazamiento continuo.

---

### 3. ENLACE Y COMUNICACIÓN CON EL TABLERO
- **Cable USB Serial Directo (Web Serial API)**: Conectar cable USB, presionar "ENLACE", seleccionar 9600 Baud (Arduino) o 115200 Baud (ESP32) y autorizar el puerto COM en el navegador.
- **Bluetooth Serial (HC-05 / ESP32 BLE)**: Conexión inalámbrica por Web Bluetooth API con hasta 15 metros de alcance.
- **WiFi / Red Local (ESP32 / ESP8266)**: Comunicación mediante endpoints HTTP REST y WebSockets.

---

### 4. OPERACIÓN POR DISCIPLINA DEPORTIVA
- **Básquetbol (FIBA)**: Puntos +1, +2, +3 y -1. Auto-reset de posesión a 24s tras conversión. Alerta de bonus a la 5ª falta colectiva por cuarto. Tiempos muertos oficiales de 60 segundos.
- **Fútbol y Futsal (AFA / FIFA)**: 2 tiempos reglamentarios (45 min o 20 min netos). Registro de tarjetas amarillas y rojas. Tiempo añadido de descuento.
- **Vóleibol**: Control de sets ganados, indicador luminoso de turno de saque/servicio y rotación de sustituciones (máx 6).
- **Handball**: Registro de goles, exclusiones temporales de 2 minutos y aviso de juego pasivo.
- **Gimnasio y Boxeo**: Temporizador de rounds y descansos con campana de boxeo y gong.

---

### 5. CRONÓMETRO Y RELOJ DE POSESIÓN (SHOT CLOCK 24s / 14s)
- **Play / Pausa**: Barra Espaciadora o botón central.
- **Ajustes Rápidos**: +1m, -1m, +10s, -10s para correcciones arbitrales sobre la marcha.
- **Reset 24s (Tecla 1)**: Inicio de posesión ofensiva reglamentaria.
- **Reset 14s (Tecla 2)**: Rebote ofensivo o falta en campo de ataque.
- **Décimas de Segundo**: En el último minuto (< 01:00) el cronómetro pasa automáticamente al modo SS.d.

---

### 6. SISTEMA DE MACROS DE TECLADO PC Y HUD INTERACTIVO
| Función | Tecla por Defecto | Acción |
|---|---|---|
| Play / Pausa | **Espacio** | Arranca / detiene cronómetro |
| Local +1 / +2 / +3 | **Q / W / E** | Suma puntos equipo local |
| Local -1 | **A** | Descuenta 1 punto local |
| Visitante +1 / +2 / +3 | **U / I / O** | Suma puntos visitante |
| Visitante -1 | **J** | Descuenta 1 punto visitante |
| Posesión 24s / 14s | **1 / 2** | Resetea shot clock |
| Bocina de Estadio | **B** | Disparo de chicharra (Relé D8) |
| Silbato Árbitro | **S** | Silbato acústico |
| Órgano / Fanfarria | **O** | Sonido de estadio |
*Todas las teclas son 100% personalizables desde el botón "MACROS PC".*

---

### 7. SISTEMA DE AUDIO, SINTETIZADOR Y SONIDOS PERSONALIZADOS
- **Sintetizador Web Audio API**: Generación en tiempo real de chicharra armónica, silbato, campana de boxeo, órgano de estadio y sirena de gol.
- **Administrador de Sonidos Propios**: Permite subir y reproducir archivos MP3, WAV y OGG para asociarlos a eventos de anotación, tiempo muerto o bocina final.
- **Plantillas Deportivas**: Asignación diferenciada de efectos acústicos según el deporte activo.
- **Relé Físico de Potencia (Pin D8)**: Comando \`CMD:HORN:<ms>\` para activar bocinas electromecánicas de 220V/12V en el techo del gimnasio.

---

### 8. ILUMINACIÓN LED RGB Y EFECTOS DINÁMICOS FASTLED
Permite configurar independientemente cada componente del marcador (Local, Visitante, Periodo, Tiempo, Posesión, Cartel, Reloj, Bordes) con:
- **Color RGB Hexadecimal**: Paleta de colores libres (#00D2FF, #FF323C, #FBBF24, etc.).
- **8 Efectos Visuales Animados**:
  1. *Sólido (Solid)*: Luz constante de alta intensidad.
  2. *Pulso (Breathing)*: Respiración luminosa sinusoidal.
  3. *Onda (Wave)*: Desplazamiento horizontal de ondas de luz.
  4. *Arcoíris (Rainbow)*: Ciclo cromático continuo HSV.
  5. *Fuego Orgánico (Fire)*: Flama cálida mediante ruido Perlin (FastLED inoise8).
  6. *Escáner Cylon (Scan)*: Haz luminoso rebotante estilo Knight Rider.
  7. *Destellos (Sparkle)*: Chispas blancas intermitentes.
  8. *Persecución (Chase)*: Puntos en movimiento secuencial continuo.
- **Presets de Iluminación**: *Clásico Deportivo*, *Neón Cyberpunk*, *Modo Fuego*, *Arcoíris Dinámico*, *Océano Ártico*.

---

### 9. PROTOCOLO SERIE ASCII Y TABLA DE COMANDOS
- \`L:<puntos>\` : Puntos Local (ej: \`L:42\`)
- \`V:<puntos>\` : Puntos Visitante (ej: \`V:38\`)
- \`T:<mm:ss>\` : Tiempo Cronómetro (ej: \`T:08:45\`)
- \`P:<periodo>\` : Periodo (ej: \`P:1 CUARTO\`)
- \`LED:<comp>:<hex>:<effect>:<speed>:<brightness>\` : Configura iluminación LED (ej: \`LED:scoreLocal:#00D2FF:pulse:3:100\`)
- \`CMD:SHOT_CLOCK_RESET:24\` : Resetea posesión a 24 segundos
- \`CMD:HORN:2000\` : Acciona relé de bocina por 2000 milisegundos
- \`CMD:RTC_SYNC:<iso>\` : Sincroniza reloj RTC DS3231
- \`MSG:<linea1>|<linea2>\` : Muestra texto en cartel de 2 renglones

---

### 10. INSTALACIÓN EN WINDOWS 11 Y ANDROID
- **Windows 11 (Notebook / PC de Mesa)**:
  1. Instalación PWA directa desde Chrome o Edge con 1 clic (ícono de instalar en barra de direcciones).
  2. Lanzador de Escritorio \`Iniciar_Tablero_Windows11.bat\` para abrir en modo ventana sin marcos.
  3. Script PowerShell \`Instalar_Tablero_Windows11.ps1\` para crear acceso directo en Escritorio y Menú Inicio.
- **Android (Smartphones y Tablets)**:
  1. Escaneo del Código QR dinámico desde la cámara del celular.
  2. Menú Chrome > "Agregar a la pantalla principal" (WebAPK pantalla completa con Wake Lock para evitar apagado de pantalla).
- **Modo Offline**: Al instalarse, la aplicación almacena los recursos en caché local para funcionar sin conexión a Internet en gimnasios cerrados.

---

### 11. PREGUNTAS FRECUENTES Y DIAGNÓSTICO
- **¿Por qué no responde el puerto serie?** Verifique que ningún otro programa (como Arduino IDE Serial Monitor) tenga abierto el puerto COM y configure 9600 Baud.
- **¿Cómo calibrar el reloj de pared?** En la pestaña "RELOJ OFICIAL", presione "Sincronizar RTC con PC" para enviar la hora exacta del sistema.
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'MANUAL_DE_USUARIO_TABLERO.md';
    link.click();
    URL.revokeObjectURL(url);
    sounds.playWhistle();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6">
      
      {/* CABECERA DEL MANUAL */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-stadium font-black text-white">
                MANUAL DE USUARIO Y GUÍA DE OPERACIÓN
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                v2.5 PRO OFICIAL
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-mono-code">
              Documentación técnica y operativa completa para Mesa de Control y Hardware Arduino/ESP32
            </p>
          </div>
        </div>

        {/* Acciones de Documento */}
        <div className="flex items-center gap-2">
          <button
            onClick={downloadMarkdownManual}
            className="bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/40 px-4 py-2 rounded-xl text-xs font-stadium font-bold flex items-center gap-2 transition shadow-lg"
            title="Descargar archivo Markdown del manual"
          >
            <Download className="w-4 h-4 text-white" />
            <span>DESCARGAR MANUAL .MD</span>
          </button>
        </div>
      </div>

      {/* BUSCADOR Y NAVEGACIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* BARRA LATERAL DE ÍNDICE */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Buscador */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar en el manual..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Lista de Secciones */}
          <div className="space-y-1 bg-slate-950/60 p-2 rounded-2xl border border-slate-800/80">
            {filteredSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveSection(sec.id);
                    sounds.playClick();
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Ficha Resumen Rápido */}
          <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-2xl space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>Atajos Rápidos de Emergencia</span>
            </div>
            <ul className="space-y-1 font-mono-code text-[10px]">
              <li>• <b className="text-white">Espacio:</b> Arrancar / Pausar Reloj</li>
              <li>• <b className="text-white">1 / 2:</b> Reset 24s / 14s Posesión</li>
              <li>• <b className="text-white">B:</b> Bocina / Sirena Estadio</li>
              <li>• <b className="text-white">Q / U:</b> +1 Punto Local / Visitante</li>
            </ul>
          </div>
        </div>

        {/* CONTENIDO DE LA SECCIÓN SELECCIONADA */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 max-h-[750px] overflow-y-auto font-sans text-slate-300 text-xs sm:text-sm leading-relaxed">
          
          {/* SECCIÓN 1: INTRODUCCIÓN */}
          {activeSection === 'intro' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400 font-stadium font-black text-base border-b border-slate-800 pb-2">
                <BookOpen className="w-5 h-5" />
                <span>1. INTRODUCCIÓN Y ARQUITECTURA GENERAL</span>
              </div>
              
              <p>
                El <b>Sistema de Tablero Deportivo Escolar</b> es una plataforma profesional de control de tiempo, tanteador y señalización acústica-luminosa para gimnasios y polideportivos educativos.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                  <h4 className="font-stadium font-bold text-white text-xs text-blue-400">💻 Panel Web de Mesa de Control</h4>
                  <p className="text-xs text-slate-400">
                    Interfaz reactiva para PC, notebooks y tablets con reloj en tiempo real, macros de teclado, sintetizador Web Audio polifónico y vista previa digital del cartel físico.
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                  <h4 className="font-stadium font-bold text-white text-xs text-emerald-400">⚡ Tablero Físico (Arduino / ESP32)</h4>
                  <p className="text-xs text-slate-400">
                    Controlador por microcontrolador con biblioteca FastLED que gobierna la retícula LED WS2812B de 17x64 píxeles, reloj RTC DS3231 con batería y relé de bocina de 220V/12V.
                  </p>
                </div>
              </div>

              <div className="bg-blue-950/30 border border-blue-800/40 p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-blue-300 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  Garantía de Tiempo Real y Autonomía
                </h4>
                <p className="text-xs text-slate-300">
                  El cronómetro utiliza sincronización de alta fidelidad. Si la conexión por cable o inalámbrica se interrumpe temporalmente, el microcontrolador mantiene el tiempo de forma autónoma mediante su temporizador de hardware interno.
                </p>
              </div>
            </div>
          )}

          {/* SECCIÓN 2: MATRIZ LED Y TIPOGRAFÍAS */}
          {activeSection === 'hardware' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-stadium font-black text-base border-b border-slate-800 pb-2">
                <Cpu className="w-5 h-5" />
                <span>2. MATRIZ RETICULAR LED 17x64 Y TIPOGRAFÍAS PROPORCIONALES</span>
              </div>

              <p>
                El cartel físico está construido con una retícula de <b>17 Filas x 64 Columnas</b> (1088 LEDs WS2812B direccionables) dimensionada en 256 cm x 68 cm con celdas de 4cm x 4cm. Emplea tres familias tipográficas desarrolladas específicamente para este formato:
              </p>

              <div className="space-y-3">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold font-mono text-xs flex-shrink-0">5x7</span>
                  <div>
                    <h4 className="font-bold text-white text-xs">Tipografía 5x7 Biselada (Tanteador 0 a 99)</h4>
                    <p className="text-xs text-slate-400">
                      Ubicada en las Filas 1 a 7: Equipo Local (Cols 2 y 8) y Equipo Visitante (Cols 52 y 58). Proporciona máxima visibilidad angular y biseles estéticos precisos.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono text-xs flex-shrink-0">3x5</span>
                  <div>
                    <h4 className="font-bold text-white text-xs">Tipografía 3x5 Compacta (Periodo Central y Cartel de Mensajes)</h4>
                    <p className="text-xs text-slate-400">
                      Permite escribir textos legibles de hasta 16 caracteres estáticos por línea en 64 columnas (4 px de paso por letra). Usada en el centro (Filas 2-6) para "1 CUARTO", "1 SET", "1 TIEMPO" y en el Cartel de Mensajes (Renglón 1: Y=2, Renglón 2: Y=10).
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold font-mono text-xs flex-shrink-0">4x6</span>
                  <div>
                    <h4 className="font-bold text-white text-xs">Tipografía 4x6 Mediana (Cronómetro Completo "HH:MM:SS")</h4>
                    <p className="text-xs text-slate-400">
                      Ubicada en las Filas 9 a 14 (Cols 12 a 50). Representa 8 caracteres ("HH:MM:SS") centrados perfectamente en el renglón inferior de la retícula.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold font-mono text-xs flex-shrink-0">D8</span>
                  <div>
                    <h4 className="font-bold text-white text-xs">Salida a Relé para Sirena / Chicharra de Estadio</h4>
                    <p className="text-xs text-slate-400">
                      Pin digital D8 conectado a módulo relé optoacoplado de 10A para accionar sirenas electromecánicas de 12V DC o 220V AC en el techo del estadio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 3: CONEXIÓN */}
          {activeSection === 'connection' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-stadium font-black text-base border-b border-slate-800 pb-2">
                <Radio className="w-5 h-5" />
                <span>3. ENLACE Y COMUNICACIÓN CON EL TABLERO</span>
              </div>

              <p>El sistema soporta múltiples métodos de transmisión:</p>

              <div className="space-y-3">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2 text-cyan-400">
                    <span>🔌 Cable USB Serial (Recomendado para PC Oficial)</span>
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300">
                    <li>Conecte el cable USB entre la PC y el Arduino / ESP32.</li>
                    <li>Presione el botón <b>ENLACE</b> en la barra superior.</li>
                    <li>Seleccione <b>9600 Baud</b> (Arduino) o <b>115200 Baud</b> (ESP32).</li>
                    <li>Haga clic en <b>Abrir Puerto Serie (Web Serial)</b> y confirme el puerto COM en el diálogo del navegador.</li>
                  </ol>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2 text-blue-400">
                    <span>📡 Bluetooth Inalámbrico (HC-05 / ESP32)</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Ideal para operar desde tablets o notebooks inalámbricas situadas en la mesa de jueces a hasta 15 metros de distancia mediante Web Bluetooth API.
                  </p>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2 text-purple-400">
                    <span>📶 WiFi / Red Local (ESP32)</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Soporte para recepción de tramas mediante WebSockets y endpoints REST en la IP local del tablero.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 4: DEPORTES */}
          {activeSection === 'sports' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-stadium font-black text-base border-b border-slate-800 pb-2">
                <Trophy className="w-5 h-5" />
                <span>4. OPERACIÓN POR DISCIPLINA DEPORTIVA</span>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-400 text-xs">🏀 Básquetbol (Reglamento Oficial FIBA)</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                    <li><b>Puntuación Rápida:</b> +1 (Tiro Libre), +2 (Doble), +3 (Triple) y -1 (Corrección).</li>
                    <li><b>Auto-Corte de Posesión:</b> Al convertir un punto (+1, +2, +3), el reloj de 24s se pausa, resetea a 24s y la posesión pasa automáticamente al rival.</li>
                    <li><b>Alerta de Penalización:</b> Al llegar a la 5ª falta colectiva por cuarto se ilumina el aviso de tiros libres (Bonus).</li>
                    <li><b>Tiempos Muertos:</b> Temporizador oficial de 60 segundos con chicharra automática al finalizar.</li>
                  </ul>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 text-xs">⚽ Fútbol y Futsal (AFA / FIFA)</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                    <li>2 Tiempos de 45 min (Fútbol 11) o 2 Tiempos de 20 min netos (Futsal).</li>
                    <li>Registro de Tarjetas Amarillas y Rojas por bando.</li>
                    <li>Adición de minutos de descuento (+1m, +2m, +3m, +5m).</li>
                  </ul>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-cyan-400 text-xs">🏐 Voleibol</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                    <li>Tanteador de Sets (al mejor de 3 o 5 sets).</li>
                    <li>Indicador luminoso de Turno de Saque / Servicio.</li>
                    <li>Control de Sustituciones (máx 6 por set).</li>
                  </ul>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-rose-400 text-xs">🤾 Handball</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                    <li>Cronómetro de exclusiones de 2 minutos por jugador sancionado.</li>
                    <li>Registro de advertencias y tarjetas azules.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 5: CRONÓMETRO Y SHOT CLOCK */}
          {activeSection === 'clock_shotclock' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-stadium font-black text-base border-b border-slate-800 pb-2">
                <Clock className="w-5 h-5" />
                <span>5. OPERACIÓN DE CRONÓMETRO Y RELOJ DE 24s / 14s</span>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-xs">⏱️ Control del Reloj Principal</h4>
                <p className="text-xs text-slate-300">
                  Puede iniciar o pausar el tiempo con la <b>Barra Espaciadora</b> o con el botón verde central. Los botones <b>+1m</b>, <b>-1m</b>, <b>+10s</b> y <b>-10s</b> permiten correcciones instantáneas autorizadas por los árbitros sin pausar el flujo de juego.
                </p>
                <p className="text-xs text-amber-300">
                  <b>Modo Décimas:</b> Durante el último minuto (&lt; 01:00) el cronómetro conmuta automáticamente a formato <code>SS.d</code> para medir décimas de segundo con máxima precisión arbitral.
                </p>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-amber-400 text-xs">⚡ Reloj de Posesión (Shot Clock)</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                  <li><b>Reset 24s (Tecla 1):</b> Inicio de jugada ofensiva completa.</li>
                  <li><b>Reset 14s (Tecla 2):</b> Tras rebote ofensivo en tiro fallado o falta en campo de ataque.</li>
                  <li><b>Sincronización Automática:</b> Al detener el reloj principal, el reloj de 24s se pausa automáticamente.</li>
                </ul>
              </div>
            </div>
          )}

          {/* SECCIÓN 6: MACROS PC */}
          {activeSection === 'macros' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-stadium font-black text-base border-b border-slate-800 pb-2">
                <Keyboard className="w-5 h-5" />
                <span>6. SISTEMA DE MACROS Y ATAJOS DE TECLADO CONFIGURABLES</span>
              </div>

              <p>
                El sistema permite operar toda la mesa de control a dos manos sin usar el mouse. Las combinaciones son configurables desde el botón <b>MACROS PC</b>:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-stadium text-[10px]">
                    <tr>
                      <th className="p-2 border-b border-slate-800">Función</th>
                      <th className="p-2 border-b border-slate-800">Tecla</th>
                      <th className="p-2 border-b border-slate-800">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono-code text-[11px]">
                    <tr>
                      <td className="p-2 text-white font-bold">Reloj Play / Pausa</td>
                      <td className="p-2 text-amber-400">Espacio</td>
                      <td className="p-2 text-slate-400">Arranca / detiene cronómetro</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-emerald-400">Local: +1 / +2 / +3</td>
                      <td className="p-2 text-amber-400">Q / W / E</td>
                      <td className="p-2 text-slate-400">Suma puntos equipo local</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-emerald-400">Local: -1 Corrección</td>
                      <td className="p-2 text-amber-400">A</td>
                      <td className="p-2 text-slate-400">Descuenta 1 punto local</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-cyan-400">Visitante: +1 / +2 / +3</td>
                      <td className="p-2 text-amber-400">U / I / O</td>
                      <td className="p-2 text-slate-400">Suma puntos visitante</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-cyan-400">Visitante: -1 Corrección</td>
                      <td className="p-2 text-amber-400">J</td>
                      <td className="p-2 text-slate-400">Descuenta 1 punto visitante</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-rose-400">Posesión: 24s / 14s</td>
                      <td className="p-2 text-amber-400">1 / 2</td>
                      <td className="p-2 text-slate-400">Reset de shot clock</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-amber-400">Bocina / Sirena</td>
                      <td className="p-2 text-amber-400">B</td>
                      <td className="p-2 text-slate-400">Disparo manual de chicharra</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-white">Silbato Árbitro</td>
                      <td className="p-2 text-amber-400">S</td>
                      <td className="p-2 text-slate-400">Silbato acústico</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-purple-400">Órgano Estadio</td>
                      <td className="p-2 text-amber-400">O</td>
                      <td className="p-2 text-slate-400">Fanfarria acústica de estadio</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECCIÓN 7: AUDIO Y SONIDOS PERSONALIZADOS */}
          {activeSection === 'audio' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-stadium font-black text-base border-b border-slate-800 pb-2">
                <Music className="w-5 h-5" />
                <span>7. SISTEMA DE AUDIO, SINTETIZADOR Y SONIDOS PERSONALIZADOS</span>
              </div>

              <p>El sistema cuenta con un motor de audio híbrido:</p>

              <div className="space-y-3">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-xs text-amber-400">🎵 Administrador de Sonidos Propios (MP3 / WAV / OGG)</h4>
                  <p className="text-xs text-slate-300">
                    Desde el botón <b>SONIDOS & PLANTILLAS</b> puede cargar archivos de audio locales y asignarlos a eventos como Goles, Dobles/Triples, Tiempos Muertos o Fin de Periodo.
                  </p>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-xs text-blue-400">🏆 Plantillas Acústicas por Deporte</h4>
                  <p className="text-xs text-slate-300">
                    Cada disciplina tiene su propio esquema sonoro preconfigurado:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
                    <li><b>Básquet:</b> Chicharra armónica de 440/880Hz, órgano "Charge!" y silbato de falta.</li>
                    <li><b>Fútbol:</b> Sirena de gol de estadio, silbato largo de árbitro y toques de tarjeta.</li>
                    <li><b>Boxeo / Gym:</b> Campana de round metálica y gong de descanso.</li>
                  </ul>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-xs text-emerald-400">📢 Relé Físico de Bocina (Pin D8)</h4>
                  <p className="text-xs text-slate-300">
                    Envío del comando <code>CMD:HORN:2000</code> al Arduino para accionar la chicharra física instalada en la pared del gimnasio.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 8: ILUMINACIÓN LED Y EFECTOS */}
          {activeSection === 'led_effects' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-pink-400 font-stadium font-black text-base border-b border-slate-800 pb-2">
                <Sparkles className="w-5 h-5" />
                <span>8. ILUMINACIÓN LED RGB Y EFECTOS DINÁMICOS FASTLED</span>
              </div>

              <p>
                Permite configurar de forma individual el color RGB (Hexadecimal), efecto de animación, velocidad (1-5) y brillo (10-100%) para cada bloque del tablero:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <b className="text-white text-xs">1. Sólido (Solid):</b>
                  <p className="text-xs text-slate-400">Iluminación uniforme continua de alta visibilidad.</p>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <b className="text-cyan-400 text-xs">2. Pulso (Breathing):</b>
                  <p className="text-xs text-slate-400">Efecto de respiración sinusoidal suave en intensidad.</p>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <b className="text-blue-400 text-xs">3. Onda (Wave):</b>
                  <p className="text-xs text-slate-400">Onda lumínica espacial que se desplaza horizontalmente.</p>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <b className="text-purple-400 text-xs">4. Arcoíris (Rainbow):</b>
                  <p className="text-xs text-slate-400">Ciclo cromático completo continuo en espacio HSV.</p>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <b className="text-red-400 text-xs">5. Fuego Orgánico (Fire):</b>
                  <p className="text-xs text-slate-400">Simulación de flamas de fuego cálido con ruido Perlin inoise8.</p>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <b className="text-amber-400 text-xs">6. Escáner Cylon (Scan):</b>
                  <p className="text-xs text-slate-400">Haz luminoso rebotante de izquierda a derecha estilo Knight Rider.</p>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <b className="text-emerald-400 text-xs">7. Destellos (Sparkle):</b>
                  <p className="text-xs text-slate-400">Chispas y destellos intermitentes sobre el color base.</p>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <b className="text-rose-400 text-xs">8. Persecución (Chase):</b>
                  <p className="text-xs text-slate-400">Puntos de luz en desplazamiento secuencial continuo.</p>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5 text-pink-400">
                  <Sliders className="w-4 h-4" />
                  Presets de Iluminación de 1 Clic
                </h4>
                <p className="text-xs text-slate-300">
                  Incluye combinaciones prediseñadas: <i>Clásico Deportivo</i> (Cyan/Rojo), <i>Neón Cyberpunk</i> (Fucsia/Cyan con ondas), <i>Modo Fuego</i> (Efecto llama ardiente), <i>Arcoíris Dinámico</i> y <i>Océano Ártico</i>.
                </p>
              </div>
            </div>
          )}

          {/* SECCIÓN 9: PROTOCOLO */}
          {activeSection === 'protocol' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-purple-400 font-stadium font-black text-base border-b border-slate-800 pb-2">
                <Terminal className="w-5 h-5" />
                <span>9. PROTOCOLO SERIE ASCII Y TABLA DE COMANDOS</span>
              </div>

              <p>Tramas transmitidas a 9600 o 115200 baudios terminadas en <code>\n</code>:</p>

              <div className="space-y-2 font-mono-code text-[11px]">
                {[
                  { cmd: 'L:42', desc: 'Actualiza puntos equipo local a 42' },
                  { cmd: 'V:38', desc: 'Actualiza puntos equipo visitante a 38' },
                  { cmd: 'T:08:45', desc: 'Actualiza cronómetro principal' },
                  { cmd: 'P:1 CUARTO', desc: 'Actualiza periodo centrado' },
                  { cmd: 'LED:scoreLocal:#00D2FF:pulse:3:100', desc: 'Configura color y efecto dinámico para Local' },
                  { cmd: 'CMD:SHOT_CLOCK_RESET:24', desc: 'Resetea posesión a 24 segundos' },
                  { cmd: 'CMD:HORN:2000', desc: 'Acciona relé de bocina por 2 segundos' },
                  { cmd: 'CMD:RTC_SYNC:2026-08-24T12:30:00', desc: 'Calibra reloj RTC DS3231' },
                  { cmd: 'MSG:BIENVENIDOS|TORNEO ESCOLAR', desc: 'Muestra mensaje en 2 renglones en el cartel' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <code className="text-amber-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{item.cmd}</code>
                      <span className="text-slate-400">{item.desc}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(item.cmd, `cmd-${idx}`)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Copiar comando"
                    >
                      {copiedText === `cmd-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECCIÓN 10: WINDOWS 11 Y ANDROID */}
          {activeSection === 'windows11' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sky-400 font-stadium font-black text-base border-b border-slate-800 pb-2">
                <Laptop className="w-5 h-5" />
                <span>10. GUÍA DE INSTALACIÓN EN WINDOWS 11 Y ANDROID</span>
              </div>

              <p>
                Para testear y utilizar la aplicación de Mesa de Control en una notebook con <b>Windows 11</b> o en dispositivos <b>Android</b>:
              </p>

              {/* WINDOWS 11 */}
              <div className="bg-slate-900 p-4 rounded-xl border border-sky-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sky-300 text-xs flex items-center gap-2">
                    <span className="bg-sky-500 text-slate-950 px-2 py-0.5 rounded font-black text-[10px]">WINDOWS 11</span>
                    <span>Instalación PWA y Lanzador de Escritorio (.BAT / .PS1)</span>
                  </h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                    Recomendado
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  La aplicación está optimizada para funcionar como una App nativa de Windows 11:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 pt-1">
                  <li>Abra la URL en <b>Google Chrome</b> o <b>Microsoft Edge</b>.</li>
                  <li>Haga clic en el ícono <b>Instalar aplicación</b> en la barra de direcciones superior (o descargue el archivo <code>Iniciar_Tablero_Windows11.bat</code> desde la pestaña <i>DESCARGAS & APP</i>).</li>
                  <li>Windows 11 creará el acceso directo en el Escritorio y Menú Inicio.</li>
                  <li>La app se ejecutará en ventana independiente con soporte nativo de puertos USB Serie y Bluetooth.</li>
                </ol>
              </div>

              {/* ANDROID */}
              <div className="bg-slate-900 p-4 rounded-xl border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-emerald-300 text-xs flex items-center gap-2">
                    <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-black text-[10px]">ANDROID</span>
                    <span>Instalación en Celulares y Tablets de Árbitros</span>
                  </h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                    WebAPK / QR
                  </span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 pt-1">
                  <li>Escanee el código QR desde la cámara de su celular o abra el enlace en <b>Google Chrome Android</b>.</li>
                  <li>Toque el menú de tres puntos <kbd className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-700 text-[10px]">⋮</kbd> arriba a la derecha.</li>
                  <li>Seleccione <b>"Agregar a la pantalla principal"</b> o <b>"Instalar aplicación"</b>.</li>
                  <li>Se ejecutará en pantalla completa con soporte de Wake Lock API (pantalla siempre activa durante el partido).</li>
                </ol>
              </div>
            </div>
          )}

          {/* SECCIÓN 11: FAQ */}
          {activeSection === 'faq' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-stadium font-black text-base border-b border-slate-800 pb-2">
                <HelpCircle className="w-5 h-5" />
                <span>11. PREGUNTAS FRECUENTES Y RESOLUCIÓN DE PROBLEMAS</span>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    ¿Qué hacer si los atajos de teclado no responden?
                  </h4>
                  <p className="text-xs text-slate-300">
                    Asegúrese de que el cursor no esté dentro de una caja de texto (nombres de equipos, mensajes, etc.) y verifique en el botón <b>MACROS PC</b> que los atajos estén activados.
                  </p>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    ¿Por qué el reloj RTC pierde la hora al desenchufar el tablero?
                  </h4>
                  <p className="text-xs text-slate-300">
                    La pila de litio CR2032 del módulo DS3231 debe ser reemplazada. Tras colocar la pila nueva, presione el botón <b>Sincronizar RTC con PC</b> en la pestaña "RELOJ OFICIAL".
                  </p>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    ¿Puedo utilizar la app sin internet en el gimnasio?
                  </h4>
                  <p className="text-xs text-slate-300">
                    Sí. Una vez instalada en Windows 11 o Android, todos los scripts, sonidos y estilos quedan almacenados en la memoria del dispositivo y funcionará de forma 100% offline.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

