import { ScoreboardLedLighting, LedComponentConfig, LedColorEffect, LedComponentId, LedPreset } from '../types';

export interface ColorSwatch {
  id: string;
  name: string;
  hex: string;
  glowHex: string;
  category: 'primary' | 'neon' | 'warm' | 'cool' | 'mono';
}

export const LED_COLOR_SWATCHES: ColorSwatch[] = [
  { id: 'cyan', name: 'Azul Cyan Eléctrico', hex: '#00d2ff', glowHex: '#38bdf8', category: 'neon' },
  { id: 'blue', name: 'Azul Cobalto Real', hex: '#2563eb', glowHex: '#60a5fa', category: 'cool' },
  { id: 'ice', name: 'Azul Glaciar / Hielo', hex: '#38bdf8', glowHex: '#7dd3fc', category: 'cool' },
  { id: 'green_lime', name: 'Verde Lima Neón', hex: '#22c55e', glowHex: '#4ade80', category: 'neon' },
  { id: 'emerald', name: 'Verde Esmeralda', hex: '#10b981', glowHex: '#34d399', category: 'primary' },
  { id: 'yellow_gold', name: 'Amarillo Oro Puro', hex: '#ffea00', glowHex: '#fef08a', category: 'warm' },
  { id: 'amber', name: 'Ámbar Cálido Estadio', hex: '#fbbf24', glowHex: '#fde68a', category: 'warm' },
  { id: 'orange', name: 'Naranja Fuego', hex: '#f97316', glowHex: '#fb923c', category: 'warm' },
  { id: 'red', name: 'Rojo Carmesí Fuego', hex: '#ff3344', glowHex: '#f87171', category: 'primary' },
  { id: 'ruby', name: 'Rojo Rubí Intenso', hex: '#e11d48', glowHex: '#fb7185', category: 'primary' },
  { id: 'magenta', name: 'Rosa Magenta Neón', hex: '#ec4899', glowHex: '#f472b6', category: 'neon' },
  { id: 'purple', name: 'Violeta Eléctrico', hex: '#a855f7', glowHex: '#c084fc', category: 'neon' },
  { id: 'indigo', name: 'Índigo Profundo', hex: '#6366f1', glowHex: '#818cf8', category: 'cool' },
  { id: 'white', name: 'Blanco Puro Cristal', hex: '#ffffff', glowHex: '#f8fafc', category: 'mono' },
  { id: 'warm_white', name: 'Blanco Cálido', hex: '#fef3c7', glowHex: '#fef9c3', category: 'mono' },
  { id: 'gold', name: 'Oro Campeonato 24K', hex: '#ffd700', glowHex: '#fde047', category: 'warm' },
];

export const LED_EFFECT_DESCRIPTIONS: Record<LedColorEffect, { name: string; desc: string; icon: string }> = {
  solid: {
    name: 'Color Sólido Estático',
    desc: 'Luz LED fija y nítida de alta intensidad.',
    icon: '⏹️',
  },
  rainbow: {
    name: 'Onda Arcoíris (Rainbow Wave)',
    desc: 'Espectro multicolor fluido que se desplaza horizontalmente.',
    icon: '🌈',
  },
  pulse: {
    name: 'Pulso / Respiración (Breathe)',
    desc: 'Modulación suave y rítmica del brillo y la saturación.',
    icon: '💓',
  },
  color_cycle: {
    name: 'Ciclo Cromático Rotativo',
    desc: 'Transición continua entre los tonos de la paleta.',
    icon: '🔄',
  },
  neon: {
    name: 'Neón Vibrante (Shimmer)',
    desc: 'Micro-oscilación eléctrica que simula tubos de gas neón.',
    icon: '⚡',
  },
  fire: {
    name: 'Efecto Llama / Fuego',
    desc: 'Fluctuación cálida en tonos rojizos, dorados y ámbar.',
    icon: '🔥',
  },
  strobe: {
    name: 'Estroboscópico / Alerta',
    desc: 'Destellos rítmicos intermitentes de alta visibilidad.',
    icon: '🚨',
  },
  dual_gradient: {
    name: 'Gradiente Bicolor Desplazable',
    desc: 'Fusión suave entre dos colores seleccionados.',
    icon: '✨',
  },
};

