export type AppMode = 'scoreboard' | 'clock' | 'banner' | 'manual' | 'audit' | 'arduino_code' | 'downloads';

export type TimerDirection = 'down' | 'up';

export type ClockColor = 'cyan' | 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'white' | 'lime';

export type SportType = 'basketball' | 'volleyball' | 'futsal' | 'handball' | 'soccer' | 'custom';

export type ConnectionType = 'none' | 'serial' | 'bluetooth' | 'wifi' | 'simulation';

export interface ScoreboardState {
  appMode: AppMode;
  sport: SportType;
  
  // Timer principal
  timerSeconds: number;
  targetSeconds: number;
  timerRunning: boolean;
  timerMode: TimerDirection;
  period: string; // "1", "2", "3", "4", "TE", "1T", "2T", "S1", "S2", etc.
  
  // Décimas de segundo para último minuto
  timerTenths: number; // 0-9
  enableTenthsLastMinute: boolean;
  
  // Shot clock / Posesión (24s / 14s)
  shotClockSeconds: number;
  shotClockRunning: boolean;
  shotClockVisible: boolean;
  syncShotClockWithMain: boolean; // Sincronización Paro/Arranque automático con reloj de juego
  autoResetShotClockOnScore: boolean; // Corte y reset automático a 24s al anotar punto en básquet
  
  // Tanteador y estadísticas de juego
  localName: string;
  visitorName: string;
  scoreLocal: number;
  scoreVisitor: number;
  foulsLocal: number;
  foulsVisitor: number;
  timeoutsLocal: number;
  timeoutsVisitor: number;
  possession: 'local' | 'visitor' | 'none';
  
  // Reglas profesionales añadidas
  // Básquetbol
  possessionArrow: 'local' | 'visitor'; // Flecha de posesión alternada FIBA
  
  // Voleibol / Tenis
  setsLocal: number;
  setsVisitor: number;
  subsLocal: number; // Sustituciones reglamentarias (máx 6 por set)
  subsVisitor: number;
  service: 'local' | 'visitor' | 'none'; // Turno de saque / servicio
  
  // Fútbol y Futsal
  yellowCardsLocal: number;
  yellowCardsVisitor: number;
  redCardsLocal: number;
  redCardsVisitor: number;
  addedTimeMinutes: number; // Minutos adicionados (+1, +2, +3, +5)
  
  // Handball y Futsal (Exclusiones de 2 Minutos temporizadas)
  penaltyLocal1: number | null; // segundos restantes de exclusión 1
  penaltyLocal2: number | null; // segundos restantes de exclusión 2
  penaltyVisitor1: number | null;
  penaltyVisitor2: number | null;
  blueCardsLocal: number;
  blueCardsVisitor: number;
  
  // Time-out oficial reglamentario (60s / 30s)
  timeoutCountdown: number | null;
  timeoutRunning: boolean;
  timeoutTeam: 'local' | 'visitor' | null;
  
  // Cartel / Banner / Mensajes
  marqueeText: string;
  marqueeLine2?: string; // Segundo renglón para modo 2 líneas
  bannerModeType?: 'two_lines' | 'single_line'; // 2 renglones o 1 renglón
  brightness: number; // 0 a 100
  bannerAnimation: 'scroll' | 'static' | 'flash';
  bannerFontSize?: '3x5' | '4x6' | '5x7'; // Tamaño de fuente del cartel (3x5 compacta, 4x6 media, 5x7 estándar)
  scrollDirection?: 'left_to_right' | 'right_to_left'; // Opción de desplazamiento: izquierda a derecha o derecha a izquierda
  bannerSpeed?: number; // Velocidad de desplazamiento (ms o nivel 1-5)
  bannerColor?: ClockColor; // Color de las letras del cartel
  
  // Reloj RTC
  autoSyncRtc: boolean;
  clockColor: ClockColor;
  
  // Iluminación LED Dinámica y Efectos por Componente
  ledLighting?: ScoreboardLedLighting;
  
  // Conexión
  connectionType: ConnectionType;
  connectionLabel: string;
  baudRate: number;
  wifiIp: string;
  soundEnabled: boolean;
  keyboardShortcutsEnabled?: boolean;
}

export type ShortcutActionId = 
  // Reloj principal
  | 'timer_toggle'
  | 'timer_reset'
  | 'timer_add_min'
  | 'timer_sub_min'
  | 'timer_add_sec'
  | 'timer_sub_sec'
  // Tanteador Local
  | 'score_local_add1'
  | 'score_local_add2'
  | 'score_local_add3'
  | 'score_local_sub1'
  | 'foul_local_add'
  | 'timeout_local'
  // Tanteador Visitante
  | 'score_visitor_add1'
  | 'score_visitor_add2'
  | 'score_visitor_add3'
  | 'score_visitor_sub1'
  | 'foul_visitor_add'
  | 'timeout_visitor'
  // Shot clock / Posesión
  | 'shot_clock_24'
  | 'shot_clock_14'
  | 'shot_clock_toggle'
  | 'possession_arrow'
  // Chicharra y Bocinas
  | 'horn_trigger'
  | 'whistle_trigger'
  | 'goal_sound_trigger'
  // Periodo / Set
  | 'next_period';

export type SoundCategory = 'horn' | 'goal' | 'whistle' | 'cheer' | 'music' | 'announcement' | 'fanfare' | 'custom';

