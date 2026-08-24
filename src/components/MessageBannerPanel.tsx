import React, { useState } from 'react';
import { ScoreboardState, ClockColor } from '../types';
import { 
  Send, 
  Sparkles, 
  Sun, 
  Type, 
  MessageSquare, 
  ArrowRight, 
  ArrowLeft, 
  Pause, 
  Play, 
  Layers, 
  Gauge, 
  Palette, 
  Check, 
  AlignJustify
} from 'lucide-react';
import { CLOCK_COLORS } from './ClockPanel';

interface Props {
  state: ScoreboardState;
  updateState: (partial: Partial<ScoreboardState>) => void;
  onSendMarqueeText: (text: string) => void;
  onSetBrightness: (brightness: number) => void;
}

export const MessageBannerPanel: React.FC<Props> = ({
  state,
  updateState,
  onSendMarqueeText,
  onSetBrightness,
}) => {
  const [line1, setLine1] = useState(state.marqueeText || 'BIENVENIDOS AL GIMNASIO');
  const [line2, setLine2] = useState(state.marqueeLine2 || 'TORNEO INTERCOLEGIAL');

  const presets = [
    { l1: 'BIENVENIDOS AL GIMNASIO', l2: 'COLEGIO NACIONAL' },
    { l1: 'TORNEO INTERCOLEGIAL', l2: 'TEMPORADA 2026' },
    { l1: '¡¡GOLAZO HISTORICO!!', l2: 'VAMOS EQUIPO' },
    { l1: '¡¡TRIPLE ESPECTACULAR!!', l2: 'TIEMPO FUERA' },
    { l1: 'FIN DEL PARTIDO', l2: 'GRACIAS POR VENIR' },
    { l1: 'CAMPEONES COPA 2026', l2: 'FELICITACIONES' },
    { l1: 'PROXIMO ENCUENTRO', l2: 'VIERNES 18:00 HS' },
  ];

  const handleApplyText = () => {
    updateState({ 
      marqueeText: line1.toUpperCase(),
      marqueeLine2: line2.toUpperCase()
    });
    // Envío del comando enriquecido por protocolo serie: MSG:L1|L2
    onSendMarqueeText(`${line1.toUpperCase()}|${line2.toUpperCase()}`);
  };

  const isTwoLines = state.bannerModeType !== 'single_line';
  const isStatic = state.bannerAnimation === 'static';
  const isLeftToRight = state.scrollDirection === 'left_to_right';
  const currentFontSize = state.bannerFontSize || '3x5';
  const maxCapacity = currentFontSize === '3x5' ? 16 : currentFontSize === '4x6' ? 12 : 10;
  const activeColor = CLOCK_COLORS.find(c => c.id === (state.bannerColor || 'amber')) || CLOCK_COLORS[2];

  return (
    <div className="space-y-5">
      {/* PANEL 1: CONFIGURACIÓN DE TEXTO Y DOS RENGLONES */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase font-stadium tracking-wider">
                Cartel de Mensajes en Retícula LED 17x64
              </h3>
              <p className="text-xs text-slate-400">
                Tipografía activa: <span className="text-amber-400 font-bold font-mono-code">{currentFontSize}</span> ({maxCapacity} letras/línea estáticas, sin deformación ni corte)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Selector de Tamaño de Letra */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs font-stadium font-bold">
              <button
                type="button"
                onClick={() => updateState({ bannerFontSize: '3x5' })}
                title="3x5 Compacta: hasta 16 letras por línea, óptima legibilidad"
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
                  (state.bannerFontSize || '3x5') === '3x5'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>3×5 COMPACTA</span>
              </button>
              <button
                type="button"
                onClick={() => updateState({ bannerFontSize: '4x6' })}
                title="4x6 Mediana: equilibrio hasta 12 letras por línea"
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
                  state.bannerFontSize === '4x6'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>4×6 MEDIA</span>
              </button>
              <button
                type="button"
                onClick={() => updateState({ bannerFontSize: '5x7' })}
                title="5x7 Grande: clásica de 10 letras por línea"
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
                  state.bannerFontSize === '5x7'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>5×7 GRANDE</span>
              </button>
            </div>

            {/* Toggle 2 Renglones vs 1 Renglón */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs font-stadium font-bold">
              <button
                type="button"
                onClick={() => updateState({ bannerModeType: 'two_lines' })}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  isTwoLines ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2 RENGLONES</span>
              </button>
              <button
                type="button"
                onClick={() => updateState({ bannerModeType: 'single_line' })}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  !isTwoLines ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlignJustify className="w-3.5 h-3.5" />
                <span>1 RENGLÓN</span>
              </button>
            </div>
          </div>
        </div>

        {/* Inputs para Renglones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-bold font-stadium text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-black">1</span>
                RENGLÓN SUPERIOR (Filas 1-7)
              </span>
              <span className="text-[10px] text-slate-500 font-mono-code">{line1.length} caracteres</span>
            </label>
            <div className="relative">
              <Type className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                placeholder="Ej: BIENVENIDOS AL GIMNASIO"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white font-stadium uppercase focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
              />
            </div>
          </div>

          {isTwoLines && (
            <div>
              <label className="text-xs font-bold font-stadium text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-black">2</span>
                  RENGLÓN INFERIOR (Filas 9-15)
                </span>
                <span className="text-[10px] text-slate-500 font-mono-code">{line2.length} caracteres</span>
              </label>
              <div className="relative">
                <Type className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  placeholder="Ej: TORNEO INTERCOLEGIAL"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white font-stadium uppercase focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                />
              </div>
            </div>
          )}
        </div>

        {/* Botón Aplicar */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleApplyText}
            className="bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-stadium font-black px-6 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg transition"
          >
            <Send className="w-4 h-4" />
            <span>APLICAR AL CARTEL LED</span>
          </button>
        </div>

        {/* Mensajes Predefinidos Rápidos */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <span className="text-xs font-bold text-slate-400 mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Plantillas Rápidas Preconfiguradas:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {presets.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setLine1(p.l1);
                  setLine2(p.l2);
                  updateState({ 
                    marqueeText: p.l1,
                    marqueeLine2: p.l2
                  });
                  onSendMarqueeText(`${p.l1}|${p.l2}`);
                }}
                className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left p-2.5 rounded-xl transition flex flex-col group"
              >
                <span className="text-xs font-stadium font-bold text-amber-300 group-hover:text-amber-200 truncate">
                  {p.l1}
                </span>
                <span className="text-[11px] font-mono-code text-slate-400 truncate">
                  {p.l2}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PANEL 2: OPCIONES DE ANIMACIÓN (ESTÁTICO VS DESPLAZAMIENTO IZQ -> DER) Y COLOR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* MODO DE MOVIMIENTO: ESTÁTICO O CORRE EN PANTALLA */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Gauge className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-extrabold text-white uppercase font-stadium">
              Modo de Visualización & Animación
            </h3>
          </div>

          {/* Selector Estático vs Desplazamiento */}
          <div>
            <label className="text-xs font-bold text-slate-300 mb-2 block font-stadium">
              COMPORTAMIENTO DEL TEXTO:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateState({ bannerAnimation: 'static' })}
                className={`py-3 px-3 rounded-xl border font-stadium font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition ${
                  isStatic
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Pause className="w-5 h-5 text-amber-400" />
                <span>TEXTO ESTÁTICO (FIJO)</span>
                <span className="text-[10px] font-normal text-slate-400 font-sans">Centrado en pantalla</span>
              </button>

              <button
                type="button"
                onClick={() => updateState({ bannerAnimation: 'scroll' })}
                className={`py-3 px-3 rounded-xl border font-stadium font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition ${
                  !isStatic
                    ? 'bg-blue-500/15 border-blue-500 text-blue-300 shadow-md ring-1 ring-blue-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Play className="w-5 h-5 text-blue-400" />
                <span>TEXTO QUE CORRE (MARQUESINA)</span>
                <span className="text-[10px] font-normal text-slate-400 font-sans">Desplazamiento continuo</span>
              </button>
            </div>
          </div>

          {/* Dirección de Desplazamiento (si está en modo scroll) */}
          {!isStatic && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 block font-stadium">
                DIRECCIÓN DEL DESPLAZAMIENTO:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateState({ scrollDirection: 'left_to_right' })}
                  className={`py-2 px-3 rounded-xl border font-stadium font-bold text-xs flex items-center justify-center gap-2 transition ${
                    isLeftToRight
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                  <span>IZQ ➔ DER</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateState({ scrollDirection: 'right_to_left' })}
                  className={`py-2 px-3 rounded-xl border font-stadium font-bold text-xs flex items-center justify-center gap-2 transition ${
                    !isLeftToRight
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-400" />
                  <span>DER ➔ IZQ</span>
                </button>
              </div>

              {/* Control de Velocidad de desplazamiento */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-stadium font-bold text-slate-300">VELOCIDAD DE AVANCE (50% REDUCIDA):</span>
                  <span className="font-mono-code font-bold text-amber-400">
                    Nivel {state.bannerSpeed || 3} ({
                      (state.bannerSpeed || 3) === 1 ? '180ms - Muy Serena' :
                      (state.bannerSpeed || 3) === 2 ? '145ms - Lenta' :
                      (state.bannerSpeed || 3) === 3 ? '110ms - Moderada' :
                      (state.bannerSpeed || 3) === 4 ? '85ms - Ágil' : '60ms - Rápida'
                    })
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={state.bannerSpeed || 3}
                  onChange={(e) => updateState({ bannerSpeed: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono-code mt-1">
                  <span className="text-emerald-400 font-bold">1 (Muy suave y serena)</span>
                  <span>2 (Lenta)</span>
                  <span className="text-amber-400">3 (Normal)</span>
                  <span>4 (Ágil)</span>
                  <span>5 (Rápida)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COLORES Y BRILLO LED */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Palette className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-extrabold text-white uppercase font-stadium">
              Color de Letras & Brillo
            </h3>
          </div>

          {/* Selector de Color de las Letras */}
          <div>
            <label className="text-xs font-bold text-slate-300 mb-2 block font-stadium">
              COLOR DE LOS LEDS DEL CARTEL:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CLOCK_COLORS.map((c) => {
                const isSelected = (state.bannerColor || 'amber') === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => updateState({ bannerColor: c.id })}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                      isSelected
                        ? 'bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span 
                      className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[10px] font-stadium font-bold text-slate-300">
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Control de Brillo e Intensidad LED */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold font-stadium text-slate-300">
                  BRILLO DEL CARTEL LUMINOSO
                </span>
              </div>
              <span className="text-xs font-bold font-mono-code text-amber-400 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
                {state.brightness}%
              </span>
            </div>

            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={state.brightness}
              onChange={(e) => {
                const val = Number(e.target.value);
                updateState({ brightness: val });
                onSetBrightness(val);
              }}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-mono-code mt-1.5">
              <span>5% (Ahorro/Noche)</span>
              <span>50% (Gimnasio Interior)</span>
              <span>100% (Día / Sol)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
