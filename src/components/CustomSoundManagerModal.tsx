import React, { useState, useRef, useEffect } from 'react';
import { 
  SportType, CustomSoundItem, SoundEventOverrides, SoundCategory, 
  SportSoundPad, SportSoundTemplate, SportSoundTemplates, BuiltinSoundKey 
} from '../types';
import { sounds } from '../utils/audio';
import { 
  readAudioFile, 
  VoiceRecorder, 
  exportSoundPack, 
  importSoundPack,
  getDefaultPresetSounds 
} from '../utils/customSoundManager';
import { 
  BUILTIN_SOUNDS_CATALOG, 
  DEFAULT_SPORT_TEMPLATES, 
  resetSportTemplate 
} from '../utils/sportSoundTemplates';
import { hardware } from '../utils/hardwareManager';
import { 
  X, Upload, Mic, Music, Volume2, Play, Square, 
  Trash2, Download, Plus, Check, Settings2, 
  Sliders, RefreshCw, FolderPlus, ArrowLeft, ArrowRight, Edit3, ShieldAlert
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialSport?: SportType;
  customSounds: CustomSoundItem[];
  onSaveCustomSounds: (sounds: CustomSoundItem[]) => void;
  sportTemplates: SportSoundTemplates;
  onSaveSportTemplates: (templates: SportSoundTemplates) => void;
  soundOverrides: SoundEventOverrides;
  onSaveSoundOverrides: (overrides: SoundEventOverrides) => void;
  soundEnabled?: boolean;
}

const SPORTS_LIST: { id: SportType; name: string; icon: string }[] = [
  { id: 'basketball', name: 'Básquetbol', icon: '🏀' },
  { id: 'soccer', name: 'Fútbol', icon: '⚽' },
  { id: 'futsal', name: 'Futsal', icon: '⚽' },
  { id: 'volleyball', name: 'Vóleibol', icon: '🏐' },
  { id: 'handball', name: 'Handball', icon: '🤾' },
  { id: 'custom', name: 'Entrenamiento / Gimnasio', icon: '⏱️' },
];

const COLOR_PRESETS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#64748b', // slate
];

const EMOJI_PRESETS = ['🚨', '🏀', '⚽', '🏐', '🤾', '⏱️', '📢', '👏', '🎺', '🔔', '⏸️', '💥', '🔥', '🏆', '🎵', '🎙️', '⚡', '🛡️', '🎉', '🏁', '👥', '🟥', '🟨', '🛑', '🔄'];

