import { ShortcutActionId, ShortcutDefinition, KeyboardShortcutsMap } from '../types';

export const SHORTCUT_DEFINITIONS: ShortcutDefinition[] = [
  // 1. RELOJ PRINCIPAL
  {
    id: 'timer_toggle',
    name: 'Iniciar / Pausar Cronómetro',
    category: 'timer',
    defaultKey: 'Space',
    description: 'Arranca o detiene el tiempo de juego principal',
  },
  {
    id: 'timer_reset',
    name: 'Reiniciar Cronómetro',
    category: 'timer',
    defaultKey: 'KeyR',
    description: 'Reinicia el cronómetro al tiempo reglamentario inicial',
  },
  {
    id: 'timer_add_min',
    name: 'Sumar +1 Minuto',
    category: 'timer',
    defaultKey: 'Equal', // '+'
    description: 'Añade 1 minuto al tiempo de juego',
  },
  {
    id: 'timer_sub_min',
    name: 'Restar -1 Minuto',
    category: 'timer',
    defaultKey: 'Minus', // '-'
    description: 'Resta 1 minuto al tiempo de juego',
  },
  {
    id: 'timer_add_sec',
    name: 'Sumar +10 Segundos',
    category: 'timer',
    defaultKey: 'BracketRight', // ']'
    description: 'Añade 10 segundos para corrección rápida',
  },
  {
    id: 'timer_sub_sec',
    name: 'Restar -10 Segundos',
    category: 'timer',
    defaultKey: 'BracketLeft', // '['
    description: 'Descuenta 10 segundos',
  },

  // 2. EQUIPO LOCAL
  {
    id: 'score_local_add1',
    name: 'Local: +1 Punto / Gol',
    category: 'local',
    defaultKey: 'KeyQ',
    description: 'Suma 1 punto o gol al equipo local',
  },
  {
    id: 'score_local_add2',
    name: 'Local: +2 Puntos (Doble)',
    category: 'local',
    defaultKey: 'KeyW',
    description: 'Suma 2 puntos de campo al equipo local',
  },
  {
    id: 'score_local_add3',
    name: 'Local: +3 Puntos (Triple)',
    category: 'local',
    defaultKey: 'KeyE',
    description: 'Suma 3 puntos de triple al equipo local',
  },
  {
    id: 'score_local_sub1',
    name: 'Local: -1 Punto / Gol (Corrección)',
    category: 'local',
    defaultKey: 'KeyA',
    description: 'Descuenta 1 punto en caso de anulación',
  },
  {
    id: 'foul_local_add',
    name: 'Local: +1 Falta Colectiva',
    category: 'local',
    defaultKey: 'KeyF',
    description: 'Registra una falta para el equipo local',
  },
  {
    id: 'timeout_local',
    name: 'Local: Pedir Tiempo Muerto (60s)',
    category: 'local',
    defaultKey: 'KeyT',
    description: 'Inicia cuenta regresiva oficial de Time-Out local',
  },

  // 3. EQUIPO VISITANTE
  {
    id: 'score_visitor_add1',
    name: 'Visitante: +1 Punto / Gol',
    category: 'visitor',
    defaultKey: 'KeyU',
    description: 'Suma 1 punto o gol al equipo visitante',
  },
  {
    id: 'score_visitor_add2',
    name: 'Visitante: +2 Puntos (Doble)',
    category: 'visitor',
    defaultKey: 'KeyI',
    description: 'Suma 2 puntos de campo al equipo visitante',
  },
  {
    id: 'score_visitor_add3',
    name: 'Visitante: +3 Puntos (Triple)',
    category: 'visitor',
    defaultKey: 'KeyO',
    description: 'Suma 3 puntos de triple al equipo visitante',
  },
  {
    id: 'score_visitor_sub1',
    name: 'Visitante: -1 Punto / Gol (Corrección)',
    category: 'visitor',
    defaultKey: 'KeyJ',
    description: 'Descuenta 1 punto en caso de anulación',
  },
  {
    id: 'foul_visitor_add',
    name: 'Visitante: +1 Falta Colectiva',
    category: 'visitor',
    defaultKey: 'KeyH',
    description: 'Registra una falta para el equipo visitante',
  },
  {
    id: 'timeout_visitor',
    name: 'Visitante: Pedir Tiempo Muerto (60s)',
    category: 'visitor',
    defaultKey: 'KeyY',
    description: 'Inicia cuenta regresiva oficial de Time-Out visitante',
  },

  // 4. POSESIÓN Y RELOJ DE TIRO (SHOT CLOCK)
  {
    id: 'shot_clock_24',
    name: 'Posesión: Reset 24 Segundos',
    category: 'shot_clock',
    defaultKey: 'Digit1', // '1'
    description: 'Reinicia el reloj de posesión a 24 segundos (FIBA)',
  },
  {
    id: 'shot_clock_14',
    name: 'Posesión: Reset 14 Segundos',
    category: 'shot_clock',
    defaultKey: 'Digit2', // '2'
    description: 'Reinicia a 14 segundos (Rebote ofensivo / Falta pista delantera)',
  },
  {
    id: 'shot_clock_toggle',
    name: 'Posesión: Iniciar / Pausar 24s',
    category: 'shot_clock',
    defaultKey: 'Digit3', // '3'
    description: 'Detiene o reanuda el conteo de los 24/14 segundos',
  },
  {
    id: 'possession_arrow',
    name: 'Posesión: Alternar Flecha Salto FIBA',
    category: 'shot_clock',
    defaultKey: 'KeyP',
    description: 'Cambia la flecha reglamentaria de posesión alterna',
  },

  // 5. SONIDOS Y EFECTOS
  {
    id: 'horn_trigger',
    name: 'Bocina / Chicharra Manual',
    category: 'audio',
    defaultKey: 'KeyB',
    description: 'Activa la chicharra acústica del estadio inmediatamente',
  },
  {
    id: 'whistle_trigger',
    name: 'Silbato de Árbitro',
    category: 'audio',
    defaultKey: 'KeyS',
    description: 'Emite silbato de falta o reanudación',
  },
  {
    id: 'goal_sound_trigger',
    name: 'Cántico / Bocina ¡Gol!',
    category: 'audio',
    defaultKey: 'KeyG',
    description: 'Dispara efecto de gol con ovación y sirena',
  },

  // 6. JUEGO Y PERIODO
  {
    id: 'next_period',
    name: 'Avanzar Periodo / Cuarto / Set',
    category: 'game',
    defaultKey: 'KeyN',
    description: 'Pasa al siguiente cuarto, tiempo extra o set',
  },
];