export interface CustomSoundItem {
  id: string;
  name: string;
  category: SoundCategory;
  audioData: string; // Base64 data URL o Data URI (audio/mp3, audio/wav, audio/ogg, audio/webm, etc.)
  duration?: number; // Duración en segundos
  fileName?: string;
  fileSize?: number; // Bytes
  icon?: string; // Emoji decorativo
  color?: string; // Color HEX para el pad
  volume?: number; // 0.1 a 1.0 (default 1.0)
  loop?: boolean;
  shortcutKey?: string; // Tecla rápida personalizada (ej: '1', '2', 'F5')
  arduinoCmd?: string; // Comando serie opcional para Arduino
  createdAt: number;
}

export interface SoundEventOverrides {
  onPeriodEndHorn?: string; // ID del sonido personalizado o 'default' o builtin key
  onShotClockExpired?: string; // ID del sonido personalizado o 'default'
  onScoreLocal?: string; // ID de sonido o 'default'
  onScoreVisitor?: string; // ID de sonido o 'default'
  onGoal?: string; // ID de sonido o 'default'
  onTimeout?: string; // ID de sonido o 'default'
  onCard?: string; // ID de sonido o 'default'
  onTwoMinPenalty?: string; // ID de sonido o 'default'
  onSetPoint?: string; // ID de sonido o 'default'
}

export type BuiltinSoundKey = 
  | 'playHorn'
  | 'playShotClockViolation'
  | 'playShotClockWarning'
  | 'playDefenseChant'
  | 'playChargeFanfare'
  | 'playTripleBasket'
  | 'playBasketScore'
  | 'playWhistle'
  | 'playDoubleWhistle'
  | 'playSoccerMatchWhistle'
  | 'playTimeoutHorn'
  | 'playTimeoutWarning'
  | 'playGoalHorn'
  | 'playOleChant'
  | 'playDoblePenal'
  | 'playCardAlarm'
  | 'playMassApplause'
  | 'playSetPoint'
  | 'playSpikeAce'
  | 'playServeWhistle'
  | 'playRotationBeep'
  | 'playHandballGoal'
  | 'playTwoMinSuspension'
  | 'playPassivePlay'
  | 'playBoxingBell'
  | 'playGong'
  | 'playCountdown'
  | 'playBeep'
  | 'playClick';

export interface SportSoundPad {
  id: string;
  name: string;
  soundType: 'builtin' | 'custom';
  builtinKey?: BuiltinSoundKey;
  customSoundId?: string; // ID de CustomSoundItem
  icon?: string;
  color?: string;
  volume?: number;
  arduinoCmd?: string;
}

export interface SportSoundTemplate {
  sport: SportType;
  displayName: string;
  icon: string;
  description: string;
  pads: SportSoundPad[];
  overrides: SoundEventOverrides;
}

export type SportSoundTemplates = Record<SportType, SportSoundTemplate>;

export interface ShortcutDefinition {
  id: ShortcutActionId;
  name: string;
  category: 'timer' | 'local' | 'visitor' | 'shot_clock' | 'audio' | 'game';
  defaultKey: string;
  description: string;
}

export type KeyboardShortcutsMap = Record<ShortcutActionId, string>;

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'tx' | 'rx' | 'info' | 'error' | 'success';
  message: string;
  source?: string;
}

export interface CodeAuditItem {
  id: string;
  category: 'critical' | 'warning' | 'optimization' | 'suggestion';
  title: string;
  description: string;
  codeSnippetOriginal?: string;
  codeSnippetFixed?: string;
  status: 'fixed' | 'improved' | 'ready';
}

// ---------------------------------------------------------------------------
// Iluminación LED Dinámica y Efectos por Componente
// ---------------------------------------------------------------------------

export type LedColorEffect = 
  | 'solid'         // Color estático
  | 'rainbow'       // Onda arcoíris continua
  | 'pulse'         // Respiración / Pulso suave
  | 'color_cycle'   // Ciclo cromático rotativo
  | 'neon'          // Neón vibrante / Shimmer
  | 'fire'          // Fuego / Llama cálida
  | 'strobe'        // Flash / Alerta
  | 'dual_gradient'; // Gradiente bicolor desplazable

export type LedComponentId = 
  | 'scoreLocal'    // Tanteador Local (5x7)
  | 'scoreVisitor'  // Tanteador Visitante (5x7)
  | 'period'        // Texto de Periodo / Etapa Central (3x5)
  | 'timer'         // Cronómetro Principal HH:MM:SS (4x6)
  | 'possession'    // Indicadores de Posesión de Balón
  | 'banner'        // Cartel de Mensajes en modo Banner
  | 'clock'         // Reloj RTC
  | 'border';       // Borde / Acentos decorativos de la retícula

export interface LedComponentConfig {
  color: string;           // Color HEX primario (ej: '#00d2ff')
  secondaryColor?: string; // Color HEX secundario para gradientes
  effect: LedColorEffect;  // Tipo de animación
  speed: number;           // 1 (lento) a 5 (rápido), default 3
  brightness: number;      // 10 a 100%, default 100
}

export interface ScoreboardLedLighting {
  scoreLocal: LedComponentConfig;
  scoreVisitor: LedComponentConfig;
  period: LedComponentConfig;
  timer: LedComponentConfig;
  possession: LedComponentConfig;
  banner: LedComponentConfig;
  clock: LedComponentConfig;
  border: LedComponentConfig;
  activePreset?: string;
}

export interface LedPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  lighting: ScoreboardLedLighting;
}

