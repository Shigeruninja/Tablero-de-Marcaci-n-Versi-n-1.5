import React, { useState, useEffect } from 'react';
import { ShortcutActionId, ShortcutDefinition, KeyboardShortcutsMap } from '../types';
import { 
  SHORTCUT_DEFINITIONS, 
  PRESETS, 
  formatKeyCode, 
  saveStoredShortcuts 
} from '../utils/keyboardManager';
import { 
  Keyboard, X, RotateCcw, Check, AlertTriangle, Sparkles, 
  Timer, Award, Flame, Volume2, Calendar, HelpCircle, Layers
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcutsMap;
  onSaveShortcuts: (updated: KeyboardShortcutsMap) => void;
  enabled: boolean;
  onToggleEnabled: (val: boolean) => void;
}

export const KeyboardConfigModal: React.FC<Props> = ({
  isOpen,
  onClose,
  shortcuts,
  onSaveShortcuts,
  enabled,
  onToggleEnabled,
}) => {
  const [localMap, setLocalMap] = useState<KeyboardShortcutsMap>(shortcuts);
  const [editingActionId, setEditingActionId] = useState<ShortcutActionId | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lastKeyPressed, setLastKeyPressed] = useState<{ code: string; label: string } | null>(null);

  useEffect(() => {
    setLocalMap(shortcuts);
  }, [shortcuts, isOpen]);

  // Listener para capturar la tecla cuando se está reasignando
  useEffect(() => {
    if (!editingActionId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Permitir cancelar con Escape
      if (e.code === 'Escape') {
        setEditingActionId(null);
        return;
      }

      // Asignar la tecla presionada
      const newCode = e.code;
      setLocalMap((prev) => ({
        ...prev,
        [editingActionId]: newCode,
      }));
      setLastKeyPressed({ code: newCode, label: formatKeyCode(newCode) });
      setEditingActionId(null);
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [editingActionId]);

  if (!isOpen) return null;

  // Encontrar conflictos (misma tecla asignada a más de una acción)
  const keyUsageCount: Record<string, number> = {};
  (Object.values(localMap) as string[]).forEach((code) => {
    if (code) {
      keyUsageCount[code] = (keyUsageCount[code] || 0) + 1;
    }
  });

  const categories = [
    { id: 'all', label: 'Todos los Macros', icon: Layers },
    { id: 'timer', label: 'Reloj y Tiempo', icon: Timer },
    { id: 'local', label: 'Tanteador Local', icon: Award },
    { id: 'visitor', label: 'Tanteador Visitante', icon: Award },
    { id: 'shot_clock', label: 'Posesión y 24s', icon: Flame },
    { id: 'audio', label: 'Chicharra y Sonidos', icon: Volume2 },
    { id: 'game', label: 'Periodo / Juego', icon: Calendar },
  ];

  const filteredShortcuts = activeCategory === 'all' 
    ? SHORTCUT_DEFINITIONS 
    : SHORTCUT_DEFINITIONS.filter(s => s.category === activeCategory);

  const handleApplyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      setLocalMap({ ...preset.map });
    }
  };

  const handleResetToDefault = () => {
    setLocalMap({ ...PRESETS.standard.map });
  };

  const handleSaveAndClose = () => {
    saveStoredShortcuts(localMap);
    onSaveShortcuts(localMap);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cabecera del Modal */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Keyboard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-stadium font-black text-white">
                  CONFIGURACIÓN DE MACROS DE TECLADO (MODO PC)
                </h2>
                <span className="text-[10px] font-mono-code bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  MESA DE CONTROL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Opera el tanteador, tiempo y chicharra al instante mediante pulsaciones directas del teclado
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle de activación general */}
            <label className="flex items-center gap-2 cursor-pointer bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => onToggleEnabled(e.target.checked)}
                className="w-4 h-4 text-emerald-500 rounded bg-slate-950 border-slate-700 focus:ring-0"
              />
              <span className="text-xs font-bold text-slate-300">
                {enabled ? '⌨️ Macros Activos' : '🚫 Macros Desactivados'}
              </span>
            </label>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Presets Rápidos */}
        <div className="bg-slate-950/60 p-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Cargar Preset:
            </span>
            <button
              onClick={() => handleApplyPreset('standard')}
              className="bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 font-bold px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
              title={PRESETS.standard.description}
            >
              🎮 2 Manos (QWE / UIO)
            </button>
            <button
              onClick={() => handleApplyPreset('numpad')}
              className="bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 font-bold px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
              title={PRESETS.numpad.description}
            >
              🔢 Teclado Numérico (Numpad)
            </button>
            <button
              onClick={() => handleApplyPreset('function_keys')}
              className="bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 font-bold px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
              title={PRESETS.function_keys.description}
            >
              ⚡ Teclas F1 - F12
            </button>
          </div>

          <button
            onClick={handleResetToDefault}
            className="text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer fábrica</span>
          </button>
        </div>

        {/* Selector de Categorías */}
        <div className="bg-slate-900 px-4 pt-2.5 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-2 rounded-t-xl font-bold flex items-center gap-1.5 transition border-t border-x whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-950 text-amber-400 border-amber-500/50 shadow'
                    : 'bg-slate-900/50 text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal de Espera de Tecla (Overlay si está escuchando) */}
        {editingActionId && (
          <div className="bg-amber-950/90 border-y-2 border-amber-500 p-4 text-center animate-pulse">
            <h3 className="text-base font-stadium font-black text-amber-300 uppercase">
              ⌨️ PRESIONA LA NUEVA TECLA EN TU TECLADO...
            </h3>
            <p className="text-xs text-amber-200 mt-1">
              Asignando a: <b className="text-white underline">{SHORTCUT_DEFINITIONS.find(s => s.id === editingActionId)?.name}</b>
            </p>
            <span className="inline-block mt-2 text-[11px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              Presiona <kbd className="font-mono text-amber-400 font-bold">ESC</kbd> para cancelar
            </span>
          </div>
        )}

        {/* LISTA DE ACCIONES Y TECLAS ASIGNADAS */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-950/80">
          
          {filteredShortcuts.map((def) => {
            const currentCode = localMap[def.id] || '';
            const isEditing = editingActionId === def.id;
            const hasConflict = currentCode && (keyUsageCount[currentCode] || 0) > 1;

            return (
              <div
                key={def.id}
                className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 transition ${
                  isEditing 
                    ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30'
                    : hasConflict 
                      ? 'bg-rose-950/20 border-rose-500/50 hover:border-rose-400' 
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Nombre y descripción */}
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-200">
                      {def.name}
                    </span>
                    {hasConflict && (
                      <span className="flex items-center gap-1 text-[10px] font-mono-code font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        Tecla Duplicada
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {def.description}
                  </p>
                </div>

                {/* Visualizador de tecla y botón de cambio */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <span className={`font-mono text-xs font-bold px-3 py-1.5 rounded-lg border shadow-inner min-w-[80px] text-center ${
                      isEditing
                        ? 'bg-amber-500 text-slate-950 font-black animate-bounce'
                        : hasConflict
                          ? 'bg-rose-900/60 text-rose-200 border-rose-500'
                          : 'bg-slate-950 text-amber-400 border-amber-500/40'
                    }`}>
                      {isEditing ? 'PULSAR...' : formatKeyCode(currentCode)}
                    </span>
                  </div>

                  <button
                    onClick={() => setEditingActionId(isEditing ? null : def.id)}
                    className={`px-3 py-1.5 rounded-lg font-stadium font-bold text-xs transition active:scale-95 ${
                      isEditing
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isEditing ? 'CANCELAR' : 'CAMBIAR TECLA'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* PIE DEL MODAL */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>
              <b>Nota:</b> Los atajos no se activan mientras escribes dentro de campos de texto o mensajes.
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAndClose}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-stadium font-bold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg transition"
            >
              <Check className="w-4 h-4" />
              <span>GUARDAR Y APLICAR</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
