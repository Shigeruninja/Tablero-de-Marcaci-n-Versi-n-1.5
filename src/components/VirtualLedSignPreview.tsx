import React, { useState } from 'react';
import { ScoreboardState, ClockColor } from '../types';
import { Sun, Sparkles, Sliders, Palette, Check } from 'lucide-react';
import { CLOCK_COLORS } from './ClockPanel';

interface Props {
  state: ScoreboardState;
  rtcTime: { hours: string; minutes: string; seconds: string; date: string };
  formatTimer: (secs: number) => string;
  onSetBrightness?: (brightness: number) => void;
  onSetClockColor?: (color: ClockColor) => void;
}

export const VirtualLedSignPreview: React.FC<Props> = ({ 
  state, 
  rtcTime, 
  formatTimer,
  onSetBrightness,
  onSetClockColor
}) => {
  const [showBrightnessPopover, setShowBrightnessPopover] = useState(false);
  const [showColorPopover, setShowColorPopover] = useState(false);
  const isClockMode = state.appMode === 'clock';
  const isBannerMode = state.appMode === 'banner';

  const currentMinutes = Math.floor(Math.max(0, state.timerSeconds) / 60);
  const currentSeconds = Math.max(0, state.timerSeconds) % 60;

  // Color activo de reloj
  const activeClockColor = CLOCK_COLORS.find((c) => c.id === state.clockColor) || CLOCK_COLORS[0];

  // Cálculo óptico de intensidad LED simulada
  const visualIntensity = 0.45 + (state.brightness / 100) * 0.55;
  const glowIntensity = (state.brightness / 100);

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

  return (
    <div className="bg-slate-950 border-4 border-slate-800 rounded-2xl p-4 shadow-2xl overflow-hidden relative">
      {/* Marco de cartel metálico con tornillos decorativos */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-600 border border-slate-400"></div>
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-600 border border-slate-400"></div>
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-600 border border-slate-400"></div>
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-600 border border-slate-400"></div>

      {/* Header del Cartel con Selector Rápido de Brillo y Color */}
      <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-2 mb-3 gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-[11px] font-extrabold tracking-widest uppercase text-slate-400 font-stadium">
            CARTEL LED GIMNASIO • VISTA PREVIA FÍSICA (MAX7219 / RGB)
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono-code relative">
          
          {/* Botón selector de Color Rápido (especialmente útil en modo RTC) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowColorPopover(!showColorPopover);
                setShowBrightnessPopover(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border text-white font-bold transition shadow-sm"
              style={{ borderColor: `${activeClockColor.hex}60` }}
              title="Cambiar color del display RTC"
            >
              <span 
                className="w-2.5 h-2.5 rounded-full border border-black/50 shadow-sm"
                style={{ backgroundColor: activeClockColor.hex }}
              ></span>
              <span className="hidden sm:inline" style={{ color: activeClockColor.hex }}>
                {activeClockColor.name}
              </span>
            </button>

            {/* Popover flotante de Color */}
            {showColorPopover && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl z-30 space-y-2 font-sans">
                <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    Color Reloj RTC
                  </span>
                  <span style={{ color: activeClockColor.hex }} className="font-mono text-[10px] font-bold">
                    {activeClockColor.name}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {CLOCK_COLORS.map((c) => {
                    const isSelected = state.clockColor === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          handleColorChange(c.id);
                          setShowColorPopover(false);
                        }}
                        className={`p-1.5 rounded-lg border flex flex-col items-center justify-center transition gap-1 ${
                          isSelected ? 'bg-slate-950 border-white' : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800'
                        }`}
                        title={c.name}
                      >
                        <span 
                          className="w-4 h-4 rounded-full border border-black/40 shadow"
                          style={{ backgroundColor: c.hex }}
                        ></span>
                        <span className="text-[9px] text-slate-300 font-bold truncate max-w-full">
                          {c.id.toUpperCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Botón selector de Brillo interactivo */}
          <div className="relative">
            <button
              onClick={() => {
                setShowBrightnessPopover(!showBrightnessPopover);
                setShowColorPopover(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold transition shadow-sm"
              title="Ajustar brillo del cartel físico y digital"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span>BRILLO: {state.brightness}%</span>
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

          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-400 font-stadium font-bold">
            {isClockMode ? 'MODO RTC' : isBannerMode ? 'MODO TEXTO' : `PERIODO ${state.period}`}
          </span>
        </div>
      </div>

      {/* Pantalla LED simulada con respuesta visual a Brillo y Color */}
      <div style={{ opacity: visualIntensity }}>
        {isClockMode ? (
          // Modo Reloj RTC con Color Dinámico
          <div 
            className="bg-black/90 rounded-xl p-6 border text-center flex flex-col items-center justify-center min-h-[140px] transition-colors duration-300"
            style={{ borderColor: `${activeClockColor.hex}40` }}
          >
            <span 
              className="text-xs font-mono mb-1 tracking-widest uppercase font-bold"
              style={{ color: activeClockColor.hex }}
            >
              HORA OFICIAL RTC (DS3231) • {activeClockColor.name}
            </span>
            <div 
              className="font-digital text-5xl sm:text-7xl font-bold tracking-wider transition-colors duration-300"
              style={{ 
                color: activeClockColor.hex,
                textShadow: `0 0 ${12 * glowIntensity}px rgba(${activeClockColor.glowRgb}, ${glowIntensity})` 
              }}
            >
              {rtcTime.hours}:{rtcTime.minutes}:{rtcTime.seconds}
            </div>
            <span className="text-xs font-mono text-slate-400 mt-2">{rtcTime.date} • BUENOS AIRES (UTC-3)</span>
          </div>
        ) : isBannerMode ? (
          // Modo Mensaje Marquee
          <div className="bg-black/90 rounded-xl p-6 border border-amber-500/30 text-center flex flex-col items-center justify-center min-h-[140px] overflow-hidden">
            <span className="text-xs font-mono text-amber-400/80 mb-2">CARTELERA DE MENSAJES LED</span>
            <div 
              className="font-stadium text-2xl sm:text-3xl font-extrabold text-amber-400 glow-amber tracking-wider truncate w-full"
              style={{ textShadow: `0 0 ${10 * glowIntensity}px rgba(245, 158, 11, ${glowIntensity})` }}
            >
              {state.marqueeText || 'BIENVENIDOS AL GIMNASIO'}
            </div>
          </div>
        ) : (
          // Modo Tablero Deportivo
          <div className="grid grid-cols-3 gap-3 bg-black/90 p-3 sm:p-4 rounded-xl border border-slate-800">
            
            {/* LOCAL */}
            <div className="flex flex-col items-center justify-center bg-slate-900/60 rounded-lg p-2 border border-blue-500/30">
              <div className="flex items-center space-x-1">
                {state.possession === 'local' && (
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                )}
                <span className="text-xs font-black tracking-wider text-blue-400 uppercase truncate max-w-[90px]">
                  {state.localName || 'LOCAL'}
                </span>
              </div>
              <div 
                className="font-digital text-4xl sm:text-6xl font-black text-blue-500 glow-blue"
                style={{ textShadow: `0 0 ${10 * glowIntensity}px rgba(59, 130, 246, ${glowIntensity})` }}
              >
                {String(state.scoreLocal).padStart(2, '0')}
              </div>
              <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                <span>F: <b className="text-blue-300">{state.foulsLocal}</b></span>
                <span>TM: <b className="text-blue-300">{state.timeoutsLocal}</b></span>
              </div>
            </div>

            {/* CRONÓMETRO (MINUTOS : SEGUNDOS) Y PERIODO */}
            <div className="flex flex-col items-center justify-center bg-slate-900/60 rounded-lg p-2 border border-amber-500/30">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  {state.timerMode === 'down' ? 'TIEMPO (MIN : SEG)' : 'ASCENDENTE'}
                </span>
                {state.timerRunning && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                )}
              </div>
              
              {/* Display MM:SS */}
              <div 
                className="flex items-center justify-center font-digital text-3xl sm:text-5xl font-black text-amber-400 glow-amber leading-none my-1"
                style={{ textShadow: `0 0 ${12 * glowIntensity}px rgba(245, 158, 11, ${glowIntensity})` }}
              >
                <span>{String(currentMinutes).padStart(2, '0')}</span>
                <span className={`mx-0.5 ${state.timerRunning ? 'animate-pulse' : ''}`}>:</span>
                <span>{String(currentSeconds).padStart(2, '0')}</span>
              </div>

              <div className="flex items-center space-x-2 text-[9px] text-amber-400/80 font-mono mb-1">
                <span>MIN</span>
                <span>•</span>
                <span>SEG</span>
              </div>

              <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-0.5">
                <span>PER: <b className="text-amber-300">{state.period}</b></span>
                {state.shotClockVisible && (
                  <span className="px-1.5 py-0.2 rounded bg-red-950/80 border border-red-500 text-red-400 font-digital font-bold text-xs">
                    24s: {state.shotClockSeconds}
                  </span>
                )}
              </div>
            </div>

            {/* VISITANTE */}
            <div className="flex flex-col items-center justify-center bg-slate-900/60 rounded-lg p-2 border border-red-500/30">
              <div className="flex items-center space-x-1">
                <span className="text-xs font-black tracking-wider text-red-400 uppercase truncate max-w-[90px]">
                  {state.visitorName || 'VISITANTE'}
                </span>
                {state.possession === 'visitor' && (
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                )}
              </div>
              <div 
                className="font-digital text-4xl sm:text-6xl font-black text-red-500 glow-red"
                style={{ textShadow: `0 0 ${10 * glowIntensity}px rgba(239, 68, 68, ${glowIntensity})` }}
              >
                {String(state.scoreVisitor).padStart(2, '0')}
              </div>
              <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                <span>F: <b className="text-red-300">{state.foulsVisitor}</b></span>
                <span>TM: <b className="text-red-300">{state.timeoutsVisitor}</b></span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
