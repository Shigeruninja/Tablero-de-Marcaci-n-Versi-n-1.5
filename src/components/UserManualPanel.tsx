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
  Smartphone
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
    { id: 'hardware', label: '2. Componentes y Displays LED', icon: Cpu },
    { id: 'connection', label: '3. Enlace USB / Bluetooth / WiFi', icon: Radio },
    { id: 'sports', label: '4. Operación por Deporte', icon: Trophy },
    { id: 'clock_shotclock', label: '5. Cronómetro y 24s / 14s', icon: Clock },
    { id: 'macros', label: '6. Macros de Teclado PC', icon: Keyboard },
    { id: 'audio', label: '7. Chicharras y Bocina', icon: Volume2 },
    { id: 'protocol', label: '8. Protocolo Serie ASCII', icon: Terminal },
    { id: 'windows11', label: '9. Instalación en Windows 11 y Android', icon: Laptop },
    { id: 'faq', label: '10. Preguntas Frecuentes y Soluciones', icon: HelpCircle },
  ];

  const filteredSections = sections.filter(s => 
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    searchQuery === ''
  );

  const downloadMarkdownManual = () => {
    const markdownContent = `# 📖 MANUAL DE USUARIO Y GUÍA DE OPERACIÓN
## TABLERO DEPORTIVO Y CARTEL LUMINOSO DIGITAL ESCOLAR (ARDUINO / ESP32)
*Versión 2.4 Oficial - Mesa de Control de Gimnasio*

---

### 1. INTRODUCCIÓN Y ARQUITECTURA
El Sistema de Tablero Deportivo Escolar es una plataforma profesional para control de tanteador, tiempos de juego y señalización acústica-luminosa.
- **Panel Web de Control (PC/Tablet)**: Interfaz reactiva para mesa de control, reloj en tiempo real, macros de teclado, sintetizador Web Audio polifónico y vista previa digital del cartel físico.
- **Tablero Físico (Arduino / ESP32)**: Controlador por microcontrolador que gobierna displays 7 segmentos de alta luminosidad, matriz de texto, reloj RTC DS3231 con batería y relé de bocina de 220V/12V.

---

### 2. COMPONENTES Y PANTALLAS LUMINOSAS
1. **Tanteadores de Puntos (0 a 99)**: Displays 7 segmentos de alto contraste (Rojo para Local, Verde/Azul para Visitante) controlados por MAX7219 o 74HC595.
2. **Cronómetro Principal (MM:SS y SS.d)**: 4 dígitos para minutos y segundos. En el último minuto (< 01:00) pasa automáticamente a décimas de segundo.
3. **Módulo Shot Clock de Posesión (24s / 14s)**: Displays dobles independientes con aviso lumínico a los 5 segundos.
4. **Relé de Chicharra de Estadio (D8)**: Salida a relé optoacoplado de 10A para accionar sirenas industriales o bocinas electromecánicas de 12V DC o 220V AC.

---

### 3. ENLACE Y COMUNICACIÓN CON EL TABLERO
- **Cable USB Serial (Recomendado para PC)**: Conectar cable USB, abrir diálogo "ENLACE", elegir 9600 Baud (Arduino) o 115200 Baud (ESP32) y seleccionar el puerto COM en Web Serial API.
- **Bluetooth (HC-05 / ESP32 BLE)**: Inalámbrico para operar desde tablets o notebooks en la mesa de jueces hasta 15 metros de distancia.
- **WiFi (ESP32)**: Transmisión mediante endpoints HTTP REST y WebSockets.

---

### 4. OPERACIÓN POR DISCIPLINA DEPORTIVA
- **Básquetbol (FIBA)**: Puntuación +1, +2, +3 y -1. Reset automático de posesión a 24s en cada conversión. Alerta de bonus a la 5ª falta colectiva por cuarto. Tiempos muertos de 60 segundos.
- **Fútbol y Futsal (AFA/FIFA)**: 2 tiempos de 45m (Fútbol) o 20m netos (Futsal). Registro de tarjetas amarillas y rojas. 6ta falta acumulada y doble penal.
- **Vóleibol**: Tanteador de sets (mejor de 3 o 5), indicador de saque y control de rotaciones/sustituciones.
- **Handball**: Registro de goles, exclusiones de 2 minutos y aviso de juego pasivo.
- **Entrenamiento**: Campana de round de boxeo, gong de descanso y temporizador de series.

---

### 5. CRONÓMETRO Y SHOT CLOCK
- **Iniciar / Pausar**: Barra Espaciadora o botón central.
- **Ajustes Rápidos**: +1m, -1m, +10s, -10s para correcciones arbitrales sobre la marcha.
- **Posesión 24s (Tecla 1)**: Jugada ofensiva completa.
- **Posesión 14s (Tecla 2)**: Rebote ofensivo o falta en campo de ataque.

---

### 6. MACROS DE TECLADO PC
| Función | Tecla | Acción |
|---|---|---|
| Play / Pausa | **Espacio** | Arranca / detiene cronómetro |
| Local +1 / +2 / +3 | **Q / W / E** | Suma puntos local |
| Local -1 | **A** | Descuenta 1 punto local |
| Visitante +1 / +2 / +3 | **U / I / O** | Suma puntos visitante |
| Visitante -1 | **J** | Descuenta 1 punto visitante |
| Posesión 24s / 14s | **1 / 2** | Resetea reloj de tiro |
| Bocina / Sirena | **B** | Disparo de chicharra |
| Silbato Árbitro | **S** | Silbato acústico |

---

### 7. PROTOCOLO SERIE ASCII
- \`L:<puntos>\` : Puntos Local (ej. \`L:42\`)
- \`V:<puntos>\` : Puntos Visitante (ej. \`V:38\`)
- \`T:<mm:ss>\` : Tiempo Cronómetro (ej. \`T:08:45\`)
- \`P:<periodo>\` : Periodo (ej. \`P:3\`)
- \`CMD:SHOT_CLOCK_RESET:24\` : Reset 24 segundos
- \`CMD:HORN:<ms>\` : Accionar bocina por milisegundos
- \`CMD:RTC_SYNC:<iso>\` : Sincronización horaria RTC DS3231

---

### 8. INSTALACIÓN WINDOWS 11 Y ANDROID
- **Windows 11**: Instalar como PWA desde Chrome o Edge para acceso directo en Escritorio y ejecución en ventana nativa.
- **Android**: Instalar en Pantalla Principal desde Chrome para soporte táctil y pantalla completa.
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
                v2.4 OFICIAL
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-mono-code">
              Documentación técnica y operativa para Mesa de Control de Gimnasio
            </p>
          </div>
        </div>

        {/* Acciones de Documento */}
        <div className="flex items-center gap-2">
          <button
            onClick={downloadMarkdownManual}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-stadium font-bold flex items-center gap-1.5 transition"
            title="Descargar archivo Markdown del manual"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>DESCARGAR .MD</span>
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
              <span>Acceso Rápido de Emergencia</span>
            </div>
            <ul className="space-y-1 font-mono-code text-[10px]">
              <li>• <b className="text-white">Espacio:</b> Pausar / Reanudar Reloj</li>
              <li>• <b className="text-white">1:</b> Reset 24s Posesión Básquet</li>
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
                    Interfaz reactiva para PC y dispositivos táctiles con reloj en tiempo real, macros de teclado, sonido Web Audio multicanal y vista previa digital del cartel físico.
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                  <h4 className="font-stadium font-bold text-white text-xs text-emerald-400">⚡ Tablero Físico (Arduino / ESP32)</h4>
                  <p className="text-xs text-slate-400">
                    Controlador por microcontrolador que gobierna displays 7 segmentos de alta luminosidad, matriz de texto, reloj RTC DS3231 con batería y relé de bocina de 220V/12V.
                  </p>
                </div>
              </div>

              <div className="bg-blue-950/30 border border-blue-800/40 p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-blue-300 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  Garantía de Tiempo Real
                </h4>
                <p className="text-xs text-slate-300">
                  El cronómetro utiliza sincronización de alta fidelidad. Si la conexión por cable se interrumpe temporalmente, el módulo Arduino mantiene el tiempo de forma autónoma mediante su temporizador de hardware interno.
                </p>
              </div>
            </div>
          )}

          {/* SECCIÓN 2: HARDWARE */}
          {activeSection === 'hardware' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-stadium font-black text-base border-b border-slate-800 pb-2">
                <Cpu className="w-5 h-5" />
                <span>2. COMPONENTES Y PANTALLAS LUMINOSAS</span>
              </div>

              <p>El tablero modular está compuesto por los siguientes bloques electrónicos:</p>

              <div className="space-y-3">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold font-mono text-xs flex-shrink-0">1</span>
                  <div>
                    <h4 className="font-bold text-white text-xs">Tanteadores de Puntos (0 a 99)</h4>
                    <p className="text-xs text-slate-400">Displays 7 segmentos de alto contraste (Rojo para Local, Verde/Azul para Visitante) controlados mediante controladores MAX7219 o registros 74HC595.</p>
                  </div>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono text-xs flex-shrink-0">2</span>
                  <div>
                    <h4 className="font-bold text-white text-xs">Cronómetro Principal (MM:SS y SS.d)</h4>
                    <p className="text-xs text-slate-400">4 dígitos para minutos y segundos. En el último minuto reglamentario (&lt; 01:00) pasa automáticamente a mostrar segundos y décimas de segundo.</p>
                  </div>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold font-mono text-xs flex-shrink-0">3</span>
                  <div>
                    <h4 className="font-bold text-white text-xs">Módulo Shot Clock de Posesión (24s / 14s)</h4>
                    <p className="text-xs text-slate-400">Displays dobles independientes de 2 dígitos ubicados sobre los aros o en el marco central con aviso lumínico a los 5 segundos.</p>
                  </div>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold font-mono text-xs flex-shrink-0">4</span>
                  <div>
                    <h4 className="font-bold text-white text-xs">Relé de Chicharra de Estadio (D8)</h4>
                    <p className="text-xs text-slate-400">Salida a relé optoacoplado de 10A para accionar sirenas industriales o bocinas electromecánicas de 12V DC o 220V AC.</p>
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
                    <li>Presione el botón <b>ENLACE</b> en la esquina superior derecha.</li>
                    <li>Seleccione <b>9600 Baud</b> (Arduino) o <b>115200 Baud</b> (ESP32).</li>
                    <li>Haga clic en <b>Abrir Puerto Serie (Web Serial)</b> y confirme el puerto COM en el diálogo del navegador.</li>
                  </ol>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2 text-blue-400">
                    <span>📡 Bluetooth Inalámbrico (HC-05 / ESP32)</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Ideal para operar desde tablets o notebooks inalámbricas situadas en la mesa de jueces a hasta 15 metros de distancia.
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
                    <li><b>Alerta de Penalización:</b> Al llegar a la 5ª falta colectiva por cuarto se ilumina el aviso de tiros libres.</li>
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
                <span>6. SISTEMA DE MACROS Y ATAJOS DE TECLADO (PC)</span>
              </div>

              <p>Mapeo por defecto para operación a dos manos en computadoras:</p>

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
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECCIÓN 7: AUDIO */}
          {activeSection === 'audio' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-stadium font-black text-base border-b border-slate-800 pb-2">
                <Volume2 className="w-5 h-5" />
                <span>7. SISTEMA DE AUDIO Y CHICHARRA ACÚSTICA</span>
              </div>

              <p>El sistema genera audio en vivo por dos vías simultáneas:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-white text-xs">🔊 Parlantes de PC / Mesa</h4>
                  <p className="text-xs text-slate-400">
                    Sintetizador Web Audio API polifónico que reproduce chicharra de fin de cuarto, toque de silbato, órgano de estadio de básquetbol y sirena de gol.
                  </p>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-white text-xs">📢 Sirena / Relé Físico (220V/12V)</h4>
                  <p className="text-xs text-slate-400">
                    Comando <code>CMD:HORN:2000</code> enviado por el pin D8 de Arduino a un relé para accionar la bocina de gran potencia del techo del gimnasio.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 8: PROTOCOLO */}
          {activeSection === 'protocol' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-purple-400 font-stadium font-black text-base border-b border-slate-800 pb-2">
                <Terminal className="w-5 h-5" />
                <span>8. PROTOCOLO SERIE Y TABLA DE COMANDOS</span>
              </div>

              <p>Tramas ASCII transmitidas a 9600 baudios terminadas en <code>\n</code>:</p>

              <div className="space-y-2 font-mono-code text-[11px]">
                {[
                  { cmd: 'L:42', desc: 'Actualiza puntos equipo local a 42' },
                  { cmd: 'V:38', desc: 'Actualiza puntos equipo visitante a 38' },
                  { cmd: 'T:08:45', desc: 'Actualiza cronómetro principal' },
                  { cmd: 'P:3', desc: 'Actualiza periodo o cuarto a 3' },
                  { cmd: 'CMD:SHOT_CLOCK_RESET:24', desc: 'Resetea posesión a 24 segundos' },
                  { cmd: 'CMD:HORN:2000', desc: 'Acciona relé de bocina por 2 segundos' },
                  { cmd: 'CMD:RTC_SYNC:2026-08-22T17:00:00', desc: 'Calibra reloj DS3231' },
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

          {/* SECCIÓN 9: WINDOWS 11 */}
          {activeSection === 'windows11' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sky-400 font-stadium font-black text-base border-b border-slate-800 pb-2">
                <Laptop className="w-5 h-5" />
                <span>9. GUÍA DE INSTALACIÓN Y PRUEBAS EN WINDOWS 11 (NOTEBOOK)</span>
              </div>

              <p>
                Para testear la aplicación de Mesa de Control en una notebook con <b>Windows 11</b>, dispone de 3 modalidades:
              </p>

              {/* OPCIÓN 1 */}
              <div className="bg-slate-900 p-4 rounded-xl border border-sky-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sky-300 text-xs flex items-center gap-2">
                    <span className="bg-sky-500 text-slate-950 px-2 py-0.5 rounded font-black text-[10px]">MÉTODO 1 (RECOMENDADO)</span>
                    <span>Instalación Directa como Aplicación de Escritorio (PWA)</span>
                  </h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                    Sin instalar Node.js ni compilar
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  La aplicación está lista para funcionar como una App nativa de Windows 11 utilizando Microsoft Edge o Google Chrome:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 pt-1">
                  <li>Abra la URL de la aplicación en <b>Google Chrome</b> o <b>Microsoft Edge</b> en su notebook.</li>
                  <li>En la barra de direcciones superior (extremo derecho), haga clic en el ícono <b>Instalar aplicación</b> (o menú <kbd className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-700 text-[10px]">...</kbd> &gt; <i>Aplicaciones</i> &gt; <i>Instalar Tablero Deportivo</i>).</li>
                  <li>Presione <b>Instalar</b>.</li>
                  <li>Windows 11 creará un <b>acceso directo en el Escritorio</b> y en el <b>Menú Inicio</b>.</li>
                  <li>La app se ejecutará en su propia ventana sin marcos de navegador, con soporte 100% nativo para puertos USB (Web Serial) y Bluetooth.</li>
                </ol>
              </div>

              {/* OPCIÓN 2 */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black text-[10px]">MÉTODO 2</span>
                    <span>Ejecución Local con Node.js en Windows 11</span>
                  </h4>
                </div>
                <p className="text-xs text-slate-400">
                  Si desea correr el servidor de desarrollo en su propia máquina de forma autónoma:
                </p>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono-code text-[11px] text-slate-300 space-y-1">
                  <p className="text-slate-500"># 1. Instalar dependencias en PowerShell / CMD:</p>
                  <p className="text-amber-300">npm install</p>
                  <p className="text-slate-500 pt-1"># 2. Iniciar el servidor local:</p>
                  <p className="text-amber-300">npm run dev</p>
                  <p className="text-slate-500 pt-1"># 3. Compilar para producción:</p>
                  <p className="text-amber-300">npm run build</p>
                </div>
              </div>

              {/* OPCIÓN ANDROID */}
              <div className="bg-slate-900 p-4 rounded-xl border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-emerald-300 text-xs flex items-center gap-2">
                    <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-black text-[10px]">MÉTODO 4 (ANDROID)</span>
                    <span>Instalación en Smartphones y Tablets Android</span>
                  </h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                    WebAPK / Pantalla de Inicio
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Para utilizar el tablero en la cancha desde un teléfono o tablet Android:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 pt-1">
                  <li>Abra la URL de la aplicación en <b>Google Chrome</b> en su dispositivo Android (o escanee el código QR en la pestaña <i>DESCARGAS & APP</i>).</li>
                  <li>Toque el menú de opciones <kbd className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-700 text-[10px]">⋮</kbd> arriba a la derecha.</li>
                  <li>Seleccione <b>"Agregar a la pantalla principal"</b> o <b>"Instalar aplicación"</b>.</li>
                  <li>Se creará el ícono en su pantalla de inicio y se ejecutará en modo pantalla completa sin barra de navegación.</li>
                </ol>
              </div>

            </div>
          )}

          {/* SECCIÓN 10: FAQ */}
          {activeSection === 'faq' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-stadium font-black text-base border-b border-slate-800 pb-2">
                <HelpCircle className="w-5 h-5" />
                <span>10. PREGUNTAS FRECUENTES Y RESOLUCIÓN DE PROBLEMAS</span>
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
                    La pila de litio CR2032 del módulo DS3231 debe ser reemplazada. Tras colocar la pila nueva, presione el botón <b>Sincronizar RTC con PC</b>.
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
