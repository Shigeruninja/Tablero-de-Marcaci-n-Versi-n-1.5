import { SportType, SportSoundPad, SportSoundTemplate, SportSoundTemplates, BuiltinSoundKey, SoundEventOverrides } from '../types';
import { sounds } from './audio';
import { hardware } from './hardwareManager';

export const BUILTIN_SOUNDS_CATALOG: {
  key: BuiltinSoundKey;
  name: string;
  category: 'horn' | 'goal' | 'whistle' | 'cheer' | 'announcement' | 'fanfare';
  defaultIcon: string;
  defaultColor: string;
  defaultArduinoCmd: string;
  description: string;
  play: (s: typeof sounds) => void;
}[] = [
  // Bocinas & Chicharras
  {
    key: 'playHorn',
    name: 'Bocina Potente Principal',
    category: 'horn',
    defaultIcon: '🚨',
    defaultColor: '#ef4444',
    defaultArduinoCmd: 'CMD:HORN',
    description: 'Chicharra principal de estadio de alta potencia para fin de cuarto / periodo.',
    play: (s) => s.playHorn(1600),
  },
  {
    key: 'playShotClockViolation',
    name: 'Bocina Reloj 24s / 14s',
    category: 'horn',
    defaultIcon: '⏱️',
    defaultColor: '#f97316',
    defaultArduinoCmd: 'CMD:SND:SHOT_HORN',
    description: 'Bocina zumbadora aguda de violación de tiempo de posesión.',
    play: (s) => s.playShotClockViolation(1100),
  },
  {
    key: 'playShotClockWarning',
    name: 'Aviso Últimos 5s Posesión',
    category: 'horn',
    defaultIcon: '⚠️',
    defaultColor: '#eab308',
    defaultArduinoCmd: 'CMD:SND:SHOT_WARN',
    description: 'Pulsos de beep penetrantes en cuenta regresiva 5-4-3-2-1.',
    play: (s) => s.playShotClockWarning(3),
  },

  // Silbatos
  {
    key: 'playWhistle',
    name: 'Silbato Árbitro Clásico',
    category: 'whistle',
    defaultIcon: '📢',
    defaultColor: '#0284c7',
    defaultArduinoCmd: 'CMD:SND:WHISTLE',
    description: 'Silbato simple con modulación de trino para faltas o detención de juego.',
    play: (s) => s.playWhistle(),
  },
  {
    key: 'playDoubleWhistle',
    name: 'Silbato Doble Árbitro',
    category: 'whistle',
    defaultIcon: '👥',
    defaultColor: '#0369a1',
    defaultArduinoCmd: 'CMD:SND:WHISTLE2',
    description: 'Doble pitido enérgico característico de sanciones o reanudaciones.',
    play: (s) => s.playDoubleWhistle(),
  },
  {
    key: 'playSoccerMatchWhistle',
    name: 'Silbato Final de Partido (3 Tiempos)',
    category: 'whistle',
    defaultIcon: '🏁',
    defaultColor: '#475569',
    defaultArduinoCmd: 'CMD:SND:MATCH_END',
    description: 'Secuencia clásica Pi-Pi-Piiii de culminación de partido.',
    play: (s) => s.playSoccerMatchWhistle(),
  },
  {
    key: 'playServeWhistle',
    name: 'Silbato de Saque Vóley',
    category: 'whistle',
    defaultIcon: '🏐',
    defaultColor: '#0ea5e9',
    defaultArduinoCmd: 'CMD:SND:VOLEY_SERVE',
    description: 'Silbato limpio y directo para autorización de saque.',
    play: (s) => s.playServeWhistle(),
  },

  // Goles & Puntos
  {
    key: 'playGoalHorn',
    name: 'Sirena & Bocina de Gol',
    category: 'goal',
    defaultIcon: '⚽',
    defaultColor: '#16a34a',
    defaultArduinoCmd: 'CMD:SND:GOAL',
    description: 'Bocina festiva de gol con modulación y vibración para fútbol y futsal.',
    play: (s) => s.playGoalHorn(),
  },
  {
    key: 'playBasketScore',
    name: 'Canasta Basket (+1/+2 pts)',
    category: 'goal',
    defaultIcon: '🏀',
    defaultColor: '#f59e0b',
    defaultArduinoCmd: 'CMD:SND:SWISH',
    description: 'Efecto sonoro de entrada limpia al aro con resonancia de red.',
    play: (s) => s.playBasketScore(),
  },
  {
    key: 'playTripleBasket',
    name: 'Melodía Triple Basket (+3 pts)',
    category: 'goal',
    defaultIcon: '🔥',
    defaultColor: '#d97706',
    defaultArduinoCmd: 'CMD:SND:TRIPLE',
    description: 'Fanfarria rápida de sintetizador por anotación de triple.',
    play: (s) => s.playTripleBasket(),
  },
  {
    key: 'playSpikeAce',
    name: 'Punto / Remate Ace Vóley',
    category: 'goal',
    defaultIcon: '💥',
    defaultColor: '#10b981',
    defaultArduinoCmd: 'CMD:SND:VOLEY_ACE',
    description: 'Impacto sónico dinámico para festejar bloqueo o punto directo.',
    play: (s) => s.playSpikeAce(),
  },
  {
    key: 'playHandballGoal',
    name: 'Gol Handball Sirena',
    category: 'goal',
    defaultIcon: '🤾',
    defaultColor: '#059669',
    defaultArduinoCmd: 'CMD:SND:HB_GOAL',
    description: 'Bocina rítmica de anotación europea de balonmano.',
    play: (s) => s.playHandballGoal(),
  },

  // Avisos, Faltas & Tiempos Muertos
  {
    key: 'playTimeoutHorn',
    name: 'Bocina Tiempo Muerto (Time-Out)',
    category: 'announcement',
    defaultIcon: '⏸️',
    defaultColor: '#8b5cf6',
    defaultArduinoCmd: 'CMD:SND:TIMEOUT',
    description: 'Sonido de dos tonos para solicitar o reanudar tiempos muertos.',
    play: (s) => s.playTimeoutHorn(),
  },
  {
    key: 'playTimeoutWarning',
    name: 'Aviso Previo 50s / 10s Time-Out',
    category: 'announcement',
    defaultIcon: '🔔',
    defaultColor: '#7c3aed',
    defaultArduinoCmd: 'CMD:SND:TO_WARN',
    description: 'Tono de advertencia para que los equipos vuelvan al campo.',
    play: (s) => s.playTimeoutWarning(),
  },
  {
    key: 'playCardAlarm',
    name: 'Alarma Tarjeta Roja / Amarilla',
    category: 'announcement',
    defaultIcon: '🟥',
    defaultColor: '#be123c',
    defaultArduinoCmd: 'CMD:SND:CARD',
    description: 'Señal disuasoria y de atención por amonestación o expulsión.',
    play: (s) => s.playCardAlarm(),
  },
  {
    key: 'playTwoMinSuspension',
    name: 'Suspensión 2 Minutos Handball',
    category: 'announcement',
    defaultIcon: '⏱️',
    defaultColor: '#c026d3',
    defaultArduinoCmd: 'CMD:SND:HB_2MIN',
    description: 'Beeps de sanción y exclusión temporal de 2 minutos.',
    play: (s) => s.playTwoMinSuspension(),
  },
  {
    key: 'playDoblePenal',
    name: 'Alerta 6ta Falta / Doble Penal',
    category: 'announcement',
    defaultIcon: '⚠️',
    defaultColor: '#b45309',
    defaultArduinoCmd: 'CMD:SND:FUTSAL_6F',
    description: 'Aviso sonoro de acumulación de faltas colectivas en futsal.',
    play: (s) => s.playDoblePenal(),
  },
  {
    key: 'playPassivePlay',
    name: 'Alerta Juego Pasivo Handball',
    category: 'announcement',
    defaultIcon: '⏳',
    defaultColor: '#9333ea',
    defaultArduinoCmd: 'CMD:SND:HB_PASSIVE',
    description: 'Señalización sonora de advertencia de juego pasivo arbitral.',
    play: (s) => s.playPassivePlay(),
  },
  {
    key: 'playSetPoint',
    name: 'Alerta Set Point / Match Point',
    category: 'announcement',
    defaultIcon: '🏆',
    defaultColor: '#e11d48',
    defaultArduinoCmd: 'CMD:SND:VOLEY_SET_PT',
    description: 'Acorde dramático de definición de set o partido.',
    play: (s) => s.playSetPoint(),
  },
  {
    key: 'playRotationBeep',
    name: 'Aviso Rotación / Posición Vóley',
    category: 'announcement',
    defaultIcon: '🔄',
    defaultColor: '#0891b2',
    defaultArduinoCmd: 'CMD:SND:VOLEY_ROT',
    description: 'Beep indicador de cambio de posiciones en rotación.',
    play: (s) => s.playRotationBeep(),
  },
  {
    key: 'playBoxingBell',
    name: 'Campana de Boxeo / Round',
    category: 'announcement',
    defaultIcon: '🔔',
    defaultColor: '#e11d48',
    defaultArduinoCmd: 'CMD:SND:BELL',
    description: 'Campana metálica nítida de inicio y fin de asalto o serie.',
    play: (s) => s.playBoxingBell(),
  },
  {
    key: 'playGong',
    name: 'Gong de Gimnasio / Descanso',
    category: 'announcement',
    defaultIcon: '🛑',
    defaultColor: '#4f46e5',
    defaultArduinoCmd: 'CMD:SND:GONG',
    description: 'Gong resonante de baja frecuencia para descansos o cierres.',
    play: (s) => s.playGong(),
  },
  {
    key: 'playCountdown',
    name: 'Cuenta Regresiva 3-2-1-GO',
    category: 'announcement',
    defaultIcon: '⏱️',
    defaultColor: '#0284c7',
    defaultArduinoCmd: 'CMD:SND:COUNTDOWN',
    description: 'Pitidos secuenciales de conteo regresivo de inicio de ejercicio.',
    play: (s) => s.playCountdown(),
  },
  {
    key: 'playBeep',
    name: 'Beep Corto de Notificación',
    category: 'announcement',
    defaultIcon: '🔘',
    defaultColor: '#64748b',
    defaultArduinoCmd: 'CMD:SND:BEEP',
    description: 'Beep estándar de confirmación de acción en tablero.',
    play: (s) => s.playBeep(880, 200),
  },
  {
    key: 'playClick',
    name: 'Click Táctil',
    category: 'announcement',
    defaultIcon: '👆',
    defaultColor: '#475569',
    defaultArduinoCmd: 'CMD:SND:CLICK',
    description: 'Click percusivo suave de pulsación de botón.',
    play: (s) => s.playClick(),
  },

  // Animación & Tribuna
  {
    key: 'playDefenseChant',
    name: 'Cántico DE-FENSE Órgano',
    category: 'fanfare',
    defaultIcon: '🛡️',
    defaultColor: '#2563eb',
    defaultArduinoCmd: 'CMD:SND:DEFENSE',
    description: 'Estribillo clásico de estadio "DE-FENSE, DE-FENSE" con aplausos.',
    play: (s) => s.playDefenseChant(),
  },
  {
    key: 'playChargeFanfare',
    name: 'Fanfarria ¡CHARGE! Estadio',
    category: 'fanfare',
    defaultIcon: '🎺',
    defaultColor: '#4f46e5',
    defaultArduinoCmd: 'CMD:SND:CHARGE',
    description: 'Fanfarria tradicional de trompeta para animar al público.',
    play: (s) => s.playChargeFanfare(),
  },
  {
    key: 'playOleChant',
    name: 'Cántico ¡Olé, Olé, Olé!',
    category: 'cheer',
    defaultIcon: '🎉',
    defaultColor: '#16a34a',
    defaultArduinoCmd: 'CMD:SND:OLE',
    description: 'Melodía festiva de tribuna coreada por la hinchada.',
    play: (s) => s.playOleChant(),
  },
  {
    key: 'playMassApplause',
    name: 'Ovación & Aplausos del Público',
    category: 'cheer',
    defaultIcon: '👏',
    defaultColor: '#059669',
    defaultArduinoCmd: 'CMD:SND:APPLAUSE',
    description: 'Sonido envolvente de aplausos y vitoreos de toda la cancha.',
    play: (s) => s.playMassApplause(undefined, 2.5),
  },
];