export const LED_COMPONENT_LABELS: Record<LedComponentId, { name: string; section: string; defaultColor: string }> = {
  scoreLocal: {
    name: 'Tanteador Local',
    section: 'Marcador Deportivo (Renglón 1)',
    defaultColor: '#00d2ff',
  },
  scoreVisitor: {
    name: 'Tanteador Visitante',
    section: 'Marcador Deportivo (Renglón 1)',
    defaultColor: '#ff3344',
  },
  period: {
    name: 'Texto Central / Periodo',
    section: 'Marcador Deportivo (Renglón 1)',
    defaultColor: '#fbbf24',
  },
  timer: {
    name: 'Cronómetro Principal (HH:MM:SS)',
    section: 'Reloj de Juego (Renglón 2)',
    defaultColor: '#ffea00',
  },
  possession: {
    name: 'Indicadores de Posesión de Balón',
    section: 'Acentos Deportivos (Bordes)',
    defaultColor: '#00d2ff',
  },
  banner: {
    name: 'Cartel de Mensajes',
    section: 'Modo Cartel / Marquesina',
    defaultColor: '#fbbf24',
  },
  clock: {
    name: 'Reloj Horario RTC',
    section: 'Modo Reloj Horario (DS3231)',
    defaultColor: '#00d2ff',
  },
  border: {
    name: 'Acentos y Marcos de Retícula',
    section: 'Estructura Visual',
    defaultColor: '#38bdf8',
  },
};

export const DEFAULT_LED_LIGHTING: ScoreboardLedLighting = {
  scoreLocal: {
    color: '#00d2ff',
    secondaryColor: '#2563eb',
    effect: 'solid',
    speed: 3,
    brightness: 100,
  },
  scoreVisitor: {
    color: '#ff3344',
    secondaryColor: '#ec4899',
    effect: 'solid',
    speed: 3,
    brightness: 100,
  },
  period: {
    color: '#fbbf24',
    secondaryColor: '#ffffff',
    effect: 'solid',
    speed: 3,
    brightness: 100,
  },
  timer: {
    color: '#ffea00',
    secondaryColor: '#f97316',
    effect: 'solid',
    speed: 3,
    brightness: 100,
  },
  possession: {
    color: '#00d2ff',
    secondaryColor: '#ff3344',
    effect: 'solid',
    speed: 3,
    brightness: 100,
  },
  banner: {
    color: '#fbbf24',
    secondaryColor: '#00d2ff',
    effect: 'solid',
    speed: 3,
    brightness: 100,
  },
  clock: {
    color: '#00d2ff',
    secondaryColor: '#a855f7',
    effect: 'solid',
    speed: 3,
    brightness: 100,
  },
  border: {
    color: '#38bdf8',
    secondaryColor: '#2563eb',
    effect: 'solid',
    speed: 3,
    brightness: 100,
  },
  activePreset: 'classic_stadium',
};