// Presets predefinidos
export const PRESETS: Record<string, { name: string; description: string; map: KeyboardShortcutsMap }> = {
  standard: {
    name: 'Mesa de Control Oficial (QWE / UIO)',
    description: 'Distribución ergonómica estándar dividida para 2 manos (Local mano izquierda, Visitante mano derecha).',
    map: {
      timer_toggle: 'Space',
      timer_reset: 'KeyR',
      timer_add_min: 'Equal',
      timer_sub_min: 'Minus',
      timer_add_sec: 'BracketRight',
      timer_sub_sec: 'BracketLeft',
      score_local_add1: 'KeyQ',
      score_local_add2: 'KeyW',
      score_local_add3: 'KeyE',
      score_local_sub1: 'KeyA',
      foul_local_add: 'KeyF',
      timeout_local: 'KeyT',
      score_visitor_add1: 'KeyU',
      score_visitor_add2: 'KeyI',
      score_visitor_add3: 'KeyO',
      score_visitor_sub1: 'KeyJ',
      foul_visitor_add: 'KeyH',
      timeout_visitor: 'KeyY',
      shot_clock_24: 'Digit1',
      shot_clock_14: 'Digit2',
      shot_clock_toggle: 'Digit3',
      possession_arrow: 'KeyP',
      horn_trigger: 'KeyB',
      whistle_trigger: 'KeyS',
      goal_sound_trigger: 'KeyG',
      next_period: 'KeyN',
    }
  },
  numpad: {
    name: 'Teclado Numérico Pro (Numpad)',
    description: 'Optimizado para operar rápidamente el tanteador desde el teclado numérico derecho.',
    map: {
      timer_toggle: 'Space',
      timer_reset: 'NumpadDecimal',
      timer_add_min: 'NumpadAdd',
      timer_sub_min: 'NumpadSubtract',
      timer_add_sec: 'PageUp',
      timer_sub_sec: 'PageDown',
      score_local_add1: 'Numpad1',
      score_local_add2: 'Numpad2',
      score_local_add3: 'Numpad3',
      score_local_sub1: 'Numpad0',
      foul_local_add: 'KeyF',
      timeout_local: 'KeyT',
      score_visitor_add1: 'Numpad7',
      score_visitor_add2: 'Numpad8',
      score_visitor_add3: 'Numpad9',
      score_visitor_sub1: 'Numpad4',
      foul_visitor_add: 'KeyH',
      timeout_visitor: 'KeyY',
      shot_clock_24: 'Numpad5',
      shot_clock_14: 'Numpad6',
      shot_clock_toggle: 'NumpadDivide',
      possession_arrow: 'NumpadMultiply',
      horn_trigger: 'NumpadEnter',
      whistle_trigger: 'KeyS',
      goal_sound_trigger: 'KeyG',
      next_period: 'KeyN',
    }
  },
  function_keys: {
    name: 'Teclas de Función (F1 - F12)',
    description: 'Usa teclas de función superiores para evitar conflictos con mecanografía.',
    map: {
      timer_toggle: 'Space',
      timer_reset: 'F12',
      timer_add_min: 'ArrowUp',
      timer_sub_min: 'ArrowDown',
      timer_add_sec: 'ArrowRight',
      timer_sub_sec: 'ArrowLeft',
      score_local_add1: 'F1',
      score_local_add2: 'F2',
      score_local_add3: 'F3',
      score_local_sub1: 'F4',
      foul_local_add: 'KeyF',
      timeout_local: 'KeyT',
      score_visitor_add1: 'F5',
      score_visitor_add2: 'F6',
      score_visitor_add3: 'F7',
      score_visitor_sub1: 'F8',
      foul_visitor_add: 'KeyH',
      timeout_visitor: 'KeyY',
      shot_clock_24: 'F9',
      shot_clock_14: 'F10',
      shot_clock_toggle: 'F11',
      possession_arrow: 'KeyP',
      horn_trigger: 'KeyB',
      whistle_trigger: 'KeyS',
      goal_sound_trigger: 'KeyG',
      next_period: 'KeyN',
    }
  }
};

