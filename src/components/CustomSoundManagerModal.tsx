import React, { useState, useRef, useEffect } from 'react';
import { CustomSoundItem, SoundEventOverrides, SoundCategory } from '../types';
import { sounds } from '../utils/audio';
import { 
  readAudioFile, 
  VoiceRecorder, 
  exportSoundPack, 
  importSoundPack,
  getDefaultPresetSounds 
} from '../utils/customSoundManager';
import { hardware } from '../utils/hardwareManager';
import { 
  X, Upload, Mic, Music, Volume2, VolumeX, Play, Square, RotateCcw, 
  Trash2, Download, Plus, Check, Settings2, Sparkles, AlertCircle, 
  HelpCircle, Sliders, Radio, Zap, RefreshCw, FolderPlus
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customSounds: CustomSoundItem[];
  onSaveCustomSounds: (sounds: CustomSoundItem[]) => void;
  soundOverrides: SoundEventOverrides;
  onSaveSoundOverrides: (overrides: SoundEventOverrides) => void;
  soundEnabled: boolean;
}

const CATEGORIES: { id: SoundCategory; name: string; icon: string }[] = [
  { id: 'horn', name: 'Bocinas & Chicharras', icon: '🚨' },
  { id: 'goal', name: 'Goles & Anotaciones', icon: '⚽' },
  { id: 'whistle', name: 'Silbatos & Árbitro', icon: '📢' },
  { id: 'cheer', name: 'Hinchada & Aplausos', icon: '👏' },
  { id: 'fanfare', name: 'Fanfarrias & Música', icon: '🎺' },
  { id: 'announcement', name: 'Locución & Avisos', icon: '🎙️' },
  { id: 'custom', name: 'Personalizados', icon: '✨' },
];

const COLOR_PRESETS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#64748b', // slate
];

const EMOJI_PRESETS = ['🚨', '⚽', '🏀', '🏐', '🤾', '📢', '👏', '🎺', '🔔', '⏸️', '💥', '🔥', '🏆', '🎵', '🎙️', '⚡'];