export const LED_PRESETS: LedPreset[] = [
  {
    id: 'classic_stadium',
    name: 'Clásico Estadio Profesional',
    description: 'Estilo reglamentario con máxima legibilidad: Local Cyan, Visitante Rojo, Periodo Ámbar y Timer Oro.',
    icon: '🏟️',
    lighting: {
      ...DEFAULT_LED_LIGHTING,
      activePreset: 'classic_stadium',
    },
  },
  {
    id: 'cyberpunk_neon',
    name: 'Cyberpunk Neón & Glow',
    description: 'Local Magenta con pulso respiración, Visitante Verde Lima Neón, Periodo en Onda Arcoíris y Timer Cyan.',
    icon: '🌆',
    lighting: {
      scoreLocal: { color: '#ec4899', secondaryColor: '#a855f7', effect: 'pulse', speed: 3, brightness: 100 },
      scoreVisitor: { color: '#22c55e', secondaryColor: '#00d2ff', effect: 'pulse', speed: 3, brightness: 100 },
      period: { color: '#00d2ff', secondaryColor: '#ec4899', effect: 'rainbow', speed: 3, brightness: 100 },
      timer: { color: '#00d2ff', secondaryColor: '#a855f7', effect: 'neon', speed: 4, brightness: 100 },
      possession: { color: '#ec4899', secondaryColor: '#22c55e', effect: 'pulse', speed: 4, brightness: 100 },
      banner: { color: '#ec4899', secondaryColor: '#00d2ff', effect: 'dual_gradient', speed: 3, brightness: 100 },
      clock: { color: '#a855f7', secondaryColor: '#00d2ff', effect: 'rainbow', speed: 2, brightness: 100 },
      border: { color: '#a855f7', secondaryColor: '#ec4899', effect: 'dual_gradient', speed: 2, brightness: 100 },
      activePreset: 'cyberpunk_neon',
    },
  },
  {
    id: 'championship_gold',
    name: 'Oro de Campeonato 24K',
    description: 'Tonos dorados y ámbar con respiración triunfal y cronómetro en blanco cristal reluciente.',
    icon: '🏆',
    lighting: {
      scoreLocal: { color: '#ffd700', secondaryColor: '#f59e0b', effect: 'pulse', speed: 2, brightness: 100 },
      scoreVisitor: { color: '#ffea00', secondaryColor: '#f97316', effect: 'pulse', speed: 2, brightness: 100 },
      period: { color: '#ffd700', secondaryColor: '#ffffff', effect: 'dual_gradient', speed: 2, brightness: 100 },
      timer: { color: '#ffffff', secondaryColor: '#ffd700', effect: 'neon', speed: 3, brightness: 100 },
      possession: { color: '#ffd700', secondaryColor: '#ffffff', effect: 'pulse', speed: 3, brightness: 100 },
      banner: { color: '#ffd700', secondaryColor: '#f59e0b', effect: 'pulse', speed: 2, brightness: 100 },
      clock: { color: '#ffd700', secondaryColor: '#ffffff', effect: 'pulse', speed: 2, brightness: 100 },
      border: { color: '#ffd700', secondaryColor: '#f59e0b', effect: 'dual_gradient', speed: 2, brightness: 100 },
      activePreset: 'championship_gold',
    },
  },
  {
    id: 'rgb_gaming_wave',
    name: 'RGB Gamer Onda Multicolor',
    description: 'Onda continua espectral sincronizada a través de todos los números y textos del cartel.',
    icon: '🌈',
    lighting: {
      scoreLocal: { color: '#00d2ff', secondaryColor: '#ec4899', effect: 'rainbow', speed: 3, brightness: 100 },
      scoreVisitor: { color: '#ff3344', secondaryColor: '#22c55e', effect: 'rainbow', speed: 3, brightness: 100 },
      period: { color: '#fbbf24', secondaryColor: '#00d2ff', effect: 'rainbow', speed: 3, brightness: 100 },
      timer: { color: '#ffea00', secondaryColor: '#a855f7', effect: 'rainbow', speed: 4, brightness: 100 },
      possession: { color: '#00d2ff', secondaryColor: '#ff3344', effect: 'rainbow', speed: 4, brightness: 100 },
      banner: { color: '#ec4899', secondaryColor: '#00d2ff', effect: 'rainbow', speed: 3, brightness: 100 },
      clock: { color: '#00d2ff', secondaryColor: '#22c55e', effect: 'rainbow', speed: 3, brightness: 100 },
      border: { color: '#a855f7', secondaryColor: '#00d2ff', effect: 'rainbow', speed: 3, brightness: 100 },
      activePreset: 'rgb_gaming_wave',
    },
  },
  {
    id: 'fire_and_ice',
    name: 'Fuego & Hielo (Rivalidad Épica)',
    description: 'Local en Azul Glaciar con pulso gélido vs Visitante en Rojo Fuego con fluctuación de llama.',
    icon: '❄️🔥',
    lighting: {
      scoreLocal: { color: '#38bdf8', secondaryColor: '#2563eb', effect: 'pulse', speed: 3, brightness: 100 },
      scoreVisitor: { color: '#ff3344', secondaryColor: '#f97316', effect: 'fire', speed: 4, brightness: 100 },
      period: { color: '#ffffff', secondaryColor: '#38bdf8', effect: 'dual_gradient', speed: 2, brightness: 100 },
      timer: { color: '#ffea00', secondaryColor: '#f97316', effect: 'fire', speed: 3, brightness: 100 },
      possession: { color: '#38bdf8', secondaryColor: '#ff3344', effect: 'pulse', speed: 3, brightness: 100 },
      banner: { color: '#38bdf8', secondaryColor: '#ff3344', effect: 'dual_gradient', speed: 3, brightness: 100 },
      clock: { color: '#38bdf8', secondaryColor: '#ff3344', effect: 'dual_gradient', speed: 2, brightness: 100 },
      border: { color: '#38bdf8', secondaryColor: '#ff3344', effect: 'dual_gradient', speed: 2, brightness: 100 },
      activePreset: 'fire_and_ice',
    },
  },
  {
    id: 'high_contrast',
    name: 'Alto Contraste Cancha Exterior',
    description: 'Colores puros al 100% de saturación y blanco cristal para máxima penetración con sol directo.',
    icon: '☀️',
    lighting: {
      scoreLocal: { color: '#ffffff', secondaryColor: '#00d2ff', effect: 'solid', speed: 3, brightness: 100 },
      scoreVisitor: { color: '#ffffff', secondaryColor: '#ff3344', effect: 'solid', speed: 3, brightness: 100 },
      period: { color: '#ffea00', secondaryColor: '#ffffff', effect: 'solid', speed: 3, brightness: 100 },
      timer: { color: '#ffffff', secondaryColor: '#ffea00', effect: 'solid', speed: 3, brightness: 100 },
      possession: { color: '#ffffff', secondaryColor: '#ff3344', effect: 'solid', speed: 3, brightness: 100 },
      banner: { color: '#ffffff', secondaryColor: '#ffea00', effect: 'solid', speed: 3, brightness: 100 },
      clock: { color: '#ffffff', secondaryColor: '#00d2ff', effect: 'solid', speed: 3, brightness: 100 },
      border: { color: '#ffffff', secondaryColor: '#38bdf8', effect: 'solid', speed: 3, brightness: 100 },
      activePreset: 'high_contrast',
    },
  },
  {
    id: 'retro_arcade_80s',
    name: 'Retro Arcade 80s',
    description: 'Verde fósforo, Amarillo arcade y Violeta eléctrico inspirados en consolas clásicas.',
    icon: '🕹️',
    lighting: {
      scoreLocal: { color: '#22c55e', secondaryColor: '#10b981', effect: 'neon', speed: 3, brightness: 100 },
      scoreVisitor: { color: '#a855f7', secondaryColor: '#ec4899', effect: 'neon', speed: 3, brightness: 100 },
      period: { color: '#ffea00', secondaryColor: '#22c55e', effect: 'color_cycle', speed: 2, brightness: 100 },
      timer: { color: '#00d2ff', secondaryColor: '#ffea00', effect: 'color_cycle', speed: 3, brightness: 100 },
      possession: { color: '#22c55e', secondaryColor: '#a855f7', effect: 'strobe', speed: 2, brightness: 100 },
      banner: { color: '#ffea00', secondaryColor: '#22c55e', effect: 'dual_gradient', speed: 3, brightness: 100 },
      clock: { color: '#22c55e', secondaryColor: '#a855f7', effect: 'color_cycle', speed: 2, brightness: 100 },
      border: { color: '#a855f7', secondaryColor: '#22c55e', effect: 'dual_gradient', speed: 3, brightness: 100 },
      activePreset: 'retro_arcade_80s',
    },
  },
];

