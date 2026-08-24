import React, { useState } from 'react';
import { 
  ScoreboardLedLighting, LedComponentId, LedComponentConfig, LedColorEffect 
} from '../types';
import { 
  LED_COLOR_SWATCHES, LED_EFFECT_DESCRIPTIONS, LED_COMPONENT_LABELS, 
  LED_PRESETS, DEFAULT_LED_LIGHTING 
} from '../utils/ledEffects';
import { 
  Palette, Sparkles, Sliders, X, Check, RotateCcw, Copy, 
  Zap, Flame, Sun, Layers, HelpCircle, ChevronRight, Activity
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lighting: ScoreboardLedLighting;
  onUpdateLighting: (newLighting: ScoreboardLedLighting) => void;
  onApplyPreset: (presetId: string) => void;
  onSyncWithArduino?: (componentId: LedComponentId, config: LedComponentConfig) => void;
}

const COMPONENT_ORDER: LedComponentId[] = [
  'scoreLocal',
  'scoreVisitor',
  'period',
  'timer',
  'possession',
  'banner',
  'clock',
  'border'
];

export const LedLightingConfigModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lighting,
  onUpdateLighting,
  onApplyPreset,
  onSyncWithArduino,
}) => {
  const [selectedCompId, setSelectedCompId] = useState<LedComponentId>('scoreLocal');
  const [activeTab, setActiveTab] = useState<'components' | 'presets'>('components');
  const [customHex, setCustomHex] = useState('');
  const [showSecondaryColor, setShowSecondaryColor] = useState(false);

  if (!isOpen) return null;

  const currentConfig: LedComponentConfig = lighting[selectedCompId] || DEFAULT_LED_LIGHTING[selectedCompId];
  const compLabel = LED_COMPONENT_LABELS[selectedCompId];

  const handleUpdateCurrentComp = (partial: Partial<LedComponentConfig>) => {
    const updatedComp = { ...currentConfig, ...partial };
    const updatedLighting: ScoreboardLedLighting = {
      ...lighting,
      [selectedCompId]: updatedComp,
      activePreset: undefined, // Customizado
    };
    onUpdateLighting(updatedLighting);

    if (onSyncWithArduino) {
      onSyncWithArduino(selectedCompId, updatedComp);
    }
  };

  // Aplicar el efecto/color del componente seleccionado a TODOS los componentes
  const handleApplyToAll = () => {
    const updatedLighting: ScoreboardLedLighting = {
      ...lighting,
      scoreLocal: { ...currentConfig },
      scoreVisitor: { ...currentConfig },
      period: { ...currentConfig },
      timer: { ...currentConfig },
      possession: { ...currentConfig },
      banner: { ...currentConfig },
      clock: { ...currentConfig },
      border: { ...currentConfig },
      activePreset: undefined,
    };
    onUpdateLighting(updatedLighting);

    if (onSyncWithArduino) {
      COMPONENT_ORDER.forEach((cid) => {
        onSyncWithArduino(cid, currentConfig);
      });
    }
  };

  const handleResetToDefault = () => {
    onUpdateLighting({ ...DEFAULT_LED_LIGHTING });
    if (onSyncWithArduino) {
      COMPONENT_ORDER.forEach((cid) => {
        onSyncWithArduino(cid, DEFAULT_LED_LIGHTING[cid]);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-sans">
        
        {/* Header con gradiente LED */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-amber-400 via-pink-500 to-emerald-400 animate-pulse"></div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-pink-500/20 border border-amber-500/30 text-amber-400 shadow-sm">
              <Sparkles className="w-5 h-5 animate-spin-slow text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide flex items-center gap-2">
                ILUMINACIÓN LED DINÁMICA & EFECTOS WS2812B
              </h2>
              <p className="text-xs text-slate-400 font-mono-code">
                Personaliza colores, ondas, pulsos, fuego y gradientes para cada elemento de la pantalla
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de pestañas superiores */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-5 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('components')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'components'
                ? 'border-amber-400 text-amber-300 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            Ajuste por Elemento
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'presets'
                ? 'border-amber-400 text-amber-300 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-pink-400" />
            Presets Temáticos (1-Clic)
          </button>
        </div>

        {/* Contenido Principal con Scroll */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5 bg-slate-900/90">
          
          {activeTab === 'components' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Columna Izquierda: Selector de Componente */}
              <div className="lg:col-span-4 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-1">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Selecciona el Elemento
                </span>

                <div className="space-y-1.5">
                  {COMPONENT_ORDER.map((cid) => {
                    const cfg = lighting[cid] || DEFAULT_LED_LIGHTING[cid];
                    const label = LED_COMPONENT_LABELS[cid];
                    const isSelected = selectedCompId === cid;
                    const eff = LED_EFFECT_DESCRIPTIONS[cfg.effect];

                    return (
                      <button
                        key={cid}
                        onClick={() => setSelectedCompId(cid)}
                        className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between group ${
                          isSelected
                            ? 'bg-slate-800 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                            : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-black/60 shadow-sm shrink-0 transition-transform group-hover:scale-110"
                            style={{ 
                              backgroundColor: cfg.color,
                              boxShadow: `0 0 8px ${cfg.color}80` 
                            }}
                          ></span>
                          <div className="min-w-0">
                            <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                              {label.name}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono-code">
                              <span>{eff.icon}</span>
                              <span className="truncate">{eff.name}</span>
                            </div>
                          </div>
                        </div>

                        <ChevronRight className={`w-4 h-4 shrink-0 transition ${isSelected ? 'text-amber-400 translate-x-0.5' : 'text-slate-600'}`} />
                      </button>
                    );
                  })}
                </div>

                {/* Acciones Rápidas Globales */}
                <div className="pt-2 space-y-1.5">
                  <button
                    onClick={handleApplyToAll}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                    title="Copia el color y efecto del elemento actual a todos los demás"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    Copiar este estilo a TODOS
                  </button>
                  <button
                    onClick={handleResetToDefault}
                    className="w-full py-1.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    Restablecer de Fábrica
                  </button>
                </div>
              </div>

              {/* Columna Derecha: Configuración del Componente Seleccionado */}
              <div className="lg:col-span-8 space-y-5 bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800">
                
                {/* Cabecera del Componente */}
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span 
                      className="w-4 h-4 rounded-full border border-black/50 shadow"
                      style={{ 
                        backgroundColor: currentConfig.color,
                        boxShadow: `0 0 12px ${currentConfig.color}` 
                      }}
                    ></span>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-white">
                        {compLabel.name}
                      </h3>
                      <span className="text-[11px] text-amber-400/90 font-mono-code font-bold">
                        {compLabel.section}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono-code font-black text-amber-300">
                      {currentConfig.color.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 1: Selección de Efecto Dinámico */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Efecto de Iluminación LED
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono-code">
                      {LED_EFFECT_DESCRIPTIONS[currentConfig.effect].name}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(Object.keys(LED_EFFECT_DESCRIPTIONS) as LedColorEffect[]).map((effKey) => {
                      const eff = LED_EFFECT_DESCRIPTIONS[effKey];
                      const isSelected = currentConfig.effect === effKey;

                      return (
                        <button
                          key={effKey}
                          onClick={() => handleUpdateCurrentComp({ effect: effKey })}
                          className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between relative overflow-hidden group ${
                            isSelected
                              ? 'bg-gradient-to-br from-amber-500/20 to-slate-800 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                              : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                          )}
                          <div className="text-lg mb-1">{eff.icon}</div>
                          <div className={`text-[11px] font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {eff.name}
                          </div>
                          <div className="text-[9px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                            {eff.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECCIÓN 2: Paleta de Colores LED */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-cyan-400" />
                      Color Primario LED
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono-code">
                      {LED_COLOR_SWATCHES.find((s) => s.hex.toLowerCase() === currentConfig.color.toLowerCase())?.name || 'Personalizado'}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {LED_COLOR_SWATCHES.map((swatch) => {
                      const isSelected = currentConfig.color.toLowerCase() === swatch.hex.toLowerCase();

                      return (
                        <button
                          key={swatch.id}
                          onClick={() => handleUpdateCurrentComp({ color: swatch.hex })}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center transition gap-1.5 relative group ${
                            isSelected
                              ? 'bg-slate-900 border-white shadow-lg ring-2 ring-amber-400/50 scale-105 z-10'
                              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                          }`}
                          title={swatch.name}
                        >
                          <span 
                            className="w-5 h-5 rounded-full border border-black/40 shadow transition-transform group-hover:scale-110"
                            style={{ 
                              backgroundColor: swatch.hex,
                              boxShadow: isSelected ? `0 0 10px ${swatch.hex}` : undefined
                            }}
                          ></span>
                          <span className="text-[9px] text-slate-300 font-bold truncate max-w-full text-center">
                            {swatch.id.replace('_', ' ')}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selector HEX libre */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 flex items-center bg-slate-900 rounded-xl px-3 py-1.5 border border-slate-800">
                      <span className="text-xs font-mono-code text-slate-500 font-bold mr-1">HEX</span>
                      <input
                        type="color"
                        value={currentConfig.color}
                        onChange={(e) => handleUpdateCurrentComp({ color: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 mr-2"
                      />
                      <input
                        type="text"
                        placeholder="#00D2FF"
                        value={currentConfig.color}
                        onChange={(e) => handleUpdateCurrentComp({ color: e.target.value })}
                        className="bg-transparent text-xs font-mono-code font-bold text-white focus:outline-none flex-1 uppercase"
                      />
                    </div>

                    {(currentConfig.effect === 'dual_gradient' || showSecondaryColor) && (
                      <div className="flex-1 flex items-center bg-slate-900 rounded-xl px-3 py-1.5 border border-slate-800">
                        <span className="text-[10px] font-mono-code text-slate-400 font-bold mr-1">COLOR 2:</span>
                        <input
                          type="color"
                          value={currentConfig.secondaryColor || '#ffffff'}
                          onChange={(e) => handleUpdateCurrentComp({ secondaryColor: e.target.value })}
                          className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 mr-2"
                        />
                        <input
                          type="text"
                          value={currentConfig.secondaryColor || '#ffffff'}
                          onChange={(e) => handleUpdateCurrentComp({ secondaryColor: e.target.value })}
                          className="bg-transparent text-xs font-mono-code font-bold text-white focus:outline-none flex-1 uppercase"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* SECCIÓN 3: Velocidad y Brillo de Animación */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  {/* Slider de Velocidad */}
                  <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-amber-400" />
                        Velocidad de Efecto
                      </span>
                      <span className="font-mono-code text-amber-400 font-black">
                        Nivel {currentConfig.speed} / 5
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={currentConfig.speed}
                      onChange={(e) => handleUpdateCurrentComp({ speed: Number(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono-code font-bold">
                      <span>1 (Pausado)</span>
                      <span>3 (Normal)</span>
                      <span>5 (Dinámico)</span>
                    </div>
                  </div>

                  {/* Slider de Brillo Relativo del Componente */}
                  <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                        Intensidad Lumínica
                      </span>
                      <span className="font-mono-code text-amber-400 font-black">
                        {currentConfig.brightness ?? 100}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      step="10"
                      value={currentConfig.brightness ?? 100}
                      onChange={(e) => handleUpdateCurrentComp({ brightness: Number(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono-code font-bold">
                      <span>20% (Ahorro)</span>
                      <span>60% (Gimnasio)</span>
                      <span>100% (Estadio)</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* PESTAÑA: Presets Temáticos de 1 Clic */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Selecciona una combinación prediseñada para configurar todos los elementos instantáneamente:
                </span>
                <span className="text-[11px] text-amber-400 font-mono-code font-bold">
                  {LED_PRESETS.length} Estilos Disponibles
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {LED_PRESETS.map((preset) => {
                  const isCurrent = lighting.activePreset === preset.id;

                  return (
                    <div
                      key={preset.id}
                      onClick={() => onApplyPreset(preset.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                        isCurrent
                          ? 'bg-slate-800/90 border-amber-400 shadow-xl ring-2 ring-amber-400/40'
                          : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-2xl">{preset.icon}</span>
                            <div>
                              <h4 className={`text-sm font-black ${isCurrent ? 'text-amber-300' : 'text-white'}`}>
                                {preset.name}
                              </h4>
                              <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                                {preset.description}
                              </p>
                            </div>
                          </div>

                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black shrink-0">
                              ACTIVO
                            </span>
                          )}
                        </div>

                        {/* Muestra de Colores del Preset */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                          <span className="text-[10px] text-slate-500 font-mono-code font-bold">PALETA:</span>
                          <div className="flex items-center -space-x-1">
                            {[
                              preset.lighting.scoreLocal.color,
                              preset.lighting.period.color,
                              preset.lighting.timer.color,
                              preset.lighting.scoreVisitor.color,
                            ].map((col, idx) => (
                              <span
                                key={idx}
                                className="w-4 h-4 rounded-full border border-black/60 shadow"
                                style={{ backgroundColor: col }}
                              ></span>
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono-code ml-auto">
                            Efecto: {LED_EFFECT_DESCRIPTIONS[preset.lighting.scoreLocal.effect].name}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer del Modal */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Los cambios se aplican en vivo en la pantalla y se sincronizan vía serie/bluetooth con Arduino.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-lg flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Listo y Guardar
          </button>
        </div>

      </div>
    </div>
  );
};