export const CustomSoundManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  customSounds,
  onSaveCustomSounds,
  soundOverrides,
  onSaveSoundOverrides,
  soundEnabled
}) => {
  const [activeTab, setActiveTab] = useState<'board' | 'upload' | 'record' | 'overrides' | 'pack'>('board');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  
  // Estado de reproducción activa
  const [playingId, setPlayingId] = useState<string | null>(null);

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
  const recorderRef = useRef<VoiceRecorder | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup de reproducción al cerrar modal
  useEffect(() => {
    return () => {
      sounds.stopAllSounds();
    };
  }, []);

  if (!isOpen) return null;

  // Manejo de Reproducción
  const handleTogglePlay = (sound: CustomSoundItem) => {
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
        () => {
          setPlayingId((curr) => (curr === sound.id ? null : curr));
        }
      );

      // Enviar comando serie a Arduino si existe
      if (sound.arduinoCmd) {
        hardware.sendCommand(sound.arduinoCmd);
      } else {
        hardware.sendCommand(`CMD:SND:CUSTOM:${sound.name.substring(0, 10).toUpperCase()}`);
      }
    }
  };

  const handleStopAll = () => {
    sounds.stopAllSounds();
    setPlayingId(null);
  };

  // Eliminar Sonido
  const handleDeleteSound = (id: string) => {
    sounds.removeCustomSoundCache(id);
    if (playingId === id) setPlayingId(null);
    const updated = customSounds.filter((s) => s.id !== id);
    onSaveCustomSounds(updated);
  };

  // Actualizar Volumen o Atributos
  const handleUpdateSound = (id: string, partial: Partial<CustomSoundItem>) => {
    const updated = customSounds.map((s) => (s.id === id ? { ...s, ...partial } : s));
    onSaveCustomSounds(updated);
  };

  // Procesamiento de Archivos Drag & Drop o Input
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
    onSaveCustomSounds([...customSounds, ...uploadFiles]);
    setUploadFiles([]);
    setActiveTab('board');
  };

  // Iniciar Grabación de Micrófono
  const handleStartRecording = async () => {
    sounds.stopAllSounds();
    setPlayingId(null);
    const rec = new VoiceRecorder();
    recorderRef.current = rec;
    const ok = await rec.start();
    if (ok) {
      setIsRecording(true);
      setRecordingTime(0);
      setRecordedResult(null);
      setRecordedName(`Locución ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    }
  };

  const handleStopRecording = async () => {
    if (!recorderRef.current) return;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsRecording(false);
    try {
      const res = await recorderRef.current.stop();
      setRecordedResult(res);
    } catch (e) {
      console.error('Error al finalizar grabación:', e);
    }
  };

  const handleSaveRecordedSound = () => {
    if (!recordedResult) return;
    const newSound: CustomSoundItem = {
      id: `custom-mic-${Date.now()}`,
      name: recordedName || 'Grabación de Voz',
      category: recordedCategory,
      audioData: recordedResult.audioData,
      duration: recordedResult.duration,
      icon: recordedIcon,
      color: recordedColor,
      volume: 1.0,
      createdAt: Date.now(),
    };
    onSaveCustomSounds([...customSounds, newSound]);
    setRecordedResult(null);
    setActiveTab('board');
  };

  // Cargar Presets de Fábrica
  const handleLoadFactoryPresets = () => {
    const defaults = getDefaultPresetSounds();
    onSaveCustomSounds([...customSounds, ...defaults]);
    setActiveTab('board');
  };

  // Filtrado de lista de sonidos
  const filteredSounds = customSounds.filter((s) => {
    if (activeCategoryFilter === 'all') return true;
    return s.category === activeCategoryFilter;
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* HEADER MODAL */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/50 flex items-center justify-center">
              <Music className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-black font-stadium text-white tracking-wider flex items-center gap-2">
                ADMINISTRADOR DE SONIDOS PROPIOS Y VOCES
              </h2>
              <p className="text-xs text-slate-400 font-mono-code">
                Carga MP3/WAV, graba avisos con micrófono y asígnalos a eventos del estadio
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {playingId && (
              <button
                onClick={handleStopAll}
                className="bg-rose-600 hover:bg-rose-500 text-white font-stadium font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow animate-pulse"
              >
                <Square className="w-3.5 h-3.5" />
                <span>DETENER SONIDO</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TABS DE NAVEGACIÓN */}
        <div className="bg-slate-950/60 px-5 pt-3 border-b border-slate-800 flex flex-wrap gap-2 text-xs font-stadium font-bold">
          <button
            onClick={() => setActiveTab('board')}
            className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-2 border-b-2 ${
              activeTab === 'board'
                ? 'bg-slate-900 border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>SOUNDBOARD & PADS ({customSounds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-2 border-b-2 ${
              activeTab === 'upload'
                ? 'bg-slate-900 border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>CARGAR ARCHIVOS (MP3/WAV)</span>
          </button>

          <button
            onClick={() => setActiveTab('record')}
            className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-2 border-b-2 ${
              activeTab === 'record'
                ? 'bg-slate-900 border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-4 h-4 text-rose-400" />
            <span>GRABAR CON MICRÓFONO</span>
          </button>

          <button
            onClick={() => setActiveTab('overrides')}
            className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-2 border-b-2 ${
              activeTab === 'overrides'
                ? 'bg-slate-900 border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>ASOCIAR A EVENTOS (CHICHARRA / GOL)</span>
          </button>

          <button
            onClick={() => setActiveTab('pack')}
            className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-2 border-b-2 ${
              activeTab === 'pack'
                ? 'bg-slate-900 border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>PACKS & BACKUP</span>
          </button>
        </div>

        {/* CONTENIDO DE TABS */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: SOUNDBOARD & PADS */}
          {activeTab === 'board' && (
            <div className="space-y-4">
              {/* Filtros de Categoría */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setActiveCategoryFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      activeCategoryFilter === 'all'
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Todos ({customSounds.length})
                  </button>
                  {CATEGORIES.map((cat) => {
                    const count = customSounds.filter((s) => s.category === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategoryFilter(cat.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          activeCategoryFilter === cat.id
                            ? 'bg-purple-600 text-white shadow'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span className="hidden sm:inline">{cat.name}</span>
                        <span className="text-[10px] opacity-75">({count})</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setActiveTab('upload')}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-stadium font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ AGREGAR SONIDO</span>
                </button>
              </div>

              {/* Grid de Pads */}
              {filteredSounds.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-2xl">
                    🎵
                  </div>
                  <h3 className="text-base font-bold text-white font-stadium">
                    NO TIENES SONIDOS EN ESTA CATEGORÍA
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Carga archivos MP3/WAV o graba audios con tu micrófono para tenerlos listos en el tablero de control.
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl"
                    >
                      Subir Archivos
                    </button>
                    <button
                      onClick={handleLoadFactoryPresets}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl"
                    >
                      Cargar Muestras Prediseñadas
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredSounds.map((sound) => {
                    const isPlaying = playingId === sound.id;
                    const padColor = sound.color || '#3b82f6';
                    return (
                      <div
                        key={sound.id}
                        className={`bg-slate-950/90 border rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-200 group relative ${
                          isPlaying
                            ? 'border-2 shadow-lg shadow-purple-950/50 scale-[1.01]'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                        style={{
                          borderColor: isPlaying ? padColor : undefined,
                        }}
                      >
                        {/* Header del Pad */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center space-x-2.5 overflow-hidden">
                            <span 
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 shadow"
                              style={{ backgroundColor: `${padColor}25`, color: padColor, border: `1px solid ${padColor}40` }}
                            >
                              {sound.icon || '🎵'}
                            </span>
                            <div className="overflow-hidden">
                              <h4 className="font-stadium font-bold text-sm text-white truncate group-hover:text-purple-300 transition">
                                {sound.name}
                              </h4>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono-code">
                                <span>{sound.duration ? `${sound.duration}s` : 'Audio'}</span>
                                <span>•</span>
                                <span className="uppercase">{sound.category}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteSound(sound.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-950/30 transition opacity-60 group-hover:opacity-100"
                            title="Eliminar sonido"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Botón Principal de Reproducción (Pad Táctil) */}
                        <button
                          onClick={() => handleTogglePlay(sound)}
                          className={`w-full py-3 px-4 rounded-xl font-stadium font-black text-sm flex items-center justify-center space-x-2 transition shadow-lg my-1 ${
                            isPlaying
                              ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                              : 'hover:opacity-90 active:scale-95 text-white'
                          }`}
                          style={{
                            backgroundColor: isPlaying ? '#e11d48' : padColor,
                          }}
                        >
                          {isPlaying ? (
                            <>
                              <Square className="w-4 h-4 fill-white" />
                              <span>DETENER REPRODUCCIÓN</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 fill-white" />
                              <span>DISPARAR SONIDO</span>
                            </>
                          )}
                        </button>

                        {/* Controles de Pad (Volumen y Loop) */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-900 mt-2">
                          <div className="flex items-center space-x-2 w-1/2">
                            <Volume2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <input
                              type="range"
                              min="0.1"
                              max="1"
                              step="0.05"
                              value={sound.volume ?? 1.0}
                              onChange={(e) => handleUpdateSound(sound.id, { volume: parseFloat(e.target.value) })}
                              className="w-full h-1 bg-slate-800 rounded accent-purple-500 cursor-pointer"
                              title={`Volumen: ${Math.round((sound.volume ?? 1) * 100)}%`}
                            />
                          </div>

                          <label className="flex items-center space-x-1.5 cursor-pointer text-[10px] text-slate-400 hover:text-slate-200">
                            <input
                              type="checkbox"
                              checked={!!sound.loop}
                              onChange={(e) => handleUpdateSound(sound.id, { loop: e.target.checked })}
                              className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500 w-3 h-3"
                            />
                            <span>Bucle</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CARGAR ARCHIVOS */}
          {activeTab === 'upload' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFilesSelected(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 ${
                  isDragging
                    ? 'border-purple-400 bg-purple-950/20'
                    : 'border-slate-700 hover:border-purple-500 bg-slate-950/40 hover:bg-slate-950/70'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac,.webm"
                  className="hidden"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                />

                <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Upload className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-white font-stadium">
                    ARRASTRA Y SUELTA TUS ARCHIVOS DE AUDIO AQUÍ
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    o haz clic para explorar en tu computadora
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-mono-code text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">MP3</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">WAV</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">OGG</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">M4A</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">FLAC</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">WEBM</span>
                </div>
              </div>

              {/* Lista de Archivos en cola para guardar */}
              {uploadFiles.length > 0 && (
                <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-200 font-stadium">
                      ARCHIVOS LISTOS PARA AGREGAR ({uploadFiles.length})
                    </span>
                    <button
                      onClick={() => setUploadFiles([])}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Limpiar
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {uploadFiles.map((item, idx) => (
                      <div
                        key={item.id}
                        className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center space-x-2.5 flex-1 min-w-[200px]">
                          <span className="text-lg">{item.icon || '🎵'}</span>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => {
                                const copy = [...uploadFiles];
                                copy[idx].name = e.target.value;
                                setUploadFiles(copy);
                              }}
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-bold w-full outline-none focus:border-purple-500"
                              placeholder="Nombre del sonido"
                            />
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {item.fileName} • {item.duration}s
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <select
                            value={item.category}
                            onChange={(e) => {
                              const copy = [...uploadFiles];
                              copy[idx].category = e.target.value as SoundCategory;
                              setUploadFiles(copy);
                            }}
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs outline-none"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.icon} {c.name}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => handleTogglePlay(item)}
                            className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-lg"
                            title="Probar sonido"
                          >
                            {playingId === item.id ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => setUploadFiles(uploadFiles.filter((_, i) => i !== idx))}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSaveUploadedFiles}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-stadium font-black text-sm rounded-xl flex items-center justify-center space-x-2 shadow-lg transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>GUARDAR EN MI BIBLIOTECA DE SONIDOS</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GRABAR CON MICRÓFONO */}
          {activeTab === 'record' && (
            <div className="space-y-4 max-w-lg mx-auto text-center py-4">
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                    isRecording 
                      ? 'bg-rose-600/30 border-4 border-rose-500 animate-pulse ring-8 ring-rose-500/20'
                      : 'bg-slate-900 border-2 border-slate-700 text-slate-300'
                  }`}>
                    <Mic className={`w-10 h-10 ${isRecording ? 'text-rose-400' : 'text-slate-400'}`} />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-stadium font-black text-white">
                    {isRecording ? 'GRABANDO AUDIO EN VIVO...' : 'GRABADOR DE VOZ Y AVISOS'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono-code mt-1">
                    {isRecording 
                      ? `Tiempo grabado: 00:${String(recordingTime).padStart(2, '0')}`
                      : 'Graba anuncios de locutor, consignas del colegio o cánticos de aliento'}
                  </p>
                </div>

                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    className="bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-stadium font-bold text-sm px-6 py-3 rounded-2xl flex items-center justify-center space-x-2 mx-auto shadow-lg shadow-rose-950/50 transition"
                  >
                    <Mic className="w-4 h-4" />
                    <span>INICIAR GRABACIÓN</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-stadium font-bold text-sm px-6 py-3 rounded-2xl flex items-center justify-center space-x-2 mx-auto border border-slate-600 transition"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>DETENER Y GUARDAR</span>
                  </button>
                )}

                {/* Formulario después de grabar */}
                {recordedResult && !isRecording && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left space-y-3 mt-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-slate-200">Audio Grabado ({recordedResult.duration}s)</span>
                      <button
                        onClick={() => {
                          const testSound: CustomSoundItem = {
                            id: 'temp-preview',
                            name: 'Preview',
                            category: 'announcement',
                            audioData: recordedResult.audioData,
                            createdAt: 0,
                          };
                          handleTogglePlay(testSound);
                        }}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-1 rounded-lg flex items-center gap-1 font-bold"
                      >
                        <Play className="w-3 h-3" />
                        <span>Escuchar</span>
                      </button>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 font-bold block mb-1">Nombre del Aviso / Sonido:</label>
                      <input
                        type="text"
                        value={recordedName}
                        onChange={(e) => setRecordedName(e.target.value)}
                        placeholder="Ej: ¡ÚLTIMOS 10 SEGUNDOS!"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-400 font-bold block mb-1">Categoría:</label>
                        <select
                          value={recordedCategory}
                          onChange={(e) => setRecordedCategory(e.target.value as SoundCategory)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs outline-none"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.icon} {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 font-bold block mb-1">Icono:</label>
                        <div className="flex gap-1 overflow-x-auto py-1">
                          {['🎙️', '📢', '⚠️', '🔥', '🏀', '⚽', '🏆'].map((em) => (
                            <button
                              key={em}
                              type="button"
                              onClick={() => setRecordedIcon(em)}
                              className={`p-1.5 rounded-lg border text-sm ${
                                recordedIcon === em ? 'bg-purple-950 border-purple-500' : 'bg-slate-950 border-slate-800'
                              }`}
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveRecordedSound}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-stadium font-bold text-xs rounded-xl shadow mt-2"
                    >
                      AGREGAR A MIS SONIDOS
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ASOCIAR A EVENTOS (OVERRIDES) */}
          {activeTab === 'overrides' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 mb-3">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-stadium font-bold text-white">
                    MAPEO DE DISPARADORES AUTOMÁTICOS DEL TABLERO
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Elige qué sonido se ejecutará cuando ocurran eventos oficiales durante el partido en lugar del tono predeterminado.
                </p>

                <div className="space-y-3 text-xs">
                  {/* Fin de Tiempo / Cuarto */}
                  <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">🚨</span>
                      <div>
                        <div className="font-bold text-slate-200">Fin de Tiempo / Cuarto (00:00)</div>
                        <div className="text-[10px] text-slate-400">Chicharra final cuando el cronómetro llega a cero</div>
                      </div>
                    </div>
                    <select
                      value={soundOverrides.onPeriodEndHorn || 'default'}
                      onChange={(e) => onSaveSoundOverrides({ ...soundOverrides, onPeriodEndHorn: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-bold outline-none"
                    >
                      <option value="default">Predeterminado (Bocina Estadio NBA)</option>
                      {customSounds.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.icon} {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Violación 24s Shot Clock */}
                  <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">⏳</span>
                      <div>
                        <div className="font-bold text-slate-200">Fin de Posesión (24s / 14s)</div>
                        <div className="text-[10px] text-slate-400">Bocina estridente de posesión agotada</div>
                      </div>
                    </div>
                    <select
                      value={soundOverrides.onShotClockExpired || 'default'}
                      onChange={(e) => onSaveSoundOverrides({ ...soundOverrides, onShotClockExpired: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-bold outline-none"
                    >
                      <option value="default">Predeterminado (Buzzer Tablero LED)</option>
                      {customSounds.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.icon} {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Gol / Canasta Local */}
                  <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">⚽🏀</span>
                      <div>
                        <div className="font-bold text-blue-300">Anotación / Gol Equipo Local</div>
                        <div className="text-[10px] text-slate-400">Sonido al sumar puntos para el equipo local</div>
                      </div>
                    </div>
                    <select
                      value={soundOverrides.onScoreLocal || 'default'}
                      onChange={(e) => onSaveSoundOverrides({ ...soundOverrides, onScoreLocal: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-bold outline-none"
                    >
                      <option value="default">Predeterminado (Sirena Gol / Net Swish)</option>
                      {customSounds.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.icon} {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tiempo Muerto */}
                  <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">⏸️</span>
                      <div>
                        <div className="font-bold text-purple-300">Solicitud de Tiempo Muerto (60s)</div>
                        <div className="text-[10px] text-slate-400">Tono al iniciar el conteo de time-out reglamentario</div>
                      </div>
                    </div>
                    <select
                      value={soundOverrides.onTimeout || 'default'}
                      onChange={(e) => onSaveSoundOverrides({ ...soundOverrides, onTimeout: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-bold outline-none"
                    >
                      <option value="default">Predeterminado (Doble Tono de Time-out)</option>
                      {customSounds.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.icon} {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PACKS, BACKUP & PRESETS */}
          {activeTab === 'pack' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Exportar */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Download className="w-4 h-4 text-purple-400" />
                      <h4 className="font-stadium font-bold text-white text-sm">EXPORTAR PACK DE SONIDOS</h4>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">
                      Guarda todos tus sonidos en un archivo <code>.json</code> descargable para transferirlos a otra laptop del colegio.
                    </p>
                  </div>

                  <button
                    onClick={() => exportSoundPack(customSounds)}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-stadium font-bold rounded-xl shadow"
                  >
                    DESCARGAR BACKUP (.JSON)
                  </button>
                </div>

                {/* Importar */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <FolderPlus className="w-4 h-4 text-emerald-400" />
                      <h4 className="font-stadium font-bold text-white text-sm">IMPORTAR PACK</h4>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">
                      Carga un archivo <code>.json</code> con una biblioteca de audios previamente exportada.
                    </p>
                  </div>

                  <label className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-stadium font-bold rounded-xl shadow text-center cursor-pointer block">
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
                            setActiveTab('board');
                          } catch (err) {
                            console.error('Error al importar pack:', err);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Cargar Muestras de Fábrica */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-stadium font-bold text-white text-sm">LIBRERÍA DE SONIDOS PREESTABLECIDOS</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Añade 6 efectos sintetizados listos para usar (Bocina náutica, Sirena, Fox 40, Ovación, Campana de Ring).
                  </p>
                </div>

                <button
                  onClick={handleLoadFactoryPresets}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-stadium font-bold px-4 py-2 rounded-xl border border-slate-700"
                >
                  CARGAR MUESTRAS
                </button>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 font-mono-code">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Total de audios propios: <b>{customSounds.length}</b></span>
          </div>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-stadium font-bold px-4 py-1.5 rounded-xl"
          >
            CERRAR
          </button>
        </div>

      </div>
    </div>
  );
};