// Helper: Convierte HEX a RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) {
    return { r: 255, g: 255, b: 255 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Helper: Convierte RGB a HEX
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const hexR = clamp(r).toString(16).padStart(2, '0');
  const hexG = clamp(g).toString(16).padStart(2, '0');
  const hexB = clamp(b).toString(16).padStart(2, '0');
  return `#${hexR}${hexG}${hexB}`;
}

// Helper: Convierte HSV a RGB
export function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.max(0, Math.min(1, s));
  const val = Math.max(0, Math.min(1, v));

  const c = val * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = val - c;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (hue < 60) {
    rPrime = c; gPrime = x; bPrime = 0;
  } else if (hue < 120) {
    rPrime = x; gPrime = c; bPrime = 0;
  } else if (hue < 180) {
    rPrime = 0; gPrime = c; bPrime = x;
  } else if (hue < 240) {
    rPrime = 0; gPrime = x; bPrime = c;
  } else if (hue < 300) {
    rPrime = x; gPrime = 0; bPrime = c;
  } else {
    rPrime = c; gPrime = 0; bPrime = x;
  }

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255),
  };
}

// Helper: Mezcla lineal entre dos colores
export function blendColors(color1Hex: string, color2Hex: string, factor: number): string {
  const f = Math.max(0, Math.min(1, factor));
  const c1 = hexToRgb(color1Hex);
  const c2 = hexToRgb(color2Hex);
  return rgbToHex(
    c1.r + (c2.r - c1.r) * f,
    c1.g + (c2.g - c1.g) * f,
    c1.b + (c2.b - c1.b) * f
  );
}

