import { CustomSoundItem, SoundEventOverrides, SoundCategory } from '../types';
import { sounds } from './audio';

const STORAGE_CUSTOM_SOUNDS_KEY = 'scoreboard_custom_sounds_v1';
const STORAGE_SOUND_OVERRIDES_KEY = 'scoreboard_sound_overrides_v1';

// Generador sintético de WAV Base64 para sonidos de demostración integrados
function createSyntheticWavDataUrl(
  type: 'airhorn' | 'siren' | 'whistle' | 'bell' | 'cheer' | 'voice_timeout',
  sampleRate = 22050
): string {
  const durationSecs = type === 'airhorn' ? 1.4 : type === 'siren' ? 2.0 : type === 'cheer' ? 2.2 : 1.2;
  const numSamples = Math.floor(sampleRate * durationSecs);
  const buffer = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    if (type === 'airhorn') {
      // Bocina potente de aire bitonal (145Hz + 218Hz) con armónicos
      const env = Math.min(1, t * 25) * Math.max(0, 1 - Math.pow(t / durationSecs, 4));
      const s1 = Math.sin(2 * Math.PI * 145 * t);
      const s2 = Math.sin(2 * Math.PI * 218 * t);
      const s3 = Math.sin(2 * Math.PI * 290 * t) * 0.5;
      const s4 = Math.sin(2 * Math.PI * 435 * t) * 0.3;
      sample = (s1 + s2 + s3 + s4) * 0.35 * env;
    } else if (type === 'siren') {
      // Sirena de emergencia ascendente y descendente
      const freq = 450 + 350 * Math.sin(2 * Math.PI * 1.5 * t);
      const env = Math.min(1, t * 15) * Math.min(1, (durationSecs - t) * 4);
      sample = (Math.sin(2 * Math.PI * freq * t) > 0 ? 0.3 : -0.3) * env;
    } else if (type === 'whistle') {
      // Silbato estridente con trino
      const trill = 1 + 0.05 * Math.sin(2 * Math.PI * 30 * t);
      const env = Math.min(1, t * 30) * Math.min(1, (durationSecs - t) * 8);
      sample = (Math.sin(2 * Math.PI * 2750 * trill * t) * 0.35 + Math.sin(2 * Math.PI * 2950 * trill * t) * 0.25) * env;
    } else if (type === 'bell') {
      // Campana metálica de ring
      const env = Math.exp(-t * 3.5);
      sample = (Math.sin(2 * Math.PI * 1865 * t) * 0.4 + Math.sin(2 * Math.PI * 2794 * t) * 0.3 + Math.sin(2 * Math.PI * 3730 * t) * 0.2) * env;
    } else if (type === 'cheer') {
      // Ovación y murmullo de hinchada
      const env = Math.sin((Math.PI * t) / durationSecs);
      sample = (Math.random() * 2 - 1) * 0.3 * env;
    } else {
      // Tono melódico de aviso de locución (Do-Mi-Sol)
      const noteTime = t % 0.3;
      const noteIdx = Math.floor(t / 0.3);
      const freq = noteIdx === 0 ? 523.25 : noteIdx === 1 ? 659.25 : 783.99;
      const env = Math.min(1, noteTime * 40) * Math.exp(-noteTime * 6);
      sample = Math.sin(2 * Math.PI * freq * noteTime) * 0.4 * env;
    }

    buffer[i] = Math.max(-1, Math.min(1, sample));
  }

  // Convertir Float32Array a PCM 16-bit WAV Data URL
  const wavBytes = encodeWavPCM16(buffer, sampleRate);
  let binary = '';
  const bytes = new Uint8Array(wavBytes);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

