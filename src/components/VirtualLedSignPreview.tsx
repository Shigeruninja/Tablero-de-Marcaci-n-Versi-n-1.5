import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ScoreboardState, ClockColor, ScoreboardLedLighting, LedComponentConfig } from '../types';
import { Sun, Sparkles, Sliders, Palette, Grid, Eye, Check, Layers, Download, Zap } from 'lucide-react';
import { CLOCK_COLORS } from './ClockPanel';
import { FONT_5X7_EXTENDED, sanitizeBannerText, getFontBitmap, MatrixFontSize, formatSportPeriodDisplay } from '../utils/fontMatrix';
import { computeLedPixelColor, DEFAULT_LED_LIGHTING } from '../utils/ledEffects';

interface Props {
  state: ScoreboardState;
  rtcTime: { hours: string; minutes: string; seconds: string; date: string };
  formatTimer: (secs: number) => string;
  lighting?: ScoreboardLedLighting;
  onOpenLedConfig?: () => void;
  onSetBrightness?: (brightness: number) => void;
  onSetClockColor?: (color: ClockColor) => void;
}

const MATRIX_ROWS = 17;
const MATRIX_COLS = 64;

export const VirtualLedSignPreview: React.FC<Props> = ({ 
  state, 
  rtcTime, 
  formatTimer,
  lighting = DEFAULT_LED_LIGHTING,
  onOpenLedConfig,
  onSetBrightness,
  onSetClockColor
}) => {
  const [viewMode, setViewMode] = useState<'matrix' | 'hybrid'>('matrix');
  const [showBrightnessPopover, setShowBrightnessPopover] = useState(false);
  const [showColorPopover, setShowColorPopover] = useState(false);
  const [scrollPixelOffset, setScrollPixelOffset] = useState(0);
  const [animTimeMs, setAnimTimeMs] = useState(0);

  const isClockMode = state.appMode === 'clock';
  const isBannerMode = state.appMode === 'banner';

  const currentMinutes = Math.floor(Math.max(0, state.timerSeconds) / 60);
  const currentSeconds = Math.max(0, state.timerSeconds) % 60;

  // Comprobar si hay efectos dinámicos activos que requieran animación continua
  const hasAnimatedEffects = useMemo(() => {
    const configs = [
      lighting.scoreLocal,
      lighting.scoreVisitor,
      lighting.period,
      lighting.timer,
      lighting.possession,
      lighting.banner,
      lighting.clock,
      lighting.border,
    ];
    return configs.some((c) => c && c.effect !== 'solid');
  }, [lighting]);

  // Bucle de animación fluida para efectos de ondas, pulsos, fuego, neón y arcoíris
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const updateAnim = (now: number) => {
      setAnimTimeMs((prev) => prev + (now - lastTime));
      lastTime = now;
      animationFrameId = requestAnimationFrame(updateAnim);
    };

    animationFrameId = requestAnimationFrame(updateAnim);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Color activo de reloj
  const activeClockColor = CLOCK_COLORS.find((c) => c.id === state.clockColor) || CLOCK_COLORS[0];
  const activeBannerColor = CLOCK_COLORS.find((c) => c.id === (state.bannerColor || 'amber')) || CLOCK_COLORS[2];

  // Cálculo óptico de intensidad LED simulada
  const visualIntensity = 0.45 + (state.brightness / 100) * 0.55;
  const glowIntensity = (state.brightness / 100);

  // Animación del texto en marquesina continua
  useEffect(() => {
    if (!isBannerMode) {
      setScrollPixelOffset(0);
      return;
    }

    if (state.bannerAnimation === 'static') {
      setScrollPixelOffset(0);
      return;
    }

    // Intervalo de desplazamiento según la velocidad (1 lenta a 5 rápida)
    const SPEED_INTERVALS: Record<number, number> = {
      1: 180, // Nivel 1: Muy pausada y suave (~5.5 px/s)
      2: 145, // Nivel 2: Lenta
      3: 110, // Nivel 3: Normal
      4: 85,  // Nivel 4: Ágil
      5: 60   // Nivel 5: Rápida
    };
    const speedLevel = state.bannerSpeed || 3;
    const intervalMs = SPEED_INTERVALS[speedLevel] || 110;

    const timer = setInterval(() => {
      setScrollPixelOffset((prev) => prev + 1);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isBannerMode, state.bannerAnimation, state.bannerSpeed]);

  const handleBrightnessChange = (val: number) => {
    if (onSetBrightness) {
      onSetBrightness(val);
    }
  };

  const handleColorChange = (color: ClockColor) => {
    if (onSetClockColor) {
      onSetClockColor(color);
    }
  };

  // Generador del buffer de píxeles 17x64 (1088 LEDs WS2812B)
  const pixelGrid = useMemo(() => {
    // Matriz de colores: null = LED apagado, string = color HEX / CSS
    const grid: (string | null)[][] = Array(MATRIX_ROWS).fill(null).map(() => Array(MATRIX_COLS).fill(null));

    // Función auxiliar para dibujar un carácter en la matriz según tamaño y configuración LED
    const drawChar = (
      char: string, 
      startRow: number, 
      startCol: number, 
      configOrColor: LedComponentConfig | string, 
      fontSize: MatrixFontSize = '5x7',
      overrideColor?: string
    ) => {
      const { bitmap, width, height } = getFontBitmap(char, fontSize);
      const isConfigObj = typeof configOrColor === 'object' && configOrColor !== null;

      for (let r = 0; r < height; r++) {
        const rowBits = bitmap[r] ?? 0;
        for (let c = 0; c < width; c++) {
          const targetRow = startRow + r;
          const targetCol = startCol + c;
          if (targetRow >= 0 && targetRow < MATRIX_ROWS && targetCol >= 0 && targetCol < MATRIX_COLS) {
            const isBitOn = (rowBits >> (width - 1 - c)) & 1;
            if (isBitOn) {
              if (isConfigObj) {
                grid[targetRow][targetCol] = computeLedPixelColor(
                  configOrColor as LedComponentConfig,
                  animTimeMs,
                  targetRow,
                  targetCol,
                  overrideColor
                );
              } else {
                grid[targetRow][targetCol] = configOrColor as string;
              }
            }
          }
        }
      }
    };

    if (isClockMode) {
      // --- MODO RELOJ RTC (DS3231) EN RETÍCULA 17x64 ---
      const hStr = rtcTime.hours.padStart(2, '0');
      const mStr = rtcTime.minutes.padStart(2, '0');
      const sStr = rtcTime.seconds.padStart(2, '0');
      const clockCfg = lighting.clock || { color: activeClockColor.hex, effect: 'solid', speed: 3, brightness: 100 };

      // Fila central (y: 5 a 11, altura 7 píxeles, centrada en los 17 renglones de la retícula)
      // Bloque Horas (Cols 13..17 y 19..23)
      drawChar(hStr[0], 5, 13, clockCfg, '5x7');
      drawChar(hStr[1], 5, 19, clockCfg, '5x7');

      // Primeros dos puntos ':' en Columna 25 (Filas 7 y 9)
      const dot1Color = computeLedPixelColor(clockCfg, animTimeMs, 7, 25);
      const dot2Color = computeLedPixelColor(clockCfg, animTimeMs, 9, 25);
      grid[7][25] = dot1Color;
      grid[9][25] = dot2Color;

      // Bloque Minutos (Cols 27..31 y 33..37)
      drawChar(mStr[0], 5, 27, clockCfg, '5x7');
      drawChar(mStr[1], 5, 33, clockCfg, '5x7');

      // Segundos dos puntos ':' en Columna 39 (Filas 7 y 9)
      const dot3Color = computeLedPixelColor(clockCfg, animTimeMs, 7, 39);
      const dot4Color = computeLedPixelColor(clockCfg, animTimeMs, 9, 39);
      grid[7][39] = dot3Color;
      grid[9][39] = dot4Color;

      // Bloque Segundos (Cols 41..45 y 47..51)
      drawChar(sStr[0], 5, 41, clockCfg, '5x7');
      drawChar(sStr[1], 5, 47, clockCfg, '5x7');

    } else if (isBannerMode) {
      // --- MODO CARTEL DE MENSAJES EN RETÍCULA 17x64 ---
      const bannerCfg = lighting.banner || { color: activeBannerColor.hex, effect: 'solid', speed: 3, brightness: 100 };
      const isTwoLines = state.bannerModeType !== 'single_line';
      const isStatic = state.bannerAnimation === 'static';
      const isLeftToRight = state.scrollDirection === 'left_to_right';
      const currentFontSize: MatrixFontSize = state.bannerFontSize || '3x5';
      const { step, width } = getFontBitmap('A', currentFontSize);

      const line1 = sanitizeBannerText(state.marqueeText || 'BIENVENIDOS');
      const line2 = sanitizeBannerText(state.marqueeLine2 || 'AL GIMNASIO');

      // Helper para renderizar un renglón con modo estático centrado o desplazamiento
      const renderLine = (text: string, rowY: number) => {
        if (!text) return;
        const totalTextWidth = text.length * step;

        if (isStatic) {
          // Centrado geométrico en la pantalla de 64 columnas
          let startCol = Math.max(0, Math.floor((MATRIX_COLS - totalTextWidth) / 2));
          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const col = startCol + i * step;
            if (col + width > 0 && col < MATRIX_COLS) {
              drawChar(char, rowY, col, bannerCfg, currentFontSize);
            }
          }
        } else {
          // MODO DESPLAZAMIENTO / SCROLL
          const cycleLength = totalTextWidth + MATRIX_COLS + 10;
          const rawOffset = scrollPixelOffset % cycleLength;

          let startCol = 0;
          if (isLeftToRight) {
            startCol = -totalTextWidth + rawOffset;
          } else {
            startCol = MATRIX_COLS - rawOffset;
          }

          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const col = startCol + i * step;
            if (col + width >= 0 && col < MATRIX_COLS) {
              drawChar(char, rowY, col, bannerCfg, currentFontSize);
            }
          }
        }
      };

      if (isTwoLines) {
        if (currentFontSize === '3x5') {
          renderLine(line1, 2);
          renderLine(line2, 10);
        } else if (currentFontSize === '4x6') {
          renderLine(line1, 2);
          renderLine(line2, 9);
        } else {
          renderLine(line1, 1);
          renderLine(line2, 9);
        }
      } else {
        if (currentFontSize === '3x5') {
          renderLine(line1, 6);
        } else {
          renderLine(line1, 5);
        }
      }

    } else {
      // =========================================================================
      // MODO TABLERO DEPORTIVO PROFESIONAL (RETÍCULA 17x64 PÍXELES)
      // RENGLÓN 1 (Filas 1-7): Puntajes en 5x7 y Periodo central en 3x5 "00  1 CUARTO  00"
      // RENGLÓN 2 (Filas 9-14): Tiempo de juego completo "HH:MM:SS" en letra 4x6
      // =========================================================================

      const locCfg = lighting.scoreLocal || DEFAULT_LED_LIGHTING.scoreLocal;
      const visCfg = lighting.scoreVisitor || DEFAULT_LED_LIGHTING.scoreVisitor;
      const perCfg = lighting.period || DEFAULT_LED_LIGHTING.period;
      const timCfg = lighting.timer || DEFAULT_LED_LIGHTING.timer;
      const posCfg = lighting.possession || DEFAULT_LED_LIGHTING.possession;

      // --- RENGLÓN 1: PUNTAJES EN 5x7 Y PERIODO EN 3x5 ---
      // 1. Tanteador Local (Cols 2 y 8, y: 1 a 7) en Fuente 5x7 con efecto LED
      const scoreLocStr = String(Math.min(99, Math.max(0, state.scoreLocal))).padStart(2, '0');
      drawChar(scoreLocStr[0], 1, 2, locCfg, '5x7');
      drawChar(scoreLocStr[1], 1, 8, locCfg, '5x7');

      // 2. Periodo Jugado en el centro (Cols 16 a 47, y: 2 a 6) en 3x5 con efecto LED
      const periodText = formatSportPeriodDisplay(state.sport, state.period);
      const periodWidth = periodText.length * 4;
      const periodStartCol = Math.max(14, Math.floor((MATRIX_COLS - periodWidth) / 2));

      for (let i = 0; i < periodText.length; i++) {
        const char = periodText[i];
        const col = periodStartCol + i * 4;
        if (col + 3 >= 0 && col < MATRIX_COLS) {
          drawChar(char, 2, col, perCfg, '3x5');
        }
      }

      // 3. Tanteador Visitante (Cols 52 y 58, y: 1 a 7) en Fuente 5x7 con efecto LED
      const scoreVisStr = String(Math.min(99, Math.max(0, state.scoreVisitor))).padStart(2, '0');
      drawChar(scoreVisStr[0], 1, 52, visCfg, '5x7');
      drawChar(scoreVisStr[1], 1, 58, visCfg, '5x7');

      // 4. Indicadores de Posesión de Balón en los bordes
      if (state.possession === 'local') {
        const pColor = computeLedPixelColor(posCfg, animTimeMs, 3, 0, locCfg.color);
        grid[3][0] = pColor;
        grid[4][0] = pColor;
        grid[5][0] = pColor;
      } else if (state.possession === 'visitor') {
        const pColor = computeLedPixelColor(posCfg, animTimeMs, 3, 63, visCfg.color);
        grid[3][63] = pColor;
        grid[4][63] = pColor;
        grid[5][63] = pColor;
      }

      // --- RENGLÓN 2: CRONÓMETRO DE TIEMPO DE JUEGO (MINUTOS Y SEGUNDOS) CENTRADO ---
      // Centrado exacto sobre el eje horizontal (64 columnas) y vertical (segundo renglón: filas 9 a 15)
      // Solo contiene minutos y segundos, con soporte de hasta 3 dígitos para minutos (ej: 00:00, 45:00, 120:00)
      const totalSecs = Math.max(0, state.timerSeconds);
      const timerMins = Math.floor(totalSecs / 60);
      const timerSecs = totalSecs % 60;
      
      const minsStr = timerMins >= 100 ? String(timerMins) : String(timerMins).padStart(2, '0');
      const secsStr = String(timerSecs).padStart(2, '0');
      const timeStr = `${minsStr}:${secsStr}`;

      // Si quedan <= 10 segundos y el reloj corre, activar alerta roja automática
      const isUrgentTimer = state.timerSeconds <= 10 && state.timerRunning;
      const effectiveTimCfg: LedComponentConfig = isUrgentTimer 
        ? { color: '#ff3344', effect: 'strobe', speed: 5, brightness: 100 }
        : timCfg;

      // Cálculo del ancho total y centrado horizontal exacto (en tipografía 5x7: ancho 5 + 1px separación = 6px por carácter)
      const charStep = 6;
      const totalWidth = (timeStr.length * charStep) - 1;
      const timerStartCol = Math.floor((MATRIX_COLS - totalWidth) / 2);
      const timerStartRow = 9; // Filas 9 a 15 (altura 7, exactamente centrada verticalmente en el segundo renglón)

      for (let i = 0; i < timeStr.length; i++) {
        const char = timeStr[i];
        const col = timerStartCol + i * charStep;
        if (col + 5 >= 0 && col < MATRIX_COLS) {
          drawChar(char, timerStartRow, col, effectiveTimCfg, '5x7');
        }
      }
    }

    return grid;
  }, [
    state, 
    rtcTime, 
    isClockMode, 
    isBannerMode, 
    activeClockColor, 
    activeBannerColor, 
    currentMinutes, 
    currentSeconds, 
    scrollPixelOffset,
    animTimeMs,
    lighting
  ]);

  return (
    <div id="virtual-led-sign-container" className="bg-slate-950 border-4 border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xl overflow-hidden relative">
      {/* Marco de cartel metálico con tornillos decorativos */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-600 border border-slate-400"></div>
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-600 border border-slate-400"></div>
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-600 border border-slate-400"></div>
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-600 border border-slate-400"></div>

      {/* Header del Cartel con Selector de Modo y Botón de Efectos LED */}
      <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-2 mb-3 gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-[11px] font-extrabold tracking-widest uppercase text-slate-300 font-stadium flex items-center gap-1.5">
            <Grid className="w-3.5 h-3.5 text-amber-400" />
            RETÍCULA LED DEPORTIVA • 17x64 PÍXELES (256x68 CM)
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono-code relative">
          
          {/* Botón Principal: Configuración de Colores y Efectos LED */}
          {onOpenLedConfig && (
            <button
              onClick={onOpenLedConfig}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 border border-amber-400/50 text-amber-300 hover:text-white font-bold transition shadow-sm group"
              title="Personalizar colores independientes y efectos LED (ondas, pulsos, etc.)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>Colores & Efectos LED</span>
            </button>
          )}

          {/* Selector de Vista: Retícula Píxel Real vs Display Segmentado */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                viewMode === 'matrix' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Ver en retícula exacta de 17x64 píxeles LED WS2812B"
            >
              <Grid className="w-3 h-3" />
              Retícula 17x64
            </button>
            <button
              onClick={() => setViewMode('hybrid')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                viewMode === 'hybrid' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Ver en modo paneles amplificados"
            >
              <Layers className="w-3 h-3" />
              Paneles
            </button>
          </div>

          {/* Botón selector de Brillo */}
          <div className="relative">
            <button
              onClick={() => {
                setShowBrightnessPopover(!showBrightnessPopover);
                setShowColorPopover(false);
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold transition shadow-sm"
              title="Ajustar brillo del cartel físico y digital"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span>{state.brightness}%</span>
            </button>

            {/* Popover flotante de Brillo */}
            {showBrightnessPopover && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl z-30 space-y-2.5 font-sans">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    Intensidad LED
                  </span>
                  <span className="font-mono text-amber-400 font-bold">{state.brightness}%</span>
                </div>

                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={state.brightness}
                  onChange={(e) => handleBrightnessChange(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
                />

                {/* Presets Rápidos */}
                <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-800 text-[10px] font-mono-code font-bold">
                  {[20, 50, 80, 100].map((level) => (
                    <button
                      key={level}
                      onClick={() => handleBrightnessChange(level)}
                      className={`py-1 rounded border transition ${
                        state.brightness === level
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                          : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {level}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Renderizado de la Pantalla */}
      <div style={{ opacity: visualIntensity }}>
        {viewMode === 'matrix' ? (
          // =========================================================================
          // RENDERIZADOR MATRICIAL FOTORREALISTA 17x64 PÍXELES
          // =========================================================================
          <div className="bg-black/95 rounded-xl p-2 sm:p-3.5 border border-slate-800 overflow-x-auto shadow-inner">
            <div className="min-w-[650px] max-w-full mx-auto">
              
              {/* Encabezado informativo de la retícula */}
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1.5 px-1">
                <span className="font-bold" style={{ color: lighting.scoreLocal.color }}>
                  ◄ LOCAL: {state.localName || 'LOCAL'} ({state.scoreLocal})
                </span>
                <span className="font-bold" style={{ color: lighting.timer.color }}>
                  CRONÓMETRO: {formatTimer(state.timerSeconds)} • PER: {state.period}
                </span>
                <span className="font-bold" style={{ color: lighting.scoreVisitor.color }}>
                  VISITANTE: {state.visitorName || 'VISITANTE'} ({state.scoreVisitor}) ►
                </span>
              </div>

              {/* Contenedor de la Cuadrícula Matricial */}
              <div 
                className="grid gap-[2px] bg-slate-950/90 p-2 rounded-lg border border-slate-800/80"
                style={{
                  gridTemplateColumns: `repeat(${MATRIX_COLS}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${MATRIX_ROWS}, minmax(0, 1fr))`,
                  aspectRatio: '64 / 17'
                }}
              >
                {pixelGrid.map((row, rIdx) =>
                  row.map((color, cIdx) => {
                    const isLit = color !== null;
                    const isCenterCol = cIdx === 31; // Columna 32 (índice 31, eje central de simetría)
                    const isCenterRow = rIdx === 8;  // Fila 9 (eje horizontal de simetría)

                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className={`rounded-[1.5px] relative flex items-center justify-center ${
                          isLit ? 'z-10' : 'bg-slate-900/40 border border-slate-900/60'
                        }`}
                        style={{
                          backgroundColor: isLit ? color : undefined,
                          boxShadow: isLit 
                            ? `0 0 ${4 * glowIntensity}px ${color}, inset 0 0 1.5px rgba(255,255,255,0.4)` 
                            : undefined,
                          opacity: isLit ? 1 : 0.25
                        }}
                        title={`Píxel (${rIdx + 1}, ${cIdx + 1})${isLit ? ` - Color: ${color}` : ''}`}
                      >
                        {/* Pequeña cruceta óptica central solo en ejes */}
                        {(isCenterCol && isCenterRow && !isLit) && (
                          <span className="w-1 h-1 rounded-full bg-slate-700/50"></span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Guía inferior de dimensiones de construcción */}
              <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 mt-2 px-1 border-t border-slate-800/60 pt-1">
                <span>Alto: 17 LEDs (68 cm) • Ancho: 64 LEDs (256 cm) • Eje: Columna 32</span>
                <span className="text-amber-400/80 font-bold">Píxeles Activos: {pixelGrid.flat().filter(Boolean).length} / 1088</span>
                <span>WS2812B GRB • FastLED NeoMatrix (17x64)</span>
              </div>
            </div>
          </div>
        ) : (
          // =========================================================================
          // RENDERIZADOR HÍBRIDO POR PANELES
          // =========================================================================
          <div>
            {isClockMode ? (
              <div 
                className="bg-black/90 rounded-xl p-6 border text-center flex flex-col items-center justify-center min-h-[140px] transition-colors duration-300"
                style={{ borderColor: `${lighting.clock?.color || activeClockColor.hex}40` }}
              >
                <span 
                  className="text-xs font-mono mb-1 tracking-widest uppercase font-bold"
                  style={{ color: lighting.clock?.color || activeClockColor.hex }}
                >
                  HORA OFICIAL RTC (DS3231) • {activeClockColor.name}
                </span>
                <div 
                  className="font-digital text-5xl sm:text-7xl font-bold tracking-wider transition-colors duration-300"
                  style={{ 
                    color: lighting.clock?.color || activeClockColor.hex,
                    textShadow: `0 0 ${12 * glowIntensity}px ${lighting.clock?.color || activeClockColor.hex}` 
                  }}
                >
                  {rtcTime.hours}:{rtcTime.minutes}:{rtcTime.seconds}
                </div>
                <span className="text-xs font-mono text-slate-400 mt-2">{rtcTime.date} • BUENOS AIRES (UTC-3)</span>
              </div>
            ) : isBannerMode ? (
              <div 
                className="bg-black/90 rounded-xl p-6 border text-center flex flex-col items-center justify-center min-h-[140px] overflow-hidden"
                style={{ borderColor: `${lighting.banner?.color || '#f59e0b'}40` }}
              >
                <span className="text-xs font-mono text-amber-400/80 mb-2">CARTELERA DE MENSAJES LED</span>
                <div 
                  className="font-stadium text-2xl sm:text-3xl font-extrabold tracking-wider truncate w-full"
                  style={{ 
                    color: lighting.banner?.color || '#f59e0b',
                    textShadow: `0 0 ${10 * glowIntensity}px ${lighting.banner?.color || '#f59e0b'}` 
                  }}
                >
                  {state.marqueeText || 'BIENVENIDOS AL GIMNASIO'}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 bg-black/90 p-3 sm:p-4 rounded-xl border border-slate-800">
                {/* LOCAL */}
                <div 
                  className="flex flex-col items-center justify-center bg-slate-900/60 rounded-lg p-2 border"
                  style={{ borderColor: `${lighting.scoreLocal.color}40` }}
                >
                  <div className="flex items-center space-x-1">
                    {state.possession === 'local' && (
                      <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: lighting.scoreLocal.color }}></span>
                    )}
                    <span className="text-xs font-black tracking-wider uppercase truncate max-w-[90px]" style={{ color: lighting.scoreLocal.color }}>
                      {state.localName || 'LOCAL'}
                    </span>
                  </div>
                  <div 
                    className="font-digital text-4xl sm:text-6xl font-black"
                    style={{ 
                      color: lighting.scoreLocal.color,
                      textShadow: `0 0 ${10 * glowIntensity}px ${lighting.scoreLocal.color}` 
                    }}
                  >
                    {String(state.scoreLocal).padStart(2, '0')}
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                    <span>F: <b className="text-blue-300">{state.foulsLocal}</b></span>
                    <span>T: <b className="text-amber-300">{state.timeoutsLocal}</b></span>
                  </div>
                </div>

                {/* CENTRO: CRONÓMETRO */}
                <div className="flex flex-col items-center justify-center bg-slate-900/60 rounded-lg p-2 border border-amber-500/30">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                    {formatSportPeriodDisplay(state.sport, state.period)}
                  </span>
                  <div 
                    className="font-digital text-3xl sm:text-5xl font-black"
                    style={{ 
                      color: lighting.timer.color,
                      textShadow: `0 0 ${12 * glowIntensity}px ${lighting.timer.color}` 
                    }}
                  >
                    {formatTimer(state.timerSeconds)}
                  </div>
                  <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-1">
                    <span className={`px-1 rounded ${state.timerRunning ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                      {state.timerRunning ? 'CORRIENDO' : 'PAUSADO'}
                    </span>
                  </div>
                </div>

                {/* VISITANTE */}
                <div 
                  className="flex flex-col items-center justify-center bg-slate-900/60 rounded-lg p-2 border"
                  style={{ borderColor: `${lighting.scoreVisitor.color}40` }}
                >
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-black tracking-wider uppercase truncate max-w-[90px]" style={{ color: lighting.scoreVisitor.color }}>
                      {state.visitorName || 'VISITANTE'}
                    </span>
                    {state.possession === 'visitor' && (
                      <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: lighting.scoreVisitor.color }}></span>
                    )}
                  </div>
                  <div 
                    className="font-digital text-4xl sm:text-6xl font-black"
                    style={{ 
                      color: lighting.scoreVisitor.color,
                      textShadow: `0 0 ${10 * glowIntensity}px ${lighting.scoreVisitor.color}` 
                    }}
                  >
                    {String(state.scoreVisitor).padStart(2, '0')}
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                    <span>F: <b className="text-red-300">{state.foulsVisitor}</b></span>
                    <span>T: <b className="text-amber-300">{state.timeoutsVisitor}</b></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