// Multiplicador de velocidad para animación fluida (nivel 1 a 5)
const SPEED_FACTORS: Record<number, number> = {
  1: 0.4,
  2: 0.7,
  3: 1.0,
  4: 1.6,
  5: 2.4,
};

/**
 * Calcula el color exacto de un píxel LED en tiempo real según el efecto activo,
 * coordenadas espaciales en la matriz y el tiempo transcurrido.
 */
export function computeLedPixelColor(
  config: LedComponentConfig,
  timeMs: number,
  row: number,
  col: number,
  overrideColor?: string
): string {
  const baseColor = overrideColor || config.color || '#00d2ff';
  const secColor = config.secondaryColor || '#ffffff';
  const speed = SPEED_FACTORS[config.speed] || 1.0;
  const brightness = (config.brightness ?? 100) / 100;

  switch (config.effect) {
    case 'solid': {
      if (brightness < 1.0) {
        const rgb = hexToRgb(baseColor);
        return rgbToHex(rgb.r * brightness, rgb.g * brightness, rgb.b * brightness);
      }
      return baseColor;
    }

    case 'rainbow': {
      // Onda arcoíris continua que fluye horizontal y diagonalmente
      const hue = (timeMs * 0.12 * speed + col * 7.5 + row * 4) % 360;
      const rgb = hsvToRgb(hue, 0.95, brightness);
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    case 'pulse': {
      // Pulso suave senoidal (respiración) entre 35% y 100% de brillo
      const phase = (timeMs * 0.003 * speed);
      const intensity = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(phase));
      const rgb = hexToRgb(baseColor);
      return rgbToHex(rgb.r * intensity * brightness, rgb.g * intensity * brightness, rgb.b * intensity * brightness);
    }

    case 'color_cycle': {
      // Ciclo rotativo a través de la rueda de colores manteniendo el matiz
      const hue = (timeMs * 0.08 * speed) % 360;
      const rgb = hsvToRgb(hue, 0.9, brightness);
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    case 'neon': {
      // Efecto neón con sutiles fluctuaciones eléctricas y micro-destellos
      const t = timeMs * 0.005 * speed;
      const noise = (Math.sin(t * 3.7 + col * 0.5) + Math.sin(t * 1.9 + row * 0.8)) * 0.08;
      const flicker = (Math.random() < 0.015 ? -0.2 : 0); // micro-destello ocasional
      const factor = Math.max(0.65, Math.min(1.0, 0.92 + noise + flicker)) * brightness;
      const rgb = hexToRgb(baseColor);
      return rgbToHex(rgb.r * factor, rgb.g * factor, rgb.b * factor);
    }

    case 'fire': {
      // Efecto fuego / llama dinámico con gradiente cálido en base a fila y columna
      const t = timeMs * 0.006 * speed;
      const wave = Math.sin(t * 2 + col * 0.7) * 0.5 + Math.cos(t * 3 + row * 1.2) * 0.5;
      const fireHue = Math.max(0, Math.min(48, 10 + (16 - row) * 1.8 + wave * 8)); // 0 = rojo, 45 = amarillo
      const rgb = hsvToRgb(fireHue, 1.0, brightness * (0.75 + 0.25 * Math.random()));
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    case 'strobe': {
      // Flash estroboscópico de alerta (50% duty cycle)
      const isFlash = Math.sin(timeMs * 0.015 * speed) > 0;
      if (!isFlash) {
        const rgb = hexToRgb(baseColor);
        return rgbToHex(rgb.r * 0.15, rgb.g * 0.15, rgb.b * 0.15);
      }
      const rgb = hexToRgb(baseColor);
      return rgbToHex(rgb.r * brightness, rgb.g * brightness, rgb.b * brightness);
    }

    case 'dual_gradient': {
      // Gradiente bicolor desplazable entre color primario y secundario
      const phase = (timeMs * 0.002 * speed + col * 0.08 + row * 0.04);
      const factor = (0.5 + 0.5 * Math.sin(phase));
      const blended = blendColors(baseColor, secColor, factor);
      if (brightness < 1.0) {
        const rgb = hexToRgb(blended);
        return rgbToHex(rgb.r * brightness, rgb.g * brightness, rgb.b * brightness);
      }
      return blended;
    }

    default:
      return baseColor;
  }
}

// ---------------------------------------------------------------------------
// Persistencia en LocalStorage
// ---------------------------------------------------------------------------

const STORAGE_KEY_LED_LIGHTING = 'scoreboard_led_lighting_v1';

export function getStoredLedLighting(): ScoreboardLedLighting {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LED_LIGHTING);
    if (!raw) return { ...DEFAULT_LED_LIGHTING };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_LED_LIGHTING,
      ...parsed,
      scoreLocal: { ...DEFAULT_LED_LIGHTING.scoreLocal, ...(parsed.scoreLocal || {}) },
      scoreVisitor: { ...DEFAULT_LED_LIGHTING.scoreVisitor, ...(parsed.scoreVisitor || {}) },
      period: { ...DEFAULT_LED_LIGHTING.period, ...(parsed.period || {}) },
      timer: { ...DEFAULT_LED_LIGHTING.timer, ...(parsed.timer || {}) },
      possession: { ...DEFAULT_LED_LIGHTING.possession, ...(parsed.possession || {}) },
      banner: { ...DEFAULT_LED_LIGHTING.banner, ...(parsed.banner || {}) },
      clock: { ...DEFAULT_LED_LIGHTING.clock, ...(parsed.clock || {}) },
      border: { ...DEFAULT_LED_LIGHTING.border, ...(parsed.border || {}) },
    };
  } catch {
    return { ...DEFAULT_LED_LIGHTING };
  }
}

