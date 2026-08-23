import React from 'react';
import { ScoreboardState, ClockColor } from '../types';
import { Clock, RotateCw, CheckCircle, Calendar, Zap, Palette, Sparkles, Check } from 'lucide-react';

export interface ClockColorOption {
  id: ClockColor;
  name: string;
  subname: string;
  textColor: string;
  glowClass: string;
  borderColor: string;
  bgDot: string;
  hex: string;
  glowRgb: string;
}

export const CLOCK_COLORS: ClockColorOption[] = [
  {
    id: 'cyan',
    name: 'Cyan Neón',
    subname: 'Nitidez Ultra',
    textColor: 'text-cyan-400',
    glowClass: 'glow-cyan',
    borderColor: 'border-cyan-500/50',
    bgDot: 'bg-cyan-400',
    hex: '#06b6d4',
    glowRgb: '6, 182, 212'
  },
  {
    id: 'green',
    name: 'Verde Digital',
    subname: 'Clásico Deportivo',
    textColor: 'text-emerald-400',
    glowClass: 'glow-emerald',
    borderColor: 'border-emerald-500/50',
    bgDot: 'bg-emerald-400',
    hex: '#10b981',
    glowRgb: '16, 185, 129'
  },
  {
    id: 'amber',
    name: 'Ámbar Cálido',
    subname: 'Gimnasio Vintage',
    textColor: 'text-amber-400',
    glowClass: 'glow-amber',
    borderColor: 'border-amber-500/50',
    bgDot: 'bg-amber-400',
    hex: '#f59e0b',
    glowRgb: '245, 158, 11'
  },
  {
    id: 'red',
    name: 'Rojo Fuego',
    subname: 'Alto Impacto',
    textColor: 'text-red-400',
    glowClass: 'glow-red',
    borderColor: 'border-red-500/50',
    bgDot: 'bg-red-400',
    hex: '#ef4444',
    glowRgb: '239, 68, 68'
  },
  {
    id: 'blue',
    name: 'Azul Cobalto',
    subname: 'Estadio Nocturno',
    textColor: 'text-blue-400',
    glowClass: 'glow-blue',
    borderColor: 'border-blue-500/50',
    bgDot: 'bg-blue-400',
    hex: '#3b82f6',
    glowRgb: '59, 130, 246'
  },
  {
    id: 'purple',
    name: 'Magenta Neón',
    subname: 'Púrpura Vibrante',
    textColor: 'text-purple-400',
    glowClass: 'glow-purple',
    borderColor: 'border-purple-500/50',
    bgDot: 'bg-purple-400',
    hex: '#a855f7',
    glowRgb: '168, 85, 247'
  },
  {
    id: 'white',
    name: 'Blanco Hielo',
    subname: 'Xenón Puro',
    textColor: 'text-slate-100',
    glowClass: 'glow-white',
    borderColor: 'border-slate-300/50',
    bgDot: 'bg-slate-100',
    hex: '#f8fafc',
    glowRgb: '248, 250, 252'
  },
  {
    id: 'lime',
    name: 'Lima / Amarillo',
    subname: 'Máximo Contraste',
    textColor: 'text-lime-400',
    glowClass: 'glow-lime',
    borderColor: 'border-lime-500/50',
    bgDot: 'bg-lime-400',
    hex: '#84cc16',
    glowRgb: '132, 204, 22'
  }
];

interface Props {
  state: ScoreboardState;
  updateState: (partial: Partial<ScoreboardState>) => void;
  rtcTime: { hours: string; minutes: string; seconds: string; date: string };
  onSyncRtc: () => void;
  onSetClockColor?: (color: ClockColor) => void;
}