function encodeWavPCM16(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  /* RIFF identifier */
  writeString(0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(8, 'WAVE');
  /* format chunk identifier */
  writeString(12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  // Escribir muestras PCM 16 bit
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return buffer;
}

// Preset predeterminados para inicio instantáneo
export function getDefaultPresetSounds(): CustomSoundItem[] {
  return [
    {
      id: 'preset-airhorn',
      name: 'Bocina Náutica de Aire',
      category: 'horn',
      audioData: createSyntheticWavDataUrl('airhorn'),
      duration: 1.4,
      fileName: 'bocina_estadio_potente.wav',
      icon: '🚨',
      color: '#ef4444',
      volume: 1.0,
      shortcutKey: '1',
      arduinoCmd: 'CMD:SND:CUSTOM:HORN',
      createdAt: 1700000001
    },
    {
      id: 'preset-siren',
      name: 'Sirena Bomberos / Estadio',
      category: 'horn',
      audioData: createSyntheticWavDataUrl('siren'),
      duration: 2.0,
      fileName: 'sirena_gol_emergencia.wav',
      icon: '🚨',
      color: '#f59e0b',
      volume: 0.9,
      shortcutKey: '2',
      arduinoCmd: 'CMD:SND:CUSTOM:SIREN',
      createdAt: 1700000002
    },
    {
      id: 'preset-whistle',
      name: 'Silbato Fox 40 Pro',
      category: 'whistle',
      audioData: createSyntheticWavDataUrl('whistle'),
      duration: 1.2,
      fileName: 'silbato_arbitro_pro.wav',
      icon: '📢',
      color: '#3b82f6',
      volume: 0.9,
      shortcutKey: '3',
      arduinoCmd: 'CMD:SND:CUSTOM:WHISTLE',
      createdAt: 1700000003
    },
    {
      id: 'preset-cheer',
      name: 'Ovación Hinchada',
      category: 'cheer',
      audioData: createSyntheticWavDataUrl('cheer'),
      duration: 2.2,
      fileName: 'ovacion_tribuna.wav',
      icon: '👏',
      color: '#10b981',
      volume: 0.95,
      shortcutKey: '4',
      arduinoCmd: 'CMD:SND:CUSTOM:CHEER',
      createdAt: 1700000004
    },
    {
      id: 'preset-bell',
      name: 'Campana de Round / Ring',
      category: 'announcement',
      audioData: createSyntheticWavDataUrl('bell'),
      duration: 1.2,
      fileName: 'campana_gimnasio.wav',
      icon: '🔔',
      color: '#a855f7',
      volume: 0.9,
      shortcutKey: '5',
      arduinoCmd: 'CMD:SND:CUSTOM:BELL',
      createdAt: 1700000005
    },
    {
      id: 'preset-timeout',
      name: 'Aviso Tiempo Muerto (Chime)',
      category: 'announcement',
      audioData: createSyntheticWavDataUrl('voice_timeout'),
      duration: 1.2,
      fileName: 'chime_timeout.wav',
      icon: '⏸️',
      color: '#06b6d4',
      volume: 0.85,
      shortcutKey: '6',
      arduinoCmd: 'CMD:SND:CUSTOM:TIMEOUT',
      createdAt: 1700000006
    }
  ];
}

// Almacenamiento Local de Sonidos
export function getStoredCustomSounds(): CustomSoundItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_SOUNDS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (e) {
    console.error('Error al leer sonidos personalizados guardados:', e);
  }

  // Retornar presets si no hay personalizados
  const defaults = getDefaultPresetSounds();
  saveStoredCustomSounds(defaults);
  return defaults;
}

export function saveStoredCustomSounds(soundsList: CustomSoundItem[]) {
  try {
    localStorage.setItem(STORAGE_CUSTOM_SOUNDS_KEY, JSON.stringify(soundsList));
  } catch (e) {
    console.error('Error al guardar sonidos personalizados en localStorage (posible límite de cuota superado):', e);
  }
}

// Configuración de Mapeo / Sobrescritura de Eventos
export const DEFAULT_SOUND_OVERRIDES: SoundEventOverrides = {
  onPeriodEndHorn: 'default',
  onShotClockExpired: 'default',
  onScoreLocal: 'default',
  onScoreVisitor: 'default',
  onGoal: 'default',
  onTimeout: 'default',
  onCard: 'default',
};

export function getStoredSoundOverrides(): SoundEventOverrides {
  try {
    const raw = localStorage.getItem(STORAGE_SOUND_OVERRIDES_KEY);
    if (raw) {
      return { ...DEFAULT_SOUND_OVERRIDES, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error al leer configuración de eventos sonoros:', e);
  }
  return { ...DEFAULT_SOUND_OVERRIDES };
}

export function saveStoredSoundOverrides(overrides: SoundEventOverrides) {
  try {
    localStorage.setItem(STORAGE_SOUND_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch (e) {
    console.error('Error al guardar configuración de eventos sonoros:', e);
  }
}

// Lector de Archivos de Audio Locales (MP3, WAV, OGG, M4A, FLAC, WebM)
export async function readAudioFile(file: File): Promise<CustomSoundItem> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const audioData = reader.result as string;
        
        // Calcular duración exacta del audio usando objeto Audio
        const tempAudio = new Audio();
        tempAudio.src = audioData;

        tempAudio.onloadedmetadata = () => {
          const duration = Math.round(tempAudio.duration * 10) / 10 || 1.0;
          
          // Asignar categoría e icono automático según nombre
          const lower = file.name.toLowerCase();
          let category: SoundCategory = 'custom';
          let icon = '🎵';
          let color = '#3b82f6';

          if (lower.includes('gol') || lower.includes('goal')) {
            category = 'goal';
            icon = '⚽';
            color = '#10b981';
          } else if (lower.includes('bocina') || lower.includes('horn') || lower.includes('chicharra') || lower.includes('buzzer')) {
            category = 'horn';
            icon = '🚨';
            color = '#ef4444';
          } else if (lower.includes('silbato') || lower.includes('whistle') || lower.includes('arbitro')) {
            category = 'whistle';
            icon = '📢';
            color = '#06b6d4';
          } else if (lower.includes('hinchada') || lower.includes('aplauso') || lower.includes('cheer') || lower.includes('ovacion')) {
            category = 'cheer';
            icon = '👏';
            color = '#8b5cf6';
          } else if (lower.includes('campana') || lower.includes('bell') || lower.includes('ring')) {
            category = 'announcement';
            icon = '🔔';
            color = '#f59e0b';
          } else if (lower.includes('tiempo') || lower.includes('timeout')) {
            category = 'announcement';
            icon = '⏸️';
            color = '#ec4899';
          }

          const soundItem: CustomSoundItem = {
            id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name.replace(/\.[^/.]+$/, ''), // Sin extensión
            category,
            audioData,
            duration,
            fileName: file.name,
            fileSize: file.size,
            icon,
            color,
            volume: 1.0,
            createdAt: Date.now(),
          };

          // Preload in sound engine
          sounds.preloadCustomAudio(soundItem.id, audioData);
          resolve(soundItem);
        };

        tempAudio.onerror = () => {
          // Fallback si metadata tarda
          const soundItem: CustomSoundItem = {
            id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            category: 'custom',
            audioData,
            duration: 2.0,
            fileName: file.name,
            fileSize: file.size,
            icon: '🎵',
            color: '#3b82f6',
            volume: 1.0,
            createdAt: Date.now(),
          };
          resolve(soundItem);
        };
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

// Grabador de Micrófono
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime = 0;

  async start(): Promise<boolean> {
    try {
      this.audioChunks = [];
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const options = MediaRecorder.isTypeSupported('audio/webm') 
        ? { mimeType: 'audio/webm' } 
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? { mimeType: 'audio/mp4' }
        : undefined;

      this.mediaRecorder = new MediaRecorder(this.stream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.startTime = Date.now();
      this.mediaRecorder.start(100);
      return true;
    } catch (e) {
      console.error('Error al acceder al micrófono:', e);
      return false;
    }
  }

  stop(): Promise<{ audioData: string; duration: number }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Grabador no iniciado'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const duration = Math.max(0.5, Math.round(((Date.now() - this.startTime) / 1000) * 10) / 10);
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });

        // Detener pistas de micrófono
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          resolve({ audioData: base64Data, duration });
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  cancel() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.audioChunks = [];
  }
}

// Exportar biblioteca de sonidos a archivo JSON descargable
export function exportSoundPack(soundsList: CustomSoundItem[], packName = 'pack_sonidos_tablero_gimnasio') {
  const dataStr = JSON.stringify(soundsList, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${packName}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Importar biblioteca desde archivo JSON
export async function importSoundPack(file: File): Promise<CustomSoundItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!Array.isArray(parsed)) {
          throw new Error('El archivo no contiene un array válido de sonidos.');
        }
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}
