import React from 'react';
import { ScoreboardState } from '../types';
import { Clock, RotateCw, CheckCircle, Calendar, Zap } from 'lucide-react';

interface Props {
  state: ScoreboardState;
  updateState: (partial: Partial<ScoreboardState>) => void;
  rtcTime: { hours: string; minutes: string; seconds: string; date: string };
  onSyncRtc: () => void;
}

export const ClockPanel: React.FC<Props> = ({ state, updateState, rtcTime, onSyncRtc }) => {
  return (
    <div className="space-y-4">
      {/* Panel Central del Reloj */}
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-xl text-center">
        <div className="flex flex-wrap justify-between items-center mb-4 pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-extrabold text-cyan-400 uppercase tracking-wider font-stadium">
              Modo Reloj de Pared / Hora Oficial (RTC DS3231)
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono-code bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{rtcTime.date} (Buenos Aires UTC-3)</span>
          </div>
        </div>

        {/* Gran Display Digital */}
        <div className="bg-black/95 border-2 border-cyan-500/60 rounded-2xl py-6 my-4 shadow-inner">
          <span className="font-digital text-6xl sm:text-8xl font-black text-cyan-400 glow-cyan tracking-wider">
            {rtcTime.hours}:{rtcTime.minutes}:{rtcTime.seconds}
          </span>
        </div>

        {/* Botón de Sincronización y Configuración */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <button
            onClick={onSyncRtc}
            className="bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-stadium font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition"
          >
            <RotateCw className="w-5 h-5" />
            <span>SINCRONIZAR HORA CON ARDUINO</span>
          </button>

          <label className="flex items-center justify-center bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 space-x-2.5 cursor-pointer hover:border-cyan-500/50 transition">
            <input
              type="checkbox"
              checked={state.autoSyncRtc}
              onChange={(e) => updateState({ autoSyncRtc: e.target.checked })}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-400 w-4 h-4"
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
              El módulo DS3231 tiene compensación de temperatura para no atrasarse.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-start space-x-3">
          <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-slate-200">Batería de Respaldo CR2032</h4>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Mantiene la hora incluso cuando se corta la luz del colegio.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-start space-x-3">
          <Clock className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-slate-200">Protocolo I2C</h4>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Conexión simple en pines A4 (SDA) y A5 (SCL) del Arduino Uno / Nano.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