export const ClockPanel: React.FC<Props> = ({ 
  state, 
  updateState, 
  rtcTime, 
  onSyncRtc,
  onSetClockColor 
}) => {
  const activeColor = CLOCK_COLORS.find((c) => c.id === state.clockColor) || CLOCK_COLORS[0];

  const handleColorSelect = (colorId: ClockColor) => {
    if (onSetClockColor) {
      onSetClockColor(colorId);
    } else {
      updateState({ clockColor: colorId });
    }
  };

  return (
    <div className="space-y-4">
      {/* Panel Central del Reloj con color dinámico */}
      <div 
        className="bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-xl text-center transition-colors duration-300 border"
        style={{ borderColor: `${activeColor.hex}40` }}
      >
        <div className="flex flex-wrap justify-between items-center mb-4 pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" style={{ color: activeColor.hex }} />
            <span className="text-sm font-extrabold uppercase tracking-wider font-stadium text-white">
              Modo Reloj de Pared / Hora Oficial (RTC DS3231)
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono-code bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{rtcTime.date} (Buenos Aires UTC-3)</span>
          </div>
        </div>

        {/* Gran Display Digital con color seleccionado y resplandor óptico */}
        <div 
          className="bg-black/95 border-2 rounded-2xl py-6 my-4 shadow-inner transition-all duration-300"
          style={{ 
            borderColor: `${activeColor.hex}80`,
            boxShadow: `inset 0 0 24px ${activeColor.hex}15`
          }}
        >
          <span 
            className="font-digital text-6xl sm:text-8xl font-black tracking-wider transition-colors duration-300 select-all"
            style={{ 
              color: activeColor.hex,
              textShadow: `0 0 16px rgba(${activeColor.glowRgb}, 0.6), 0 0 32px rgba(${activeColor.glowRgb}, 0.3)`
            }}
          >
            {rtcTime.hours}:{rtcTime.minutes}:{rtcTime.seconds}
          </span>
          <div className="text-[11px] font-mono-code text-slate-400 mt-1 uppercase tracking-widest">
            COLOR ACTIVO: <span style={{ color: activeColor.hex }} className="font-bold">{activeColor.name}</span>
          </div>
        </div>

        {/* SELECTOR DE COLOR DEL RELOJ RTC */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 my-4 text-left space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-850 pb-2">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <span className="font-stadium font-bold text-xs sm:text-sm text-white">
                PALETA DE COLOR PARA EL RELOJ RTC / DISPLAYS
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono-code">
              8 Tonos Digitales Compatibles con MAX7219 / RGB WS2812B
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {CLOCK_COLORS.map((c) => {
              const isSelected = state.clockColor === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleColorSelect(c.id)}
                  className={`p-2.5 rounded-xl border transition flex items-center justify-between text-left group ${
                    isSelected
                      ? 'bg-slate-900 border-2 shadow-lg'
                      : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                  style={{
                    borderColor: isSelected ? c.hex : undefined
                  }}
                >
                  <div className="flex items-center space-x-2.5">
                    <span 
                      className="w-4 h-4 rounded-full border border-black/40 shadow-sm shrink-0"
                      style={{ 
                        backgroundColor: c.hex,
                        boxShadow: isSelected ? `0 0 8px ${c.hex}` : undefined
                      }}
                    ></span>
                    <div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-white leading-tight">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight">
                        {c.subname}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 shrink-0" style={{ color: c.hex }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Botón de Sincronización y Configuración */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <button
            onClick={onSyncRtc}
            className="hover:opacity-90 active:scale-95 text-white font-stadium font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition"
            style={{ backgroundColor: activeColor.hex }}
          >
            <RotateCw className="w-5 h-5 text-slate-950" />
            <span className="text-slate-950 font-black">SINCRONIZAR HORA CON ARDUINO</span>
          </button>

          <label className="flex items-center justify-center bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 space-x-2.5 cursor-pointer hover:border-slate-700 transition">
            <input
              type="checkbox"
              checked={state.autoSyncRtc}
              onChange={(e) => updateState({ autoSyncRtc: e.target.checked })}
              className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-400 w-4 h-4"
            />
            <span className="font-medium">Auto-sincronizar con el RTC cada 60 segundos</span>
          </label>
        </div>
      </div>

      {/* Tarjetas de Información del Módulo RTC DS3231 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-start space-x-3">
          <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-slate-200">Alta Precisión (TCXO)</h4>
            <p className="text-slate-400 text-[11px] mt-0.5">
              El módulo DS3231 tiene oscilador con compensación térmica para desvío menor a 1 minuto al año.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-start space-x-3">
          <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-slate-200">Batería de Respaldo CR2032</h4>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Mantiene la hora exacta incluso si se apaga la fuente o se corta la luz del colegio.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-start space-x-3">
          <Palette className="w-4 h-4 mt-0.5 shrink-0" style={{ color: activeColor.hex }} />
          <div>
            <h4 className="font-bold text-slate-200">Personalización de Color</h4>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Envía el comando serie <code>CLKCLR</code> para actualizar el color en matrices RGB WS2812B.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
