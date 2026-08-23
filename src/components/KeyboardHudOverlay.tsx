import React, { useState } from 'react';
import { KeyboardShortcutsMap } from '../types';
import { formatKeyCode } from '../utils/keyboardManager';
import { Keyboard, ChevronDown, ChevronUp, Settings, Eye, EyeOff } from 'lucide-react';

interface Props {
  shortcuts: KeyboardShortcutsMap;
  enabled: boolean;
  onOpenConfig: () => void;
  lastTriggeredAction: string | null;
}

export const KeyboardHudOverlay: React.FC<Props> = ({
  shortcuts,
  enabled,
  onOpenConfig,
  lastTriggeredAction,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!enabled) return null;

  const keyGroups = [
    {
      title: 'LOCAL',
      color: 'border-blue-500/50 bg-blue-950/30 text-blue-300',
      items: [
        { label: '+1', code: shortcuts.score_local_add1, action: 'score_local_add1' },
        { label: '+2', code: shortcuts.score_local_add2, action: 'score_local_add2' },
        { label: '+3', code: shortcuts.score_local_add3, action: 'score_local_add3' },
        { label: '-1', code: shortcuts.score_local_sub1, action: 'score_local_sub1' },
        { label: 'Falta', code: shortcuts.foul_local_add, action: 'foul_local_add' },
        { label: 'T.Out', code: shortcuts.timeout_local, action: 'timeout_local' },
      ]
    },
    {
      title: 'VISITANTE',
      color: 'border-red-500/50 bg-red-950/30 text-red-300',
      items: [
        { label: '+1', code: shortcuts.score_visitor_add1, action: 'score_visitor_add1' },
        { label: '+2', code: shortcuts.score_visitor_add2, action: 'score_visitor_add2' },
        { label: '+3', code: shortcuts.score_visitor_add3, action: 'score_visitor_add3' },
        { label: '-1', code: shortcuts.score_visitor_sub1, action: 'score_visitor_sub1' },
        { label: 'Falta', code: shortcuts.foul_visitor_add, action: 'foul_visitor_add' },
        { label: 'T.Out', code: shortcuts.timeout_visitor, action: 'timeout_visitor' },
      ]
    },
    {
      title: 'CRONÓMETRO',
      color: 'border-amber-500/50 bg-amber-950/30 text-amber-300',
      items: [
        { label: 'Play/Pausa', code: shortcuts.timer_toggle, action: 'timer_toggle' },
        { label: 'Reset', code: shortcuts.timer_reset, action: 'timer_reset' },
        { label: '+1 Min', code: shortcuts.timer_add_min, action: 'timer_add_min' },
        { label: '-1 Min', code: shortcuts.timer_sub_min, action: 'timer_sub_min' },
      ]
    },
    {
      title: 'POSESIÓN / 24s',
      color: 'border-purple-500/50 bg-purple-950/30 text-purple-300',
      items: [
        { label: '24s', code: shortcuts.shot_clock_24, action: 'shot_clock_24' },
        { label: '14s', code: shortcuts.shot_clock_14, action: 'shot_clock_14' },
        { label: 'Pausa', code: shortcuts.shot_clock_toggle, action: 'shot_clock_toggle' },
        { label: 'Flecha', code: shortcuts.possession_arrow, action: 'possession_arrow' },
      ]
    },
    {
      title: 'AUDIO / BOCINA',
      color: 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300',
      items: [
        { label: 'Bocina', code: shortcuts.horn_trigger, action: 'horn_trigger' },
        { label: 'Silbato', code: shortcuts.whistle_trigger, action: 'whistle_trigger' },
        { label: '¡Gol!', code: shortcuts.goal_sound_trigger, action: 'goal_sound_trigger' },
      ]
    }
  ];

  return (
    <div className="bg-slate-900/95 border-2 border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-300">
      
      {/* Barra de cabecera del HUD */}
      <div className="px-4 py-2.5 bg-slate-950/90 flex items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Keyboard className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-stadium font-black text-slate-200 uppercase tracking-wide">
            GUÍA DE ATRIBUTOS Y MACROS DE TECLADO (PC)
          </span>
          <span className="text-[10px] font-mono-code bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
            ACTIVO
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenConfig}
            className="text-xs text-amber-400 hover:text-amber-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1 transition"
            title="Configurar y Reasignar Teclas"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Personalizar Teclas</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            title={isExpanded ? 'Ocultar detalles' : 'Ver todos los atajos'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Vista resumida (Siempre visible) */}
      <div className="p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-900">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-bold text-[11px] mr-1">Rápidos:</span>
          
          {/* Espacio */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition ${
            lastTriggeredAction === 'timer_toggle'
              ? 'bg-amber-500 text-slate-950 font-black border-amber-400 ring-2 ring-amber-400 animate-pulse'
              : 'bg-slate-950 border-amber-500/40 text-amber-300'
          }`}>
            <kbd className="font-mono text-[10px] font-bold uppercase">{formatKeyCode(shortcuts.timer_toggle)}</kbd>
            <span className="text-[10px] text-slate-400 font-sans">Pausa/Play</span>
          </div>

          {/* Local +1 */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition ${
            lastTriggeredAction === 'score_local_add1'
              ? 'bg-blue-500 text-white font-black border-blue-400 ring-2 ring-blue-400 animate-pulse'
              : 'bg-slate-950 border-blue-500/40 text-blue-300'
          }`}>
            <kbd className="font-mono text-[10px] font-bold uppercase">{formatKeyCode(shortcuts.score_local_add1)}</kbd>
            <span className="text-[10px] text-slate-400 font-sans">+1 Loc</span>
          </div>

          {/* Local +2 */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition ${
            lastTriggeredAction === 'score_local_add2'
              ? 'bg-blue-500 text-white font-black border-blue-400 ring-2 ring-blue-400 animate-pulse'
              : 'bg-slate-950 border-blue-500/40 text-blue-300'
          }`}>
            <kbd className="font-mono text-[10px] font-bold uppercase">{formatKeyCode(shortcuts.score_local_add2)}</kbd>
            <span className="text-[10px] text-slate-400 font-sans">+2 Loc</span>
          </div>

          {/* Visitante +1 */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition ${
            lastTriggeredAction === 'score_visitor_add1'
              ? 'bg-red-500 text-white font-black border-red-400 ring-2 ring-red-400 animate-pulse'
              : 'bg-slate-950 border-red-500/40 text-red-300'
          }`}>
            <kbd className="font-mono text-[10px] font-bold uppercase">{formatKeyCode(shortcuts.score_visitor_add1)}</kbd>
            <span className="text-[10px] text-slate-400 font-sans">+1 Vis</span>
          </div>

          {/* Visitante +2 */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition ${
            lastTriggeredAction === 'score_visitor_add2'
              ? 'bg-red-500 text-white font-black border-red-400 ring-2 ring-red-400 animate-pulse'
              : 'bg-slate-950 border-red-500/40 text-red-300'
          }`}>
            <kbd className="font-mono text-[10px] font-bold uppercase">{formatKeyCode(shortcuts.score_visitor_add2)}</kbd>
            <span className="text-[10px] text-slate-400 font-sans">+2 Vis</span>
          </div>

          {/* 24s */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition ${
            lastTriggeredAction === 'shot_clock_24'
              ? 'bg-purple-500 text-white font-black border-purple-400 ring-2 ring-purple-400 animate-pulse'
              : 'bg-slate-950 border-purple-500/40 text-purple-300'
          }`}>
            <kbd className="font-mono text-[10px] font-bold uppercase">{formatKeyCode(shortcuts.shot_clock_24)}</kbd>
            <span className="text-[10px] text-slate-400 font-sans">24s</span>
          </div>

          {/* 14s */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition ${
            lastTriggeredAction === 'shot_clock_14'
              ? 'bg-purple-500 text-white font-black border-purple-400 ring-2 ring-purple-400 animate-pulse'
              : 'bg-slate-950 border-purple-500/40 text-purple-300'
          }`}>
            <kbd className="font-mono text-[10px] font-bold uppercase">{formatKeyCode(shortcuts.shot_clock_14)}</kbd>
            <span className="text-[10px] text-slate-400 font-sans">14s</span>
          </div>

          {/* Chicharra */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition ${
            lastTriggeredAction === 'horn_trigger'
              ? 'bg-rose-500 text-white font-black border-rose-400 ring-2 ring-rose-400 animate-pulse'
              : 'bg-slate-950 border-rose-500/40 text-rose-300'
          }`}>
            <kbd className="font-mono text-[10px] font-bold uppercase">{formatKeyCode(shortcuts.horn_trigger)}</kbd>
            <span className="text-[10px] text-slate-400 font-sans">Bocina</span>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] font-bold text-slate-400 hover:text-amber-400 flex items-center gap-1 transition ml-auto"
        >
          <span>{isExpanded ? 'Contraer' : 'Ver Todos los Atajos (Expandir)'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Vista expandida con todas las categorías */}
      {isExpanded && (
        <div className="p-3 bg-slate-950/70 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 animate-fadeIn">
          {keyGroups.map((group) => (
            <div key={group.title} className={`p-2.5 rounded-xl border ${group.color}`}>
              <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider block mb-2 opacity-90">
                {group.title}
              </span>
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const isHit = lastTriggeredAction === item.action;
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center justify-between p-1 rounded-lg text-[11px] transition ${
                        isHit
                          ? 'bg-amber-400 text-slate-950 font-black shadow-md scale-105'
                          : 'bg-slate-900/80 text-slate-300'
                      }`}
                    >
                      <span className="font-medium truncate max-w-[80px]">{item.label}</span>
                      <kbd className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/80 text-amber-300 border border-slate-800">
                        {formatKeyCode(item.code)}
                      </kbd>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
