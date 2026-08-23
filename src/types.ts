export type AppMode = 'scoreboard' | 'clock' | 'banner' | 'manual' | 'audit' | 'arduino_code';

export type TimerDirection = 'down' | 'up';

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
  brightness: number; // 0 a 100
  bannerAnimation: 'scroll' | 'static' | 'flash';
  
  // Reloj RTC
  autoSyncRtc: boolean;
  
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