export function saveStoredLedLighting(lighting: ScoreboardLedLighting): void {
  try {
    localStorage.setItem(STORAGE_KEY_LED_LIGHTING, JSON.stringify(lighting));
  } catch (err) {
    console.error('Error guardando configuración de iluminación LED:', err);
  }
}

/**
 * Genera el comando de protocolo serie para sincronizar un componente LED con Arduino
 * Formato: "LED:<COMP_ID>:<HEX_COLOR>:<EFFECT>:<SPEED>:<BRIGHTNESS>"
 * Ejemplo: "LED:SL:#00D2FF:RAINBOW:3:100"
 */
export function buildArduinoLedCommand(componentId: LedComponentId, config: LedComponentConfig): string {
  const compShortMap: Record<LedComponentId, string> = {
    scoreLocal: 'SL',
    scoreVisitor: 'SV',
    period: 'PER',
    timer: 'TIM',
    possession: 'POS',
    banner: 'BAN',
    clock: 'CLK',
    border: 'BOR',
  };
  const shortComp = compShortMap[componentId] || componentId;
  const hex = (config.color || '#00d2ff').replace('#', '').toUpperCase();
  const eff = config.effect.toUpperCase();
  const spd = config.speed || 3;
  const bri = config.brightness || 100;
  return `LED:${shortComp}:${hex}:${eff}:${spd}:${bri}`;
}