// Generar plantillas por defecto para cada deporte
export const DEFAULT_SPORT_TEMPLATES: SportSoundTemplates = {
  basketball: {
    sport: 'basketball',
    displayName: 'Básquetbol',
    icon: '🏀',
    description: 'Chicharra NBA/FIBA, posesión 24s/14s, defensa, triples, tiros libres y tiempos muertos.',
    pads: [
      { id: 'bb-horn', name: 'Bocina Principal', soundType: 'builtin', builtinKey: 'playHorn', icon: '🚨', color: '#ef4444', arduinoCmd: 'CMD:HORN' },
      { id: 'bb-shot', name: 'Chicharra 24s/14s', soundType: 'builtin', builtinKey: 'playShotClockViolation', icon: '⏱️', color: '#f97316', arduinoCmd: 'CMD:SND:SHOT_HORN' },
      { id: 'bb-warn', name: 'Alerta 5s Posesión', soundType: 'builtin', builtinKey: 'playShotClockWarning', icon: '⚠️', color: '#eab308', arduinoCmd: 'CMD:SND:SHOT_WARN' },
      { id: 'bb-def', name: 'DE-FENSE Órgano', soundType: 'builtin', builtinKey: 'playDefenseChant', icon: '🛡️', color: '#3b82f6', arduinoCmd: 'CMD:SND:DEFENSE' },
      { id: 'bb-chg', name: 'Fanfarria ¡CHARGE!', soundType: 'builtin', builtinKey: 'playChargeFanfare', icon: '🎺', color: '#6366f1', arduinoCmd: 'CMD:SND:CHARGE' },
      { id: 'bb-3pt', name: 'Triple Basket', soundType: 'builtin', builtinKey: 'playTripleBasket', icon: '🔥', color: '#f59e0b', arduinoCmd: 'CMD:SND:TRIPLE' },
      { id: 'bb-score', name: 'Canasta Swish', soundType: 'builtin', builtinKey: 'playBasketScore', icon: '🏀', color: '#10b981', arduinoCmd: 'CMD:SND:SWISH' },
      { id: 'bb-whistle', name: 'Silbato Árbitro', soundType: 'builtin', builtinKey: 'playWhistle', icon: '📢', color: '#0284c7', arduinoCmd: 'CMD:SND:WHISTLE' },
      { id: 'bb-to', name: 'Bocina Time-Out', soundType: 'builtin', builtinKey: 'playTimeoutHorn', icon: '⏸️', color: '#8b5cf6', arduinoCmd: 'CMD:SND:TIMEOUT' },
      { id: 'bb-to-warn', name: 'Aviso 50s Time-Out', soundType: 'builtin', builtinKey: 'playTimeoutWarning', icon: '🔔', color: '#a855f7', arduinoCmd: 'CMD:SND:TO_WARN' },
      { id: 'bb-cheer', name: 'Aplausos Estadio', soundType: 'builtin', builtinKey: 'playMassApplause', icon: '👏', color: '#059669', arduinoCmd: 'CMD:SND:APPLAUSE' },
      { id: 'bb-w2', name: 'Silbato Doble', soundType: 'builtin', builtinKey: 'playDoubleWhistle', icon: '⚡', color: '#dc2626', arduinoCmd: 'CMD:SND:WHISTLE2' },
    ],
    overrides: {
      onPeriodEndHorn: 'playHorn',
      onShotClockExpired: 'playShotClockViolation',
      onScoreLocal: 'playBasketScore',
      onScoreVisitor: 'playWhistle',
      onTimeout: 'playTimeoutHorn',
    }
  },
  soccer: {
    sport: 'soccer',
    displayName: 'Fútbol',
    icon: '⚽',
    description: 'Sirenas de gol, silbato oficial, cantos de tribuna, amonestaciones y fin de tiempo.',
    pads: [
      { id: 'sc-goal', name: '¡GOL! Sirena Estadio', soundType: 'builtin', builtinKey: 'playGoalHorn', icon: '⚽', color: '#16a34a', arduinoCmd: 'CMD:SND:GOAL' },
      { id: 'sc-ole', name: 'Cántico ¡Olé Olé!', soundType: 'builtin', builtinKey: 'playOleChant', icon: '🎉', color: '#22c55e', arduinoCmd: 'CMD:SND:OLE' },
      { id: 'sc-whistle2', name: 'Silbato Árbitro Doble', soundType: 'builtin', builtinKey: 'playDoubleWhistle', icon: '📢', color: '#0284c7', arduinoCmd: 'CMD:SND:WHISTLE2' },
      { id: 'sc-end', name: 'Silbato Final 3 Tiempos', soundType: 'builtin', builtinKey: 'playSoccerMatchWhistle', icon: '🏁', color: '#475569', arduinoCmd: 'CMD:SND:MATCH_END' },
      { id: 'sc-horn', name: 'Bocina Cancha', soundType: 'builtin', builtinKey: 'playHorn', icon: '🎺', color: '#ef4444', arduinoCmd: 'CMD:HORN' },
      { id: 'sc-card', name: 'Alarma Tarjeta Roja', soundType: 'builtin', builtinKey: 'playCardAlarm', icon: '🟥', color: '#dc2626', arduinoCmd: 'CMD:SND:CARD' },
      { id: 'sc-cheer', name: 'Aplausos Hinchada', soundType: 'builtin', builtinKey: 'playMassApplause', icon: '👏', color: '#059669', arduinoCmd: 'CMD:SND:APPLAUSE' },
      { id: 'sc-whistle', name: 'Silbato Simple Falta', soundType: 'builtin', builtinKey: 'playWhistle', icon: '👥', color: '#0369a1', arduinoCmd: 'CMD:SND:WHISTLE' },
    ],
    overrides: {
      onPeriodEndHorn: 'playSoccerMatchWhistle',
      onScoreLocal: 'playGoalHorn',
      onScoreVisitor: 'playWhistle',
      onGoal: 'playGoalHorn',
      onCard: 'playCardAlarm',
    }
  },
  futsal: {
    sport: 'futsal',
    displayName: 'Futsal',
    icon: '⚽',
    description: 'Chicharra de gimnasio techado, 6ta falta/doble penal, gol, tiempos muertos y silbatos.',
    pads: [
      { id: 'fs-goal', name: 'Gol Futsal Sirena', soundType: 'builtin', builtinKey: 'playGoalHorn', icon: '⚽', color: '#16a34a', arduinoCmd: 'CMD:SND:GOAL' },
      { id: 'fs-6f', name: 'Alerta 6ta Falta (Doble Penal)', soundType: 'builtin', builtinKey: 'playDoblePenal', icon: '⚠️', color: '#f59e0b', arduinoCmd: 'CMD:SND:FUTSAL_6F' },
      { id: 'fs-whistle2', name: 'Silbato Doble Árbitro', soundType: 'builtin', builtinKey: 'playDoubleWhistle', icon: '📢', color: '#0284c7', arduinoCmd: 'CMD:SND:WHISTLE2' },
      { id: 'fs-horn', name: 'Bocina Gimnasio Techado', soundType: 'builtin', builtinKey: 'playHorn', icon: '🚨', color: '#ef4444', arduinoCmd: 'CMD:HORN' },
      { id: 'fs-to', name: 'Bocina Tiempo Muerto 1m', soundType: 'builtin', builtinKey: 'playTimeoutHorn', icon: '⏸️', color: '#8b5cf6', arduinoCmd: 'CMD:SND:TIMEOUT' },
      { id: 'fs-card', name: 'Tarjeta / Amonestación', soundType: 'builtin', builtinKey: 'playCardAlarm', icon: '🟨', color: '#ea580c', arduinoCmd: 'CMD:SND:CARD' },
      { id: 'fs-cheer', name: 'Aplausos Gimnasio', soundType: 'builtin', builtinKey: 'playMassApplause', icon: '👏', color: '#059669', arduinoCmd: 'CMD:SND:APPLAUSE' },
      { id: 'fs-to-warn', name: 'Aviso Fin Minuto', soundType: 'builtin', builtinKey: 'playTimeoutWarning', icon: '🔔', color: '#7c3aed', arduinoCmd: 'CMD:SND:TO_WARN' },
    ],
    overrides: {
      onPeriodEndHorn: 'playHorn',
      onScoreLocal: 'playGoalHorn',
      onScoreVisitor: 'playWhistle',
      onGoal: 'playGoalHorn',
      onTimeout: 'playTimeoutHorn',
      onCard: 'playCardAlarm',
    }
  },
  volleyball: {
    sport: 'volleyball',
    displayName: 'Vóleibol',
    icon: '🏐',
    description: 'Set point, saque arbitral, remates directos / ace, rotación y bocina de set.',
    pads: [
      { id: 'vb-setpt', name: '¡SET POINT! Alerta', soundType: 'builtin', builtinKey: 'playSetPoint', icon: '🏆', color: '#e11d48', arduinoCmd: 'CMD:SND:VOLEY_SET_PT' },
      { id: 'vb-ace', name: 'Remate / Ace Power', soundType: 'builtin', builtinKey: 'playSpikeAce', icon: '💥', color: '#10b981', arduinoCmd: 'CMD:SND:VOLEY_ACE' },
      { id: 'vb-serve', name: 'Silbato de Saque', soundType: 'builtin', builtinKey: 'playServeWhistle', icon: '🏐', color: '#0284c7', arduinoCmd: 'CMD:SND:VOLEY_SERVE' },
      { id: 'vb-rot', name: 'Aviso Rotación Posición', soundType: 'builtin', builtinKey: 'playRotationBeep', icon: '🔄', color: '#0891b2', arduinoCmd: 'CMD:SND:VOLEY_ROT' },
      { id: 'vb-whistle', name: 'Silbato Árbitro Doble', soundType: 'builtin', builtinKey: 'playDoubleWhistle', icon: '📢', color: '#0369a1', arduinoCmd: 'CMD:SND:WHISTLE2' },
      { id: 'vb-to', name: 'Bocina Tiempo Muerto 30s', soundType: 'builtin', builtinKey: 'playTimeoutHorn', icon: '⏸️', color: '#8b5cf6', arduinoCmd: 'CMD:SND:TIMEOUT' },
      { id: 'vb-horn', name: 'Bocina Fin de Set', soundType: 'builtin', builtinKey: 'playHorn', icon: '🚨', color: '#ef4444', arduinoCmd: 'CMD:HORN' },
      { id: 'vb-cheer', name: 'Aplausos Tribuna', soundType: 'builtin', builtinKey: 'playMassApplause', icon: '👏', color: '#059669', arduinoCmd: 'CMD:SND:APPLAUSE' },
    ],
    overrides: {
      onPeriodEndHorn: 'playHorn',
      onScoreLocal: 'playSpikeAce',
      onScoreVisitor: 'playWhistle',
      onSetPoint: 'playSetPoint',
      onTimeout: 'playTimeoutHorn',
    }
  },
  handball: {
    sport: 'handball',
    displayName: 'Handball',
    icon: '🤾',
    description: 'Bocina de gol, exclusión de 2 minutos, juego pasivo, tiempos muertos y chicharra.',
    pads: [
      { id: 'hb-goal', name: 'Gol Handball Sirena', soundType: 'builtin', builtinKey: 'playHandballGoal', icon: '🤾', color: '#059669', arduinoCmd: 'CMD:SND:HB_GOAL' },
      { id: 'hb-2min', name: 'Suspensión 2 Minutos', soundType: 'builtin', builtinKey: 'playTwoMinSuspension', icon: '⏱️', color: '#c026d3', arduinoCmd: 'CMD:SND:HB_2MIN' },
      { id: 'hb-passive', name: 'Alerta Juego Pasivo', soundType: 'builtin', builtinKey: 'playPassivePlay', icon: '⏳', color: '#9333ea', arduinoCmd: 'CMD:SND:HB_PASSIVE' },
      { id: 'hb-whistle', name: 'Silbato Árbitro Oficial', soundType: 'builtin', builtinKey: 'playWhistle', icon: '📢', color: '#0284c7', arduinoCmd: 'CMD:SND:WHISTLE' },
      { id: 'hb-horn', name: 'Bocina Chicharra Periodo', soundType: 'builtin', builtinKey: 'playHorn', icon: '🚨', color: '#ef4444', arduinoCmd: 'CMD:HORN' },
      { id: 'hb-to', name: 'Bocina Tiempo de Equipo', soundType: 'builtin', builtinKey: 'playTimeoutHorn', icon: '⏸️', color: '#8b5cf6', arduinoCmd: 'CMD:SND:TIMEOUT' },
      { id: 'hb-card', name: 'Tarjeta Roja / Azul', soundType: 'builtin', builtinKey: 'playCardAlarm', icon: '🟥', color: '#dc2626', arduinoCmd: 'CMD:SND:CARD' },
      { id: 'hb-cheer', name: 'Aplausos Cancha', soundType: 'builtin', builtinKey: 'playMassApplause', icon: '👏', color: '#10b981', arduinoCmd: 'CMD:SND:APPLAUSE' },
    ],
    overrides: {
      onPeriodEndHorn: 'playHorn',
      onScoreLocal: 'playHandballGoal',
      onScoreVisitor: 'playWhistle',
      onTwoMinPenalty: 'playTwoMinSuspension',
      onTimeout: 'playTimeoutHorn',
    }
  },
  custom: {
    sport: 'custom',
    displayName: 'Entrenamiento & Gimnasio',
    icon: '⏱️',
    description: 'Campana de round de boxeo, gong de descanso, cuenta regresiva y beeps de intervalos.',
    pads: [
      { id: 'tr-bell', name: 'Campana Round Boxeo', soundType: 'builtin', builtinKey: 'playBoxingBell', icon: '🔔', color: '#e11d48', arduinoCmd: 'CMD:SND:BELL' },
      { id: 'tr-gong', name: 'Gong Fin de Serie / Descanso', soundType: 'builtin', builtinKey: 'playGong', icon: '🛑', color: '#4f46e5', arduinoCmd: 'CMD:SND:GONG' },
      { id: 'tr-count', name: 'Cuenta Regresiva 3-2-1-GO', soundType: 'builtin', builtinKey: 'playCountdown', icon: '⏱️', color: '#0284c7', arduinoCmd: 'CMD:SND:COUNTDOWN' },
      { id: 'tr-horn', name: 'Bocina de Intervalo', soundType: 'builtin', builtinKey: 'playHorn', icon: '🚨', color: '#ef4444', arduinoCmd: 'CMD:HORN' },
      { id: 'tr-whistle', name: 'Silbato Cambio Estación', soundType: 'builtin', builtinKey: 'playWhistle', icon: '📢', color: '#0369a1', arduinoCmd: 'CMD:SND:WHISTLE' },
      { id: 'tr-cheer', name: 'Aplausos Motivación', soundType: 'builtin', builtinKey: 'playMassApplause', icon: '👏', color: '#059669', arduinoCmd: 'CMD:SND:APPLAUSE' },
    ],
    overrides: {
      onPeriodEndHorn: 'playBoxingBell',
      onTimeout: 'playGong',
    }
  }
};