const STORAGE_KEY = 'scoreboard_keyboard_shortcuts_v1';
const STORAGE_ENABLED_KEY = 'scoreboard_keyboard_enabled_v1';

export function getStoredShortcuts(): KeyboardShortcutsMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...PRESETS.standard.map, ...parsed };
    }
  } catch (e) {
    console.error('Error reading stored keyboard shortcuts:', e);
  }
  return { ...PRESETS.standard.map };
}

export function saveStoredShortcuts(shortcuts: KeyboardShortcutsMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
  } catch (e) {
    console.error('Error saving keyboard shortcuts:', e);
  }
}

export function getStoredShortcutsEnabled(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_ENABLED_KEY);
    if (raw !== null) {
      return raw === 'true';
    }
  } catch (e) {
    console.error('Error reading shortcuts enabled status:', e);
  }
  return true; // Habilitado por defecto en PC
}

export function saveStoredShortcutsEnabled(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_ENABLED_KEY, String(enabled));
  } catch (e) {
    console.error('Error saving shortcuts enabled status:', e);
  }
}

// Convertir código de evento KeyboardEvent.code a etiqueta amigable
export function formatKeyCode(code: string): string {
  if (!code) return '---';
  if (code === 'Space') return 'ESPACIO';
  if (code.startsWith('Key')) return code.replace('Key', '');
  if (code.startsWith('Digit')) return code.replace('Digit', '');
  if (code.startsWith('Numpad')) return 'NUM ' + code.replace('Numpad', '');
  if (code === 'ArrowUp') return '↑';
  if (code === 'ArrowDown') return '↓';
  if (code === 'ArrowLeft') return '←';
  if (code === 'ArrowRight') return '→';
  if (code === 'Minus') return '-';
  if (code === 'Equal') return '+';
  if (code === 'BracketLeft') return '[';
  if (code === 'BracketRight') return ']';
  if (code === 'Semicolon') return ';';
  if (code === 'Quote') return "'";
  if (code === 'Comma') return ',';
  if (code === 'Period') return '.';
  if (code === 'Slash') return '/';
  if (code === 'Backslash') return '\\';
  if (code === 'Backquote') return '`';
  if (code === 'Enter') return 'ENTER';
  if (code === 'Escape') return 'ESC';
  if (code === 'Tab') return 'TAB';
  if (code === 'Backspace') return '⌫';
  return code;
}
