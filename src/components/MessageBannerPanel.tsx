import React from 'react';
import { ScoreboardState } from '../types';
import { Send, Sparkles, Sun, Type, MessageSquare } from 'lucide-react';

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
  const [inputText, setInputText] = React.useState(state.marqueeText);

  const presets = [
    'BIENVENIDOS AL GIMNASIO',
    'TORNEO INTERCOLEGIAL 2026',
    '¡¡GOLAZO!!',
    '¡¡TRIPLE!! 🏀🔥',
    'TIEMPO FUERA',
    'FIN DEL PARTIDO',
    'VAMOS COLEGIO',
    'CAMPEONES 🏆'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      updateState({ marqueeText: inputText.toUpperCase() });
      onSendMarqueeText(inputText.toUpperCase());
    }
  };

  return (
    <div className="space-y-4">
      {/* Entrada de Texto para Cartelera LED */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-extrabold text-white uppercase font-stadium">
              Mensaje en Pantalla LED / Matriz de Puntos
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono-code">CMD: MSG:TEXTO</span>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Type className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe el mensaje para el cartel..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white font-stadium uppercase focus:border-amber-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-stadium font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-lg transition"
          >
            <Send className="w-4 h-4" />
            <span>ENVIAR</span>
          </button>
        </form>

        {/* Mensajes Predefinidos Rápidos */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <span className="text-xs font-bold text-slate-400 mb-2 block flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Mensajes Rápidos para Actos y Partidos:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((msg, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setInputText(msg);
                  updateState({ marqueeText: msg });
                  onSendMarqueeText(msg);
                }}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg text-xs font-medium transition"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Control de Brillo e Intensidad LED */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <Sun className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-extrabold text-white uppercase font-stadium">
              Brillo del Cartel Luminoso
            </h3>
          </div>
          <span className="text-sm font-bold font-mono-code text-amber-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
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

        <div className="flex justify-between text-[11px] text-slate-500 font-mono-code mt-2">
          <span>5% (Ahorro/Noche)</span>
          <span>50% (Gimnasio Interior)</span>
          <span>100% (Máxima Visibilidad Día)</span>
        </div>
      </div>
    </div>
  );
};