const STORAGE_SPORT_TEMPLATES_KEY = 'scoreboard_sport_sound_templates_v2';

export function getStoredSportTemplates(): SportSoundTemplates {
  try {
    const raw = localStorage.getItem(STORAGE_SPORT_TEMPLATES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validar que incluya todos los deportes
      const result = { ...DEFAULT_SPORT_TEMPLATES };
      (Object.keys(DEFAULT_SPORT_TEMPLATES) as SportType[]).forEach((sp) => {
        if (parsed[sp]) {
          result[sp] = {
            ...DEFAULT_SPORT_TEMPLATES[sp],
            ...parsed[sp],
            pads: Array.isArray(parsed[sp].pads) ? parsed[sp].pads : DEFAULT_SPORT_TEMPLATES[sp].pads,
            overrides: { ...DEFAULT_SPORT_TEMPLATES[sp].overrides, ...(parsed[sp].overrides || {}) }
          };
        }
      });
      return result;
    }
  } catch (e) {
    console.error('Error al leer plantillas de sonido por deporte:', e);
  }

  return DEFAULT_SPORT_TEMPLATES;
}

export function saveStoredSportTemplates(templates: SportSoundTemplates) {
  try {
    localStorage.setItem(STORAGE_SPORT_TEMPLATES_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Error al guardar plantillas de sonido:', e);
  }
}

export function resetSportTemplate(sport: SportType): SportSoundTemplate {
  const current = getStoredSportTemplates();
  const def = DEFAULT_SPORT_TEMPLATES[sport];
  current[sport] = JSON.parse(JSON.stringify(def));
  saveStoredSportTemplates(current);
  return current[sport];
}

export function resetAllSportTemplates(): SportSoundTemplates {
  const defaults = JSON.parse(JSON.stringify(DEFAULT_SPORT_TEMPLATES));
  saveStoredSportTemplates(defaults);
  return defaults;
}