export const CustomSoundManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialSport = 'basketball',
  customSounds = [],
  onSaveCustomSounds,
  sportTemplates,
  onSaveSportTemplates,
  soundOverrides,
  onSaveSoundOverrides,
}) => {
  // Pestañas principales
  const [activeTab, setActiveTab] = useState<'sports' | 'custom_library' | 'upload' | 'record' | 'overrides' | 'pack'>('sports');
  
  // Deporte seleccionado para configurar plantilla
  const [selectedSport, setSelectedSport] = useState<SportType>(initialSport);

  // Sincronizar deporte inicial al abrir
  useEffect(() => {
    if (initialSport) {
      setSelectedSport(initialSport);
    }
  }, [initialSport, isOpen]);

  // Estado de reproducción activa
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Modal / Formulario para añadir o editar un Pad en el deporte seleccionado
  const [isPadEditorOpen, setIsPadEditorOpen] = useState(false);
  const [editingPadId, setEditingPadId] = useState<string | null>(null);
  const [padFormName, setPadFormName] = useState('');
  const [padFormType, setPadFormType] = useState<'builtin' | 'custom'>('builtin');
  const [padFormBuiltinKey, setPadFormBuiltinKey] = useState<BuiltinSoundKey>('playHorn');
  const [padFormCustomId, setPadFormCustomId] = useState<string>('');
  const [padFormIcon, setPadFormIcon] = useState('🚨');
  const [padFormColor, setPadFormColor] = useState('#ef4444');
  const [padFormArduinoCmd, setPadFormArduinoCmd] = useState('');

  // Subida de Archivos
  const [uploadFiles, setUploadFiles] = useState<CustomSoundItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Grabador de Micrófono
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedResult, setRecordedResult] = useState<{ audioData: string; duration: number } | null>(null);
  const [recordedName, setRecordedName] = useState('');
  const [recordedCategory, setRecordedCategory] = useState<SoundCategory>('announcement');
  const [recordedIcon, setRecordedIcon] = useState('🎙️');
  const [recordedColor, setRecordedColor] = useState('#ec4899');
  const [addRecordToSport, setAddRecordToSport] = useState<boolean>(true);
  const recorderRef = useRef<VoiceRecorder | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Limpiar reproducciones al desmontar o cerrar
  useEffect(() => {
    return () => {
      sounds.stopAllSounds();
    };
  }, []);

  if (!isOpen) return null;

  const currentTemplate: SportSoundTemplate = sportTemplates[selectedSport] || DEFAULT_SPORT_TEMPLATES[selectedSport];

  // Helper para reproducir cualquier pad (sea sintetizado o custom)
  const handlePlayPad = (pad: SportSoundPad) => {
    if (playingId === pad.id) {
      sounds.stopAllSounds();
      setPlayingId(null);
      return;
    }

    sounds.stopAllSounds();
    setPlayingId(pad.id);

    if (pad.soundType === 'builtin' && pad.builtinKey) {
      const item = BUILTIN_SOUNDS_CATALOG.find((b) => b.key === pad.builtinKey);
      if (item) {
        item.play(sounds);
      } else {
        sounds.playHorn(1200);
      }
      setTimeout(() => setPlayingId(null), 1500);
    } else if (pad.soundType === 'custom' && pad.customSoundId) {
      const custom = customSounds.find((c) => c.id === pad.customSoundId);
      if (custom) {
        sounds.playCustomSound(
          custom.id,
          custom.audioData,
          pad.volume ?? custom.volume ?? 1.0,
          false,
          () => setPlayingId(null)
        );
      } else {
        sounds.playHorn(800);
        setPlayingId(null);
      }
    }

    if (pad.arduinoCmd) {
      hardware.sendCommand(pad.arduinoCmd);
    }
  };

  // Reproducir un sonido de la librería de usuario
  const handleTogglePlayCustom = (sound: CustomSoundItem) => {
    if (playingId === sound.id) {
      sounds.stopCustomSound(sound.id);
      setPlayingId(null);
    } else {
      sounds.stopAllSounds();
      setPlayingId(sound.id);
      sounds.playCustomSound(
        sound.id,
        sound.audioData,
        sound.volume || 1.0,
        sound.loop || false,
        () => setPlayingId(null)
      );
      if (sound.arduinoCmd) {
        hardware.sendCommand(sound.arduinoCmd);
      }
    }
  };

  // Abrir editor para un pad nuevo
  const handleOpenNewPad = () => {
    setEditingPadId(null);
    setPadFormName('Bocina / Efecto');
    setPadFormType('builtin');
    setPadFormBuiltinKey('playHorn');
    setPadFormCustomId(customSounds.length > 0 ? customSounds[0].id : '');
    setPadFormIcon('🚨');
    setPadFormColor('#ef4444');
    setPadFormArduinoCmd('CMD:HORN');
    setIsPadEditorOpen(true);
  };

  // Abrir editor para modificar un pad existente
  const handleOpenEditPad = (pad: SportSoundPad) => {
    setEditingPadId(pad.id);
    setPadFormName(pad.name);
    setPadFormType(pad.soundType);
    setPadFormBuiltinKey(pad.builtinKey || 'playHorn');
    setPadFormCustomId(pad.customSoundId || (customSounds.length > 0 ? customSounds[0].id : ''));
    setPadFormIcon(pad.icon || '🎵');
    setPadFormColor(pad.color || '#3b82f6');
    setPadFormArduinoCmd(pad.arduinoCmd || '');
    setIsPadEditorOpen(true);
  };

  // Guardar Pad (nuevo o editado) en el deporte actual
  const handleSavePad = () => {
    if (!padFormName.trim()) return;

    const updatedPads = [...currentTemplate.pads];

    if (editingPadId) {
      // Modificar existente
      const idx = updatedPads.findIndex((p) => p.id === editingPadId);
      if (idx !== -1) {
        updatedPads[idx] = {
          ...updatedPads[idx],
          name: padFormName.trim(),
          soundType: padFormType,
          builtinKey: padFormType === 'builtin' ? padFormBuiltinKey : undefined,
          customSoundId: padFormType === 'custom' ? padFormCustomId : undefined,
          icon: padFormIcon,
          color: padFormColor,
          arduinoCmd: padFormArduinoCmd.trim() || undefined,
        };
      }
    } else {
      // Crear nuevo pad
      const newPad: SportSoundPad = {
        id: `pad-${selectedSport}-${Date.now()}`,
        name: padFormName.trim(),
        soundType: padFormType,
        builtinKey: padFormType === 'builtin' ? padFormBuiltinKey : undefined,
        customSoundId: padFormType === 'custom' ? padFormCustomId : undefined,
        icon: padFormIcon,
        color: padFormColor,
        arduinoCmd: padFormArduinoCmd.trim() || undefined,
      };
      updatedPads.push(newPad);
    }

    const updatedTemplate: SportSoundTemplate = {
      ...currentTemplate,
      pads: updatedPads,
    };

    const updatedAll = {
      ...sportTemplates,
      [selectedSport]: updatedTemplate,
    };

    onSaveSportTemplates(updatedAll);
    setIsPadEditorOpen(false);
  };

  // Eliminar Pad del deporte
  const handleDeletePad = (padId: string) => {
    const updatedPads = currentTemplate.pads.filter((p) => p.id !== padId);
    const updatedTemplate: SportSoundTemplate = {
      ...currentTemplate,
      pads: updatedPads,
    };
    onSaveSportTemplates({
      ...sportTemplates,
      [selectedSport]: updatedTemplate,
    });
  };

  // Reordenar Pad (Mover a la izquierda / derecha)
  const handleMovePad = (idx: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentTemplate.pads.length) return;

    const newPads = [...currentTemplate.pads];
    const temp = newPads[idx];
    newPads[idx] = newPads[targetIdx];
    newPads[targetIdx] = temp;

    onSaveSportTemplates({
      ...sportTemplates,
      [selectedSport]: {
        ...currentTemplate,
        pads: newPads,
      },
    });
  };

  // Restablecer deporte a valores de fábrica
  const handleResetSport = () => {
    if (confirm(`¿Restablecer todos los sonidos y pads de ${SPORTS_LIST.find((s) => s.id === selectedSport)?.name} a los valores predeterminados?`)) {
      const resetOne = resetSportTemplate(selectedSport);
      onSaveSportTemplates({
        ...sportTemplates,
        [selectedSport]: resetOne,
      });
    }
  };

  // Actualizar override específico para el deporte
  const handleUpdateSportOverride = (eventKey: keyof SoundEventOverrides, value: string) => {
    const updatedOverrides = {
      ...(currentTemplate.overrides || {}),
      [eventKey]: value,
    };
    onSaveSportTemplates({
      ...sportTemplates,
      [selectedSport]: {
        ...currentTemplate,
        overrides: updatedOverrides,
      },
    });
  };

  // Grabación de Micrófono
  const handleStartRecording = async () => {
    try {
      recorderRef.current = new VoiceRecorder();
      await recorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      setRecordedResult(null);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (e) {
      console.error('Error al acceder al micrófono:', e);
      alert('No se pudo acceder al micrófono. Verifica los permisos de tu navegador.');
    }
  };

  const handleStopRecording = async () => {
    if (!recorderRef.current) return;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    try {
      const result = await recorderRef.current.stop();
      setIsRecording(false);
      setRecordedResult(result);
      if (!recordedName) {
        setRecordedName(`Voz Estadio ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      }
    } catch (e) {
      console.error('Error al detener grabación:', e);
      setIsRecording(false);
    }
  };

  const handleSaveRecordedSound = () => {
    if (!recordedResult || !recordedName.trim()) return;

    const newCustomSound: CustomSoundItem = {
      id: `rec-${Date.now()}`,
      name: recordedName.trim(),
      category: recordedCategory,
      audioData: recordedResult.audioData,
      duration: recordedResult.duration,
      icon: recordedIcon,
      color: recordedColor,
      volume: 1.0,
      createdAt: Date.now(),
      arduinoCmd: `CMD:SND:VOICE:${recordedName.substring(0, 8).toUpperCase()}`,
    };

    const updatedCustoms = [...customSounds, newCustomSound];
    onSaveCustomSounds(updatedCustoms);

    // Si el usuario quiere agregarlo directo al deporte actual
    if (addRecordToSport) {
      const newPad: SportSoundPad = {
        id: `pad-${selectedSport}-${Date.now()}`,
        name: newCustomSound.name,
        soundType: 'custom',
        customSoundId: newCustomSound.id,
        icon: newCustomSound.icon,
        color: newCustomSound.color,
        arduinoCmd: newCustomSound.arduinoCmd,
      };

      const updatedTemplate = {
        ...currentTemplate,
        pads: [...currentTemplate.pads, newPad],
      };

      onSaveSportTemplates({
        ...sportTemplates,
        [selectedSport]: updatedTemplate,
      });
    }

    setRecordedResult(null);
    setRecordedName('');
    setActiveTab('sports');
  };

  // Subida de archivos
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessingFiles(true);

    try {
      const newItems: CustomSoundItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac|aac|webm)$/i.test(file.name)) {
          const item = await readAudioFile(file);
          newItems.push(item);
        }
      }

      if (newItems.length > 0) {
        setUploadFiles((prev) => [...prev, ...newItems]);
      }
    } catch (e) {
      console.error('Error al procesar archivos de audio:', e);
    } finally {
      setIsProcessingFiles(false);
    }
  };

  const handleSaveUploadedFiles = () => {
    if (uploadFiles.length === 0) return;

    const updatedCustom = [...customSounds, ...uploadFiles];
    onSaveCustomSounds(updatedCustom);

    // Auto agregar a los pads del deporte actual
    const newPads: SportSoundPad[] = uploadFiles.map((up) => ({
      id: `pad-${selectedSport}-${up.id}`,
      name: up.name,
      soundType: 'custom',
      customSoundId: up.id,
      icon: up.icon || '🎵',
      color: up.color || '#ec4899',
      arduinoCmd: up.arduinoCmd,
    }));

    const updatedTemplate = {
      ...currentTemplate,
      pads: [...currentTemplate.pads, ...newPads],
    };

    onSaveSportTemplates({
      ...sportTemplates,
      [selectedSport]: updatedTemplate,
    });

    setUploadFiles([]);
    setActiveTab('sports');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shadow-inner">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-stadium font-bold text-base sm:text-lg text-white tracking-wide flex items-center gap-2">
                ADMINISTRADOR DE SONIDOS Y PLANTILLAS
                <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/30 uppercase">
                  Multideporte
                </span>
              </h3>
              <p className="text-slate-400 text-xs">
                Configura la botonera de sonidos de cada deporte, sube audios MP3 y graba anuncios de voz.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Cerrar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BARRA DE PESTAÑAS PRINCIPALES */}
        <div className="bg-slate-950/60 px-3 sm:px-6 py-2 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs font-stadium font-bold">
          <button
            onClick={() => setActiveTab('sports')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'sports'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings2 className="w-4 h-4 text-pink-200" />
            <span>1. PLANTILLAS POR DEPORTE</span>
          </button>

          <button
            onClick={() => setActiveTab('custom_library')}
            className={`px-3 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'custom_library'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Music className="w-4 h-4 text-purple-300" />
            <span>2. MIS AUDIOS ({customSounds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4 text-blue-300" />
            <span>3. SUBIR MP3/WAV</span>
          </button>

          <button
            onClick={() => setActiveTab('record')}
            className={`px-3 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'record'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4 text-rose-300" />
            <span>4. GRABAR VOZ</span>
          </button>

          <button
            onClick={() => setActiveTab('pack')}
            className={`px-3 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'pack'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FolderPlus className="w-4 h-4 text-emerald-300" />
            <span>5. PACKS & COPIAS</span>
          </button>
        </div>

        {/* CONTENIDO DE LA PESTAÑA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ========================================================== */}
          {/* 1. CONFIGURACIÓN DE PLANTILLAS POR DEPORTE */}
          {/* ========================================================== */}
          {activeTab === 'sports' && (
            <div className="space-y-6">
              
              {/* SELECTOR DE DEPORTE */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-stadium font-bold text-slate-300 flex items-center gap-2">
                    <span>🏆 SELECCIONA EL DEPORTE A CONFIGURAR:</span>
                  </label>

                  <button
                    onClick={handleResetSport}
                    className="text-[11px] font-stadium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-500/30 flex items-center gap-1 transition"
                    title="Restablecer este deporte a los sonidos de fábrica"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Restablecer {SPORTS_LIST.find((s) => s.id === selectedSport)?.name} a fábrica</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {SPORTS_LIST.map((sp) => {
                    const isSelected = selectedSport === sp.id;
                    const padCount = sportTemplates[sp.id]?.pads?.length || 0;
                    return (
                      <button
                        key={sp.id}
                        onClick={() => setSelectedSport(sp.id)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition text-xs font-stadium font-bold ${
                          isSelected
                            ? 'bg-pink-600/30 border-pink-500 text-white shadow-lg ring-1 ring-pink-400'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-xl">{sp.icon}</span>
                        <span>{sp.name}</span>
                        <span className="text-[10px] text-pink-300 font-mono-code font-normal">
                          {padCount} pads
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BARRA DE HERRAMIENTAS DEL DEPORTE SELECCIONADO */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <h4 className="font-stadium font-bold text-white text-sm flex items-center gap-2">
                    <span>{SPORTS_LIST.find((s) => s.id === selectedSport)?.icon}</span>
                    <span>Botonera de Sonidos para {SPORTS_LIST.find((s) => s.id === selectedSport)?.name}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentTemplate.description}
                  </p>
                </div>

                <button
                  onClick={handleOpenNewPad}
                  className="bg-pink-600 hover:bg-pink-500 text-white font-stadium font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-pink-600/20 active:scale-95 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ AÑADIR BOTÓN DE SONIDO</span>
                </button>
              </div>

              {/* GRILLA DE PADS DEL DEPORTE */}
              {currentTemplate.pads.length === 0 ? (
                <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 p-6 space-y-3">
                  <p className="text-slate-400 text-sm">No hay botones de sonido configurados para este deporte.</p>
                  <button
                    onClick={handleOpenNewPad}
                    className="bg-pink-600 text-white font-stadium font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    + Añadir el primer botón
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {currentTemplate.pads.map((pad, idx) => {
                    const isPlaying = playingId === pad.id;
                    const customItem = pad.soundType === 'custom' && pad.customSoundId
                      ? customSounds.find((c) => c.id === pad.customSoundId)
                      : null;

                    return (
                      <div
                        key={pad.id}
                        className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2.5 flex flex-col justify-between hover:border-slate-700 transition relative group shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span 
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-base shadow-sm font-bold"
                              style={{ backgroundColor: pad.color || '#3b82f6' }}
                            >
                              {pad.icon || '🎵'}
                            </span>
                            <div>
                              <h5 className="font-stadium font-bold text-xs text-white leading-tight">
                                {pad.name}
                              </h5>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono-code mt-0.5">
                                {pad.soundType === 'builtin' ? (
                                  <span className="text-cyan-400">Sintetizado</span>
                                ) : (
                                  <span className="text-pink-400">
                                    Audio Propio {customItem ? `(${customItem.duration || '0'}s)` : ''}
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Botón de Test Play */}
                          <button
                            onClick={() => handlePlayPad(pad)}
                            className={`p-2 rounded-xl transition ${
                              isPlaying
                                ? 'bg-rose-600 text-white animate-pulse'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            }`}
                            title={isPlaying ? 'Detener' : 'Probar sonido'}
                          >
                            {isPlaying ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-slate-200" />}
                          </button>
                        </div>

                        {pad.arduinoCmd && (
                          <div className="text-[10px] text-slate-500 font-mono-code bg-slate-900 px-2 py-0.5 rounded border border-slate-800/80 truncate">
                            Arduino: <code>{pad.arduinoCmd}</code>
                          </div>
                        )}

                        {/* Botones de acción del Pad: Reordenar, Editar, Eliminar */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-slate-400 text-xs">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleMovePad(idx, 'left')}
                              disabled={idx === 0}
                              className="p-1 hover:text-white disabled:opacity-25 transition"
                              title="Mover a la izquierda"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMovePad(idx, 'right')}
                              disabled={idx === currentTemplate.pads.length - 1}
                              className="p-1 hover:text-white disabled:opacity-25 transition"
                              title="Mover a la derecha"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleOpenEditPad(pad)}
                              className="p-1 hover:text-cyan-400 transition"
                              title="Modificar nombre, icono o sonido"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePad(pad.id)}
                              className="p-1 hover:text-rose-400 transition"
                              title="Eliminar botón"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SECCIÓN DE OVERRIDES / EVENTOS AUTOMÁTICOS DEL DEPORTE */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <h4 className="font-stadium font-bold text-white text-sm">
                      EVENTOS AUTOMÁTICOS DE {SPORTS_LIST.find((s) => s.id === selectedSport)?.name.toUpperCase()}
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">Sonido que se disparará al ocurrir cada evento</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  
                  {/* Fin de Periodo / Cuarto */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col justify-between gap-1.5">
                    <span className="text-slate-300 font-bold">🏁 Fin de Periodo / Cuarto / Tiempo:</span>
                    <select
                      value={currentTemplate.overrides?.onPeriodEndHorn || 'default'}
                      onChange={(e) => handleUpdateSportOverride('onPeriodEndHorn', e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-white rounded-lg p-1.5 focus:border-pink-500"
                    >
                      <option value="default">Predeterminado del deporte</option>
                      <optgroup label="Sonidos Integrados">
                        {BUILTIN_SOUNDS_CATALOG.map((b) => (
                          <option key={b.key} value={b.key}>{b.defaultIcon} {b.name}</option>
                        ))}
                      </optgroup>
                      {customSounds.length > 0 && (
                        <optgroup label="Mis Audios Propios">
                          {customSounds.map((c) => (
                            <option key={c.id} value={c.id}>{c.icon || '🎵'} {c.name}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  {/* Puntos / Gol Local */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col justify-between gap-1.5">
                    <span className="text-slate-300 font-bold">⚽🏀 Anotación / Gol Local:</span>
                    <select
                      value={currentTemplate.overrides?.onScoreLocal || 'default'}
                      onChange={(e) => handleUpdateSportOverride('onScoreLocal', e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-white rounded-lg p-1.5 focus:border-pink-500"
                    >
                      <option value="default">Predeterminado del deporte</option>
                      <optgroup label="Sonidos Integrados">
                        {BUILTIN_SOUNDS_CATALOG.map((b) => (
                          <option key={b.key} value={b.key}>{b.defaultIcon} {b.name}</option>
                        ))}
                      </optgroup>
                      {customSounds.length > 0 && (
                        <optgroup label="Mis Audios Propios">
                          {customSounds.map((c) => (
                            <option key={c.id} value={c.id}>{c.icon || '🎵'} {c.name}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  {/* Tiempo Muerto */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col justify-between gap-1.5">
                    <span className="text-slate-300 font-bold">⏸️ Solicitud de Tiempo Muerto (Time-Out):</span>
                    <select
                      value={currentTemplate.overrides?.onTimeout || 'default'}
                      onChange={(e) => handleUpdateSportOverride('onTimeout', e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-white rounded-lg p-1.5 focus:border-pink-500"
                    >
                      <option value="default">Predeterminado (Bocina Time-out)</option>
                      <optgroup label="Sonidos Integrados">
                        {BUILTIN_SOUNDS_CATALOG.map((b) => (
                          <option key={b.key} value={b.key}>{b.defaultIcon} {b.name}</option>
                        ))}
                      </optgroup>
                      {customSounds.length > 0 && (
                        <optgroup label="Mis Audios Propios">
                          {customSounds.map((c) => (
                            <option key={c.id} value={c.id}>{c.icon || '🎵'} {c.name}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  {/* Tarjetas / Faltas */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col justify-between gap-1.5">
                    <span className="text-slate-300 font-bold">🟥 Sanciones / Tarjetas / Faltas:</span>
                    <select
                      value={currentTemplate.overrides?.onCard || 'default'}
                      onChange={(e) => handleUpdateSportOverride('onCard', e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-white rounded-lg p-1.5 focus:border-pink-500"
                    >
                      <option value="default">Predeterminado (Alarma Sanción)</option>
                      <optgroup label="Sonidos Integrados">
                        {BUILTIN_SOUNDS_CATALOG.map((b) => (
                          <option key={b.key} value={b.key}>{b.defaultIcon} {b.name}</option>
                        ))}
                      </optgroup>
                      {customSounds.length > 0 && (
                        <optgroup label="Mis Audios Propios">
                          {customSounds.map((c) => (
                            <option key={c.id} value={c.id}>{c.icon || '🎵'} {c.name}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* ========================================================== */}
          {/* 2. LIBRERÍA DE AUDIOS PROPIOS (MIS AUDIOS) */}
          {/* ========================================================== */}
          {activeTab === 'custom_library' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h4 className="font-stadium font-bold text-white text-sm">ARCHIVOS DE AUDIO Y VOCES GRABADAS ({customSounds.length})</h4>
                  <p className="text-xs text-slate-400">Audios guardados en la memoria local de tu navegador.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-stadium font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir MP3</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('record')}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-stadium font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Grabar Mic</span>
                  </button>
                </div>
              </div>

              {customSounds.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 p-6 space-y-3">
                  <p className="text-slate-400 text-sm">No has subido audios todavía.</p>
                  <p className="text-slate-500 text-xs">Sube tus canciones de aliento, grabaciones de locución o efectos en MP3/WAV.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {customSounds.map((item) => {
                    const isPlaying = playingId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2.5 flex flex-col justify-between shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2.5">
                            <span 
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow font-bold text-white"
                              style={{ backgroundColor: item.color || '#ec4899' }}
                            >
                              {item.icon || '🎵'}
                            </span>
                            <div>
                              <h5 className="font-stadium font-bold text-xs text-white leading-tight">{item.name}</h5>
                              <span className="text-[10px] text-slate-400 font-mono-code block mt-0.5">
                                {item.duration ? `${item.duration}s` : 'Audio'} • {item.category}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleTogglePlayCustom(item)}
                            className={`p-2 rounded-xl transition ${
                              isPlaying
                                ? 'bg-rose-600 text-white animate-pulse'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            }`}
                          >
                            {isPlaying ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-slate-200" />}
                          </button>
                        </div>

                        {/* Botón para insertar este audio en el deporte actual */}
                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              const newPad: SportSoundPad = {
                                id: `pad-${selectedSport}-${Date.now()}`,
                                name: item.name,
                                soundType: 'custom',
                                customSoundId: item.id,
                                icon: item.icon || '🎵',
                                color: item.color || '#ec4899',
                                arduinoCmd: item.arduinoCmd,
                              };
                              onSaveSportTemplates({
                                ...sportTemplates,
                                [selectedSport]: {
                                  ...currentTemplate,
                                  pads: [...currentTemplate.pads, newPad],
                                }
                              });
                              setActiveTab('sports');
                            }}
                            className="text-[11px] font-stadium text-pink-400 hover:text-pink-300 hover:bg-pink-950/40 px-2 py-1 rounded-lg border border-pink-500/30 flex items-center gap-1 transition"
                            title={`Agregar este audio a la botonera de ${SPORTS_LIST.find((s) => s.id === selectedSport)?.name}`}
                          >
                            <Plus className="w-3 h-3" />
                            <span>Añadir a {SPORTS_LIST.find((s) => s.id === selectedSport)?.name}</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar el audio "${item.name}" de la librería?`)) {
                                sounds.removeCustomSoundCache(item.id);
                                onSaveCustomSounds(customSounds.filter((c) => c.id !== item.id));
                              }
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400 transition"
                            title="Eliminar de la librería"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* 3. SUBIR MP3 / WAV */}
          {/* ========================================================== */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFilesSelected(e.dataTransfer.files);
                }}
                className={`border-2 border-dashed rounded-3xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                  isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-950'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shadow-lg">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-stadium font-bold text-white text-base">
                    Haz clic o arrastra tus audios aquí (MP3, WAV, OGG, M4A)
                  </h4>
                  <p className="text-slate-400 text-xs mt-1">
                    Puedes subir varios archivos a la vez para cargarlos en el marcador.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac"
                  className="hidden"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                />
              </div>

              {/* Lista de archivos listos para guardar */}
              {uploadFiles.length > 0 && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-stadium font-bold text-white text-xs">
                      ARCHIVOS LISTOS PARA IMPORTAR ({uploadFiles.length})
                    </h5>
                    <button
                      onClick={handleSaveUploadedFiles}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-stadium font-bold text-xs px-4 py-1.5 rounded-xl shadow"
                    >
                      GUARDAR Y AÑADIR A {SPORTS_LIST.find((s) => s.id === selectedSport)?.name.toUpperCase()}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {uploadFiles.map((f, idx) => (
                      <div key={idx} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <span className="font-stadium text-slate-200 truncate">{f.name}</span>
                        <span className="text-slate-500 font-mono-code">{f.duration}s</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* 4. GRABAR CON MICRÓFONO */}
          {/* ========================================================== */}
          {activeTab === 'record' && (
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6 max-w-xl mx-auto text-center">
              <div className="space-y-1">
                <h4 className="font-stadium font-bold text-white text-base flex items-center justify-center gap-2">
                  <Mic className="w-5 h-5 text-rose-400" />
                  GRABADOR DE LOCUCIÓN Y AVISOS DE ESTADIO
                </h4>
                <p className="text-slate-400 text-xs">
                  Graba tu propia voz (ej. "¡Tiempo muerto de River!", "¡Gol de Boca!", "¡Falta técnica!")
                </p>
              </div>

              {/* Botón de Grabar */}
              <div className="py-4 flex flex-col items-center justify-center space-y-3">
                <button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition shadow-2xl ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-500/30'
                      : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/50'
                  }`}
                >
                  {isRecording ? <Square className="w-8 h-8 fill-white" /> : <Mic className="w-8 h-8" />}
                </button>

                <div className="font-mono-code font-bold text-lg text-white">
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </div>
                <span className="text-xs text-slate-400">
                  {isRecording ? '🔴 Grabando en vivo... Presiona para finalizar' : 'Presiona el micrófono para iniciar grabación'}
                </span>
              </div>

              {/* Resultado grabado */}
              {recordedResult && (
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3 text-left animate-fade-in">
                  <h5 className="font-stadium font-bold text-xs text-white">CONFIGURAR AUDIO GRABADO</h5>
                  
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Nombre del Audio / Anuncio:</label>
                      <input
                        type="text"
                        value={recordedName}
                        onChange={(e) => setRecordedName(e.target.value)}
                        placeholder="Ej: Anuncio Tiempo Muerto"
                        className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl focus:border-rose-500"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="addToSport"
                        checked={addRecordToSport}
                        onChange={(e) => setAddRecordToSport(e.target.checked)}
                        className="rounded bg-slate-950 border-slate-700 text-rose-600 focus:ring-rose-500"
                      />
                      <label htmlFor="addToSport" className="text-slate-300 text-xs">
                        Añadir directamente a la botonera de <b>{SPORTS_LIST.find((s) => s.id === selectedSport)?.name}</b>
                      </label>
                    </div>

                    <button
                      onClick={handleSaveRecordedSound}
                      className="w-full mt-3 bg-rose-600 hover:bg-rose-500 text-white font-stadium font-bold py-2.5 rounded-xl shadow"
                    >
                      GUARDAR GRABACIÓN
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* 5. PACKS Y COPIAS */}
          {/* ========================================================== */}
          {activeTab === 'pack' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Exportar */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Download className="w-5 h-5 text-purple-400" />
                      <h4 className="font-stadium font-bold text-white text-sm">EXPORTAR PACK Y PLANTILLAS</h4>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">
                      Descarga una copia completa en archivo <code>.json</code> con todas las plantillas y sonidos propios para transferir a otra PC.
                    </p>
                  </div>

                  <button
                    onClick={() => exportSoundPack(customSounds)}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-stadium font-bold text-xs rounded-xl shadow"
                  >
                    DESCARGAR RESPALDO (.JSON)
                  </button>
                </div>

                {/* Importar */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <FolderPlus className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-stadium font-bold text-white text-sm">IMPORTAR PACK</h4>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">
                      Carga un archivo <code>.json</code> exportado previamente en otro marcador deportivo.
                    </p>
                  </div>

                  <label className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-stadium font-bold text-xs rounded-xl shadow text-center cursor-pointer block">
                    <span>SELECCIONAR ARCHIVO JSON</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const imported = await importSoundPack(file);
                            onSaveCustomSounds([...customSounds, ...imported]);
                            setActiveTab('custom_library');
                          } catch (err) {
                            console.error('Error al importar pack:', err);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Muestras predeterminadas */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-stadium font-bold text-white text-sm">LIBRERÍA DE SONIDOS PREESTABLECIDOS</h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Recarga los efectos sintetizados de muestra (Bocina de aire, Sirena, Fox 40, Ovación, Campana de Ring).
                  </p>
                </div>

                <button
                  onClick={() => {
                    const presets = getDefaultPresetSounds();
                    onSaveCustomSounds([...customSounds, ...presets]);
                    setActiveTab('custom_library');
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-stadium font-bold px-4 py-2 rounded-xl border border-slate-700"
                >
                  CARGAR MUESTRAS
                </button>
              </div>
            </div>
          )}

        </div>

        {/* MODAL SECUNDARIO: AÑADIR O EDITAR UN PAD EN EL DEPORTE */}
        {isPadEditorOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-stadium font-bold text-white text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-pink-400" />
                  <span>{editingPadId ? 'MODIFICAR BOTÓN DE SONIDO' : 'NUEVO BOTÓN DE SONIDO'}</span>
                  <span className="text-pink-400">({SPORTS_LIST.find((s) => s.id === selectedSport)?.name})</span>
                </h4>
                <button
                  onClick={() => setIsPadEditorOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Nombre del Botón */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Nombre / Título del Botón:</label>
                  <input
                    type="text"
                    value={padFormName}
                    onChange={(e) => setPadFormName(e.target.value)}
                    placeholder="Ej: Bocina NBA, ¡GOL!, Triple"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl focus:border-pink-500 text-xs"
                  />
                </div>

                {/* Tipo de Sonido */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Origen del Audio:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPadFormType('builtin')}
                      className={`p-2 rounded-xl border font-stadium font-bold transition ${
                        padFormType === 'builtin'
                          ? 'bg-cyan-600/30 border-cyan-500 text-cyan-200 ring-1 ring-cyan-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Sintetizado / Catálogo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPadFormType('custom')}
                      className={`p-2 rounded-xl border font-stadium font-bold transition ${
                        padFormType === 'custom'
                          ? 'bg-pink-600/30 border-pink-500 text-pink-200 ring-1 ring-pink-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Audio Propio / Grabación
                    </button>
                  </div>
                </div>

                {/* Selector de Audio */}
                {padFormType === 'builtin' ? (
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Seleccionar Sonido del Catálogo:</label>
                    <select
                      value={padFormBuiltinKey}
                      onChange={(e) => {
                        const key = e.target.value as BuiltinSoundKey;
                        setPadFormBuiltinKey(key);
                        const item = BUILTIN_SOUNDS_CATALOG.find((b) => b.key === key);
                        if (item) {
                          setPadFormIcon(item.defaultIcon);
                          setPadFormColor(item.defaultColor);
                          setPadFormArduinoCmd(item.defaultArduinoCmd);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 focus:border-pink-500"
                    >
                      {BUILTIN_SOUNDS_CATALOG.map((b) => (
                        <option key={b.key} value={b.key}>
                          {b.defaultIcon} {b.name} ({b.description})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Seleccionar de Mis Audios:</label>
                    {customSounds.length === 0 ? (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-400 text-center">
                        No tienes audios propios aún. Puedes subir un MP3 o grabar voz en las pestañas superiores.
                      </div>
                    ) : (
                      <select
                        value={padFormCustomId}
                        onChange={(e) => setPadFormCustomId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 focus:border-pink-500"
                      >
                        {customSounds.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.icon || '🎵'} {c.name} ({c.duration || '0'}s)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Icono y Color */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Icono / Emoji:</label>
                    <div className="flex flex-wrap gap-1 bg-slate-950 p-2 rounded-xl border border-slate-800 max-h-24 overflow-y-auto">
                      {EMOJI_PRESETS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setPadFormIcon(emoji)}
                          className={`w-7 h-7 rounded-lg text-base flex items-center justify-center ${
                            padFormIcon === emoji ? 'bg-pink-600 scale-110 shadow' : 'hover:bg-slate-800'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Color del Botón:</label>
                    <div className="flex flex-wrap gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800 max-h-24 overflow-y-auto">
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setPadFormColor(color)}
                          className={`w-7 h-7 rounded-lg transition ${
                            padFormColor === color ? 'ring-2 ring-white scale-110 shadow' : 'opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comando Arduino */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Comando Serie Arduino (Opcional):</label>
                  <input
                    type="text"
                    value={padFormArduinoCmd}
                    onChange={(e) => setPadFormArduinoCmd(e.target.value)}
                    placeholder="Ej: CMD:HORN, CMD:SND:GOAL"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl focus:border-pink-500 font-mono-code text-xs"
                  />
                </div>
              </div>

              {/* Botones de guardar */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPadEditorOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-stadium font-bold rounded-xl text-xs"
                >
                  CANCELAR
                </button>
                <button
                  type="button"
                  onClick={handleSavePad}
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white font-stadium font-bold rounded-xl text-xs shadow-lg"
                >
                  GUARDAR EN {SPORTS_LIST.find((s) => s.id === selectedSport)?.name.toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 font-mono-code">
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Pads de {SPORTS_LIST.find((s) => s.id === selectedSport)?.name}: <b>{currentTemplate.pads.length}</b>
            </span>
          </div>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-stadium font-bold px-5 py-1.5 rounded-xl transition"
          >
            GUARDAR Y CERRAR
          </button>
        </div>

      </div>
    </div>
  );
};
