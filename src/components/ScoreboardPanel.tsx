import React, { useState } from 'react';
import { 
  ScoreboardState, SportType, CustomSoundItem, SoundEventOverrides, 
  SportSoundTemplates, SportSoundPad 
} from '../types';
import { sounds } from '../utils/audio';
import { hardware } from '../utils/hardwareManager';
import { DEFAULT_SPORT_TEMPLATES, BUILTIN_SOUNDS_CATALOG } from '../utils/sportSoundTemplates';
import { 
  Play, Pause, RotateCcw, Volume2, Plus, Minus, ArrowLeftRight, 
  Flame, Award, Music, Clock, Timer, Check, Edit2, Sparkles,
  ShieldAlert, AlertTriangle, UserCheck, RefreshCw, Flag, Keyboard,
  Upload, Mic, Settings2, Sliders, Square
} from 'lucide-react';

interface Props {
  state: ScoreboardState;
  updateState: (partial: Partial<ScoreboardState>) => void;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  onAdjustTimer: (seconds: number) => void;
  onChangeScore: (team: 'local' | 'visitor', delta: number) => void;
  onTriggerHorn: () => void;
  onStartShotClock: () => void;
  onPauseShotClock: () => void;
  onResetShotClock: (seconds: number) => void;
  onSetSport: (sport: SportType) => void;
  onOpenKeyConfig?: () => void;
  customSounds?: CustomSoundItem[];
  sportTemplates?: SportSoundTemplates;
  soundOverrides?: SoundEventOverrides;
  onOpenCustomSoundManager?: (sport?: SportType) => void;
}

export const ScoreboardPanel: React.FC<Props> = ({
  state,
  updateState,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onChangeScore,
  onTriggerHorn,
  onStartShotClock,
  onPauseShotClock,
  onResetShotClock,
  onSetSport,
  onOpenKeyConfig,
  customSounds = [],
  sportTemplates,
  soundOverrides,
  onOpenCustomSoundManager,
}) => {
  // Estado para edición manual directa de minutos y segundos
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editMinutes, setEditMinutes] = useState('10');
  const [editSeconds, setEditSeconds] = useState('00');
  const [playingCustomId, setPlayingCustomId] = useState<string | null>(null);

  // Pestaña activa del panel de sonidos
  const [activeSoundTab, setActiveSoundTab] = useState<'current' | 'custom' | 'soccer' | 'basketball' | 'futsal' | 'volleyball' | 'handball' | 'training'>('current');

  const currentMinutes = Math.floor(Math.max(0, state.timerSeconds) / 60);
  const currentSeconds = Math.max(0, state.timerSeconds) % 60;

  const handleOpenEditTime = () => {
    setEditMinutes(String(currentMinutes).padStart(2, '0'));
    setEditSeconds(String(currentSeconds).padStart(2, '0'));
    setIsEditingTime(true);
  };

  const handleApplyEditTime = () => {
    const mins = Math.max(0, Math.min(99, parseInt(editMinutes, 10) || 0));
    const secs = Math.max(0, Math.min(59, parseInt(editSeconds, 10) || 0));
    const total = mins * 60 + secs;
    updateState({ timerSeconds: total, targetSeconds: total });
    setIsEditingTime(false);
    
    // Sincronizar con Arduino
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const modeFlag = state.timerMode === 'down' ? 'D' : 'U';
    hardware.sendCommand(`T:${formatted}:${state.period}:${modeFlag}`);
  };

  // Ajustes directos de minutos y segundos
  const handleAddMinutes = (delta: number) => {
    const total = Math.max(0, state.timerSeconds + delta * 60);
    updateState({ timerSeconds: total });
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const modeFlag = state.timerMode === 'down' ? 'D' : 'U';
    hardware.sendCommand(`T:${formatted}:${state.period}:${modeFlag}`);
  };

  const handleAddSeconds = (delta: number) => {
    const total = Math.max(0, state.timerSeconds + delta);
    updateState({ timerSeconds: total });
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const modeFlag = state.timerMode === 'down' ? 'D' : 'U';
    hardware.sendCommand(`T:${formatted}:${state.period}:${modeFlag}`);
  };

  // Handlers para efectos de audio multideporte
  const handlePlaySound = (
    soundKey: string, 
    arduinoCmd: string, 
    audioAction: () => void
  ) => {
    if (state.soundEnabled) {
      audioAction();
    }
    hardware.sendCommand(arduinoCmd);
  };

  // Iniciar Time-Out Oficial Reglamentario (60s o 30s)
  const handleStartTimeOut = (team: 'local' | 'visitor', durationSecs = 60) => {
    if (state.soundEnabled) sounds.playTimeoutHorn();
    updateState({
      timeoutCountdown: durationSecs,
      timeoutRunning: true,
      timeoutTeam: team,
      ...(team === 'local' ? { timeoutsLocal: state.timeoutsLocal + 1 } : { timeoutsVisitor: state.timeoutsVisitor + 1 })
    });
    hardware.sendCommand(`CMD:TIMEOUT:${team.toUpperCase()}:${durationSecs}`);
  };

  const handleCancelTimeOut = () => {
    updateState({ timeoutCountdown: null, timeoutRunning: false, timeoutTeam: null });
  };

  // Agregar sanción de 2 minutos (Handball / Futsal)
  const handleAddTwoMinPenalty = (team: 'local' | 'visitor') => {
    if (state.soundEnabled) sounds.playTwoMinSuspension();
    if (team === 'local') {
      if (state.penaltyLocal1 === null) updateState({ penaltyLocal1: 120 });
      else if (state.penaltyLocal2 === null) updateState({ penaltyLocal2: 120 });
      else updateState({ penaltyLocal1: 120 });
    } else {
      if (state.penaltyVisitor1 === null) updateState({ penaltyVisitor1: 120 });
      else if (state.penaltyVisitor2 === null) updateState({ penaltyVisitor2: 120 });
      else updateState({ penaltyVisitor1: 120 });
    }
    hardware.sendCommand(`CMD:PENALTY_2MIN:${team.toUpperCase()}`);
  };

  // Deporte para mostrar en el panel de sonidos
  const effectiveSoundCategory = activeSoundTab === 'current' 
    ? (state.sport === 'custom' ? 'training' : state.sport)
    : activeSoundTab;

  // Comprobar si hay Bonus de faltas en básquetbol (>= 5 faltas colectivas)
  const isLocalInBonus = state.sport === 'basketball' && state.foulsLocal >= 5;
  const isVisitorInBonus = state.sport === 'basketball' && state.foulsVisitor >= 5;

  // Comprobar 6ª falta en Futsal (Doble penal tiro de 10m sin barrera)
  const isLocalFutsalDoblePenal = state.sport === 'futsal' && state.foulsLocal >= 6;
  const isVisitorFutsalDoblePenal = state.sport === 'futsal' && state.foulsVisitor >= 6;

  // Detección de Set Point en Vóley
  const isVoleySetPoint = state.sport === 'volleyball' && (
    (state.scoreLocal >= 24 && state.scoreLocal - state.scoreVisitor >= 1) ||
    (state.scoreVisitor >= 24 && state.scoreVisitor - state.scoreLocal >= 1)
  );

  return (
    <div className="space-y-4">
      {/* Selector de Deporte Rápido */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex items-center justify-between overflow-x-auto gap-2 text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-wider pl-2 flex items-center gap-1.5 whitespace-nowrap">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          Deporte Activo:
        </span>
        <div className="flex gap-1.5 flex-nowrap">
          <button
            onClick={() => onSetSport('soccer')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              state.sport === 'soccer'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚽ Fútbol 11 (45m / 30m)
          </button>
          <button
            onClick={() => onSetSport('basketball')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              state.sport === 'basketball'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            🏀 Básquetbol (10m + 24s)
          </button>
          <button
            onClick={() => onSetSport('futsal')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              state.sport === 'futsal'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            🥅 Futsal (20m)
          </button>
          <button
            onClick={() => onSetSport('volleyball')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              state.sport === 'volleyball'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            🏐 Vóley (Sets)
          </button>
          <button
            onClick={() => onSetSport('handball')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              state.sport === 'handball'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            🤾 Handball (30m)
          </button>
        </div>

        {onOpenKeyConfig && (
          <button
            onClick={onOpenKeyConfig}
            className="ml-auto bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-lg font-stadium font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap"
            title="Configuración de Macros de Teclado para PC"
          >
            <Keyboard className="w-3.5 h-3.5 text-amber-400" />
            <span>TECLADO PC</span>
          </button>
        )}
      </div>

      {/* MODAL DE TIME-OUT OFICIAL ACTIVO (60s REGLAMENTARIO) */}
      {state.timeoutCountdown !== null && (
        <div className="bg-amber-950/80 border-2 border-amber-500 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-digital text-3xl font-black flex items-center justify-center shadow-lg">
              {state.timeoutCountdown}
            </div>
            <div>
              <h3 className="text-sm font-stadium font-black text-amber-300 uppercase">
                ⏱️ TIEMPO MUERTO OFICIAL EN CURSO - EQUIPO {state.timeoutTeam?.toUpperCase()}
              </h3>
              <p className="text-xs text-amber-200">
                {state.timeoutCountdown > 10 ? 'Tiempo reglamentario de charla técnica (60s)' : '⚠️ ¡Últimos 10 segundos! Regreso a pista'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => sounds.playTimeoutWarning()}
              className="bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs px-3 py-2 rounded-lg"
            >
              Aviso 50s (Pitido)
            </button>
            <button
              onClick={handleCancelTimeOut}
              className="bg-red-600 hover:bg-red-500 text-white font-stadium font-bold text-xs px-4 py-2 rounded-lg shadow"
            >
              FINALIZAR TIME-OUT
            </button>
          </div>
        </div>
      )}

      {/* RELOJ DE TIEMPO DE JUEGO (MINUTOS Y SEGUNDOS) */}
      <section className="bg-slate-900/90 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        {/* Cabecera del Reloj */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-3 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-stadium font-black text-amber-300 flex items-center gap-2">
                RELOJ DE TIEMPO DE JUEGO (MINUTOS : SEGUNDOS)
                <span className={`text-[10px] font-mono-code px-2 py-0.5 rounded-full border ${
                  state.timerRunning 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {state.timerRunning ? '● EN JUEGO' : '⏸ PAUSADO'}
                </span>
                {state.addedTimeMinutes > 0 && (
                  <span className="text-[10px] font-mono-code bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                    +{state.addedTimeMinutes} MIN ADICIÓN
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400">Control de cronómetro del partido y sincronización con displays LED</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dirección del cronómetro */}
            <select
              value={state.timerMode}
              onChange={(e) => updateState({ timerMode: e.target.value as 'down' | 'up' })}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-amber-500 outline-none"
            >
              <option value="down">⏳ Regresiva (MM:SS a 00:00)</option>
              <option value="up">⏱️ Progresiva (00:00 a MM:SS)</option>
            </select>

            {/* Selector de Periodo */}
            <select
              value={state.period}
              onChange={(e) => updateState({ period: e.target.value })}
              className="bg-slate-950 border border-slate-700 text-amber-400 font-bold text-xs rounded-lg px-2.5 py-1.5 focus:border-amber-500 outline-none"
            >
              <option value="1">1° Cuarto / Periodo</option>
              <option value="2">2° Cuarto / Periodo</option>
              <option value="3">3° Cuarto / Periodo</option>
              <option value="4">4° Cuarto / Periodo</option>
              <option value="1T">1° Tiempo (Fútbol/Futsal/Handball)</option>
              <option value="2T">2° Tiempo (Fútbol/Futsal/Handball)</option>
              <option value="E">Tiempo Extra / Alargue (TE)</option>
              <option value="S1">Set 1</option>
              <option value="S2">Set 2</option>
              <option value="S3">Set 3</option>
              <option value="S4">Set 4</option>
              <option value="S5">Set 5 (Tie-break)</option>
            </select>
          </div>
        </div>

        {/* DISPLAY GIGANTE DE TIEMPO CON MINUTOS Y SEGUNDOS SEPARADOS */}
        <div className="bg-black/95 border-2 border-slate-800 rounded-2xl p-4 sm:p-6 my-3 shadow-inner flex flex-col items-center justify-center">
          
          {isEditingTime ? (
            /* Modo de Edición Directa de Minutos y Segundos */
            <div className="flex flex-col items-center gap-3 py-2 w-full max-w-sm">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-bold">
                Configurar Tiempo Manualmente:
              </span>
              <div className="flex items-center justify-center gap-3">
                {/* Minutos Input */}
                <div className="flex flex-col items-center">
                  <label className="text-[11px] font-bold text-slate-400 uppercase mb-1">Minutos</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={editMinutes}
                    onChange={(e) => setEditMinutes(e.target.value)}
                    className="w-24 text-center font-digital text-4xl sm:text-5xl font-bold bg-slate-900 border-2 border-amber-500 rounded-xl text-amber-400 p-2 outline-none"
                  />
                </div>

                <span className="font-digital text-4xl font-bold text-amber-500 mt-6">:</span>

                {/* Segundos Input */}
                <div className="flex flex-col items-center">
                  <label className="text-[11px] font-bold text-slate-400 uppercase mb-1">Segundos</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={editSeconds}
                    onChange={(e) => setEditSeconds(e.target.value)}
                    className="w-24 text-center font-digital text-4xl sm:text-5xl font-bold bg-slate-900 border-2 border-amber-500 rounded-xl text-amber-400 p-2 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={handleApplyEditTime}
                  className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-stadium font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Check className="w-4 h-4" />
                  <span>GUARDAR TIEMPO</span>
                </button>
                <button
                  onClick={() => setIsEditingTime(false)}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            /* Vista del Display Digital Principal */
            <div className="w-full flex flex-col items-center">
              <div className="flex items-center justify-center gap-2 sm:gap-4">
                
                {/* Bloque MINUTOS */}
                <div className="flex flex-col items-center">
                  <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl px-4 py-2 sm:px-6 sm:py-3 shadow-2xl">
                    <span className="font-digital text-6xl sm:text-8xl font-black text-amber-400 glow-amber tracking-widest">
                      {String(currentMinutes).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-mono font-black text-amber-400 uppercase tracking-widest mt-2 bg-amber-950/60 border border-amber-500/30 px-2.5 py-0.5 rounded-md">
                    MINUTOS
                  </span>
                </div>

                {/* Dos Puntos Separadores */}
                <div className="flex flex-col justify-center items-center pb-6">
                  <span className={`font-digital text-5xl sm:text-7xl font-black text-amber-500 ${
                    state.timerRunning ? 'animate-pulse' : ''
                  }`}>
                    :
                  </span>
                </div>

                {/* Bloque SEGUNDOS */}
                <div className="flex flex-col items-center">
                  <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl px-4 py-2 sm:px-6 sm:py-3 shadow-2xl">
                    <span className="font-digital text-6xl sm:text-8xl font-black text-amber-400 glow-amber tracking-widest">
                      {String(currentSeconds).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-mono font-black text-amber-400 uppercase tracking-widest mt-2 bg-amber-950/60 border border-amber-500/30 px-2.5 py-0.5 rounded-md">
                    SEGUNDOS
                  </span>
                </div>

              </div>

              {/* Botón para editar directamente minutos y segundos */}
              <button
                onClick={handleOpenEditTime}
                className="mt-3 text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Configurar minutos y segundos manualmente</span>
              </button>
            </div>
          )}

        </div>

        {/* CONTROLES PRINCIPALES: INICIAR, PAUSAR, REINICIAR */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 my-3">
          <button
            onClick={onStartTimer}
            disabled={state.timerRunning}
            className={`py-3.5 px-4 rounded-xl font-stadium font-bold text-base flex items-center justify-center space-x-2 shadow-lg transition active:scale-95 ${
              state.timerRunning
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>INICIAR</span>
          </button>

          <button
            onClick={onPauseTimer}
            disabled={!state.timerRunning}
            className={`py-3.5 px-4 rounded-xl font-stadium font-bold text-base flex items-center justify-center space-x-2 shadow-lg transition active:scale-95 ${
              !state.timerRunning
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            <Pause className="w-5 h-5 fill-current" />
            <span>PAUSAR</span>
          </button>

          <button
            onClick={onResetTimer}
            className="bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-stadium font-bold text-base py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition"
          >
            <RotateCcw className="w-5 h-5" />
            <span>REINICIAR</span>
          </button>
        </div>

        {/* AJUSTES FINOS DE MINUTOS Y SEGUNDOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
          
          {/* Ajuste de Minutos */}
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Minutos: <b className="text-amber-400 font-mono">{currentMinutes} min</b>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleAddMinutes(-5)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 px-2 py-1 rounded text-slate-300 font-bold"
              >
                -5m
              </button>
              <button
                onClick={() => handleAddMinutes(-1)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 px-2 py-1 rounded text-slate-300 font-bold"
              >
                -1m
              </button>
              <button
                onClick={() => handleAddMinutes(1)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 px-2 py-1 rounded text-amber-400 font-bold"
              >
                +1m
              </button>
              <button
                onClick={() => handleAddMinutes(5)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 px-2 py-1 rounded text-amber-400 font-bold"
              >
                +5m
              </button>
            </div>
          </div>

          {/* Ajuste de Segundos */}
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              Segundos: <b className="text-amber-400 font-mono">{currentSeconds} seg</b>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleAddSeconds(-10)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 px-2 py-1 rounded text-slate-300 font-bold"
              >
                -10s
              </button>
              <button
                onClick={() => handleAddSeconds(-1)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 px-2 py-1 rounded text-slate-300 font-bold"
              >
                -1s
              </button>
              <button
                onClick={() => handleAddSeconds(1)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 px-2 py-1 rounded text-amber-400 font-bold"
              >
                +1s
              </button>
              <button
                onClick={() => handleAddSeconds(10)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 px-2 py-1 rounded text-amber-400 font-bold"
              >
                +10s
              </button>
            </div>
          </div>

        </div>

        {/* Presets Rápidos de Tiempo por Deporte */}
        <div className="flex flex-wrap justify-between items-center gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-bold mr-1">Presets:</span>
            
            {/* Presets Fútbol */}
            <button
              onClick={() => {
                updateState({ targetSeconds: 2700, timerSeconds: 2700 });
                hardware.sendCommand(`T:45:00:${state.period}:${state.timerMode === 'down' ? 'D' : 'U'}`);
              }}
              className="bg-emerald-950 border border-emerald-500/40 hover:bg-emerald-900 active:scale-95 px-2.5 py-1 rounded text-emerald-300 font-mono-code font-bold"
            >
              ⚽ 45:00 (Fútbol Oficial)
            </button>
            
            <button
              onClick={() => {
                updateState({ targetSeconds: 1800, timerSeconds: 1800 });
                hardware.sendCommand(`T:30:00:${state.period}:${state.timerMode === 'down' ? 'D' : 'U'}`);
              }}
              className="bg-emerald-950 border border-emerald-500/40 hover:bg-emerald-900 active:scale-95 px-2.5 py-1 rounded text-emerald-300 font-mono-code font-bold"
            >
              ⚽ 30:00 (Fútbol Juvenil)
            </button>

            <button
              onClick={() => {
                updateState({ targetSeconds: 2100, timerSeconds: 2100 });
                hardware.sendCommand(`T:35:00:${state.period}:${state.timerMode === 'down' ? 'D' : 'U'}`);
              }}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 px-2.5 py-1 rounded text-slate-300 font-mono-code font-bold"
            >
              35:00
            </button>

            <button
              onClick={() => {
                updateState({ targetSeconds: 600, timerSeconds: 600 });
                hardware.sendCommand(`T:10:00:${state.period}:${state.timerMode === 'down' ? 'D' : 'U'}`);
              }}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 px-2.5 py-1 rounded text-slate-300 font-mono-code font-bold"
            >
              🏀 10:00 (Básquet)
            </button>

            <button
              onClick={() => {
                updateState({ targetSeconds: 1200, timerSeconds: 1200 });
                hardware.sendCommand(`T:20:00:${state.period}:${state.timerMode === 'down' ? 'D' : 'U'}`);
              }}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 px-2.5 py-1 rounded text-slate-300 font-mono-code font-bold"
            >
              🥅 20:00 (Futsal)
            </button>

            <button
              onClick={() => {
                updateState({ targetSeconds: 900, timerSeconds: 900 });
                hardware.sendCommand(`T:15:00:${state.period}:${state.timerMode === 'down' ? 'D' : 'U'}`);
              }}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 px-2.5 py-1 rounded text-slate-300 font-mono-code font-bold"
            >
              15:00 (Alargue)
            </button>
          </div>

          {/* Chicharra Manual Directa */}
          <button
            onClick={onTriggerHorn}
            className="bg-purple-600 hover:bg-purple-500 active:scale-90 text-white font-stadium font-black px-4 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-lg transition ml-auto"
          >
            <Volume2 className="w-4 h-4" />
            <span>CHICHARRA / SILBATO</span>
          </button>
        </div>
      </section>

      {/* CAJA DE EFECTOS DE SONIDO MULTIDEPORTE */}
      <section className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-amber-950/40 border border-purple-800/40 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-purple-900/40">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-stadium font-black text-purple-200 flex items-center gap-1.5">
                SONIDOS Y MÚSICA DE ESTADIO MULTIDEPORTE
                <span className="text-[10px] font-mono-code bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
                  WEB AUDIO + DFPLAYER MINI
                </span>
              </h2>
            </div>
          </div>

          {/* Pestañas de categoría de sonido */}
          <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold">
            <button
              onClick={() => setActiveSoundTab('current')}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap flex items-center gap-1 ${
                activeSoundTab === 'current'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Deporte Actual</span>
            </button>
            <button
              onClick={() => setActiveSoundTab('custom')}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap flex items-center gap-1 border ${
                activeSoundTab === 'custom'
                  ? 'bg-pink-600 text-white shadow border-pink-400/50'
                  : 'bg-slate-800 text-pink-400 border-pink-500/30 hover:bg-slate-700 hover:text-pink-300'
              }`}
            >
              <span>🎧 Mis Sonidos ({customSounds.length})</span>
            </button>
            <button
              onClick={() => setActiveSoundTab('soccer')}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                activeSoundTab === 'soccer'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚽ Fútbol
            </button>
            <button
              onClick={() => setActiveSoundTab('basketball')}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                activeSoundTab === 'basketball'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              🏀 Básquet
            </button>
            <button
              onClick={() => setActiveSoundTab('futsal')}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                activeSoundTab === 'futsal'
                  ? 'bg-teal-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              🥅 Futsal
            </button>
            <button
              onClick={() => setActiveSoundTab('volleyball')}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                activeSoundTab === 'volleyball'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              🏐 Vóley
            </button>
            <button
              onClick={() => setActiveSoundTab('handball')}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                activeSoundTab === 'handball'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              🤾 Handball
            </button>
            <button
              onClick={() => setActiveSoundTab('training')}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                activeSoundTab === 'training'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              ⏱️ Entrenamiento
            </button>

            {onOpenCustomSoundManager && (
              <button
                onClick={() => onOpenCustomSoundManager(activeSoundTab === 'current' ? state.sport : (activeSoundTab === 'custom' ? undefined : (activeSoundTab as SportType)))}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 border border-slate-700 whitespace-nowrap"
                title="Administrar, configurar botoneras y audios por deporte"
              >
                <Sliders className="w-3 h-3 text-purple-400" />
                <span className="hidden sm:inline">Administrar Sonidos</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB MIS SONIDOS PROPIOS */}
        {activeSoundTab === 'custom' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5 font-stadium">
                <Music className="w-3.5 h-3.5 text-pink-400" />
                Pads de Sonidos Personalizados y Voces del Gimnasio
              </span>
              {onOpenCustomSoundManager && (
                <button
                  onClick={() => onOpenCustomSoundManager()}
                  className="bg-pink-600 hover:bg-pink-500 text-white font-stadium font-bold text-xs px-3 py-1 rounded-lg flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ CARGAR / GRABAR SONIDO</span>
                </button>
              )}
            </div>

            {customSounds.length === 0 ? (
              <div className="text-center py-6 bg-slate-950/40 rounded-xl border border-slate-800 p-4 space-y-2">
                <p className="text-xs text-slate-400">No tienes sonidos personalizados cargados todavía.</p>
                {onOpenCustomSoundManager && (
                  <button
                    onClick={() => onOpenCustomSoundManager()}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-stadium font-bold text-xs px-4 py-2 rounded-xl shadow"
                  >
                    Abrir Administrador de Sonidos
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {customSounds.map((sound) => {
                  const isPlaying = playingCustomId === sound.id;
                  const padColor = sound.color || '#ec4899';
                  return (
                    <button
                      key={sound.id}
                      onClick={() => {
                        if (isPlaying) {
                          sounds.stopCustomSound(sound.id);
                          setPlayingCustomId(null);
                        } else {
                          sounds.stopAllSounds();
                          setPlayingCustomId(sound.id);
                          sounds.playCustomSound(
                            sound.id, 
                            sound.audioData, 
                            sound.volume || 1.0, 
                            sound.loop || false,
                            () => setPlayingCustomId((curr) => curr === sound.id ? null : curr)
                          );
                          if (sound.arduinoCmd) {
                            hardware.sendCommand(sound.arduinoCmd);
                          } else {
                            hardware.sendCommand(`CMD:SND:CUSTOM:${sound.name.substring(0, 8).toUpperCase()}`);
                          }
                        }
                      }}
                      className={`font-stadium font-bold text-xs p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 shadow-lg transition border text-white active:scale-95 relative ${
                        isPlaying
                          ? 'border-white ring-2 ring-white/50 animate-pulse bg-rose-600'
                          : 'hover:opacity-90 border-slate-700'
                      }`}
                      style={{
                        backgroundColor: isPlaying ? '#e11d48' : padColor,
                      }}
                      title={`Reproducir ${sound.name} (${sound.duration || 'Audio'}s)`}
                    >
                      <span className="text-lg">{isPlaying ? '⏹️' : (sound.icon || '🎵')}</span>
                      <span className="truncate max-w-full text-center">{sound.name}</span>
                      {sound.duration && (
                        <span className="text-[9px] opacity-75 font-mono-code">{sound.duration}s</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB DE BOTONERAS CONFIGURABLES POR DEPORTE */}
        {activeSoundTab !== 'custom' && (() => {
          const targetSport: SportType = activeSoundTab === 'current' 
            ? (state.sport === 'custom' ? 'training' : state.sport)
            : (activeSoundTab as SportType);
          
          const template = sportTemplates?.[targetSport] || DEFAULT_SPORT_TEMPLATES[targetSport] || DEFAULT_SPORT_TEMPLATES.basketball;

          return (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5 font-stadium">
                    <span>{template.icon}</span>
                    <span>Botonera de {template.displayName}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono-code bg-slate-800/80 px-2 py-0.5 rounded">
                    {template.pads.length} pads configurados
                  </span>
                </div>
                {onOpenCustomSoundManager && (
                  <button
                    onClick={() => onOpenCustomSoundManager(targetSport)}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-stadium font-bold text-xs px-3 py-1 rounded-lg flex items-center gap-1.5 shadow transition"
                    title={`Editar y personalizar los sonidos de ${template.displayName}`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>⚙️ Configurar Botonera de {template.displayName}</span>
                  </button>
                )}
              </div>

              {template.pads.length === 0 ? (
                <div className="text-center py-6 bg-slate-950/40 rounded-xl border border-slate-800 p-4 space-y-2">
                  <p className="text-xs text-slate-400">No hay pads configurados para este deporte.</p>
                  {onOpenCustomSoundManager && (
                    <button
                      onClick={() => onOpenCustomSoundManager(targetSport)}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-stadium font-bold text-xs px-4 py-2 rounded-xl shadow"
                    >
                      Configurar Sonidos de {template.displayName}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {template.pads.map((pad) => {
                    const isPlaying = playingCustomId === pad.id;
                    const padBg = pad.color || '#4f46e5';
                    
                    return (
                      <button
                        key={pad.id}
                        onClick={() => {
                          if (isPlaying) {
                            sounds.stopAllSounds();
                            setPlayingCustomId(null);
                            return;
                          }

                          sounds.stopAllSounds();
                          setPlayingCustomId(pad.id);

                          if (pad.soundType === 'builtin' && pad.builtinKey) {
                            const item = BUILTIN_SOUNDS_CATALOG.find((b) => b.key === pad.builtinKey);
                            if (item) {
                              item.play(sounds);
                            } else {
                              sounds.playHorn(1200);
                            }
                            setTimeout(() => setPlayingCustomId((curr) => curr === pad.id ? null : curr), 1200);
                          } else if (pad.soundType === 'custom' && pad.customSoundId) {
                            const custom = customSounds.find((c) => c.id === pad.customSoundId);
                            if (custom) {
                              sounds.playCustomSound(
                                custom.id,
                                custom.audioData,
                                pad.volume ?? custom.volume ?? 1.0,
                                false,
                                () => setPlayingCustomId((curr) => curr === pad.id ? null : curr)
                              );
                            } else {
                              sounds.playHorn(800);
                              setPlayingCustomId(null);
                            }
                          }

                          if (pad.arduinoCmd) {
                            hardware.sendCommand(pad.arduinoCmd);
                          }
                        }}
                        className={`font-stadium font-bold text-xs p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 shadow-lg transition border text-white active:scale-95 relative ${
                          isPlaying
                            ? 'border-white ring-2 ring-white/60 animate-pulse'
                            : 'hover:opacity-90 border-slate-700/60'
                        }`}
                        style={{
                          backgroundColor: isPlaying ? '#e11d48' : padBg,
                        }}
                        title={`Reproducir ${pad.name} ${pad.arduinoCmd ? `(${pad.arduinoCmd})` : ''}`}
                      >
                        <span className="text-lg">{isPlaying ? '⏹️' : (pad.icon || '🎵')}</span>
                        <span className="truncate max-w-full text-center">{pad.name}</span>
                        {pad.soundType === 'custom' && (
                          <span className="text-[9px] bg-black/30 px-1 rounded font-mono-code text-pink-200">
                            Audio Propio
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </section>

      {/* RELOJ DE POSESIÓN (SHOT CLOCK 24s / 14s) CON ALERTA DE ÚLTIMOS 5s */}
      {state.sport === 'basketball' && (
        <section className={`bg-slate-900/90 rounded-2xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3 transition-all ${
          state.shotClockRunning && state.shotClockSeconds <= 5 && state.shotClockSeconds > 0
            ? 'border-2 border-red-500 bg-red-950/20 shadow-red-900/40 animate-pulse'
            : 'border border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner transition ${
              state.shotClockRunning && state.shotClockSeconds <= 5 && state.shotClockSeconds > 0
                ? 'bg-red-600/30 border-2 border-red-500 ring-2 ring-red-500/50 animate-bounce'
                : 'bg-red-950/80 border-2 border-red-500/80'
            }`}>
              <span className={`font-digital text-3xl font-black ${
                state.shotClockSeconds <= 5 ? 'text-white glow-red' : 'text-red-500 glow-red'
              }`}>
                {state.shotClockSeconds}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-red-500" /> Reloj de Posesión (24s / 14s Básquetbol)
                </span>
                {state.shotClockRunning && state.shotClockSeconds <= 5 && state.shotClockSeconds > 0 && (
                  <span className="text-[10px] font-mono-code font-bold bg-red-600 text-white px-2 py-0.5 rounded-full animate-ping">
                    ¡ÚLTIMOS {state.shotClockSeconds}s!
                  </span>
                )}
                <button
                  onClick={() => updateState({ autoResetShotClockOnScore: !state.autoResetShotClockOnScore })}
                  className={`text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full border transition flex items-center gap-1 ${
                    state.autoResetShotClockOnScore
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-300'
                  }`}
                  title="Al anotar punto (+1, +2, +3), corta automáticamente el reloj de posesión, resetea a 24s y alterna la posesión al rival"
                >
                  <span>⚡ Auto-Reset Canasta:</span>
                  <b>{state.autoResetShotClockOnScore ? 'ACTIVO (24s)' : 'MANUAL'}</b>
                </button>
              </div>
              <span className="text-[11px] text-slate-400">
                {state.shotClockRunning 
                  ? (state.shotClockSeconds <= 5 ? '⚠️ Zona de tiro inminente (Beep activo)' : 'Contando posesión...') 
                  : (state.autoResetShotClockOnScore ? 'Pausado (Se cortará y reseteará a 24s al anotar punto)' : 'Pausado / En espera')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Flecha de Posesión Alternada FIBA */}
            <button
              onClick={() => updateState({ possessionArrow: state.possessionArrow === 'local' ? 'visitor' : 'local' })}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition border ${
                state.possessionArrow === 'local'
                  ? 'bg-blue-950 border-blue-500 text-blue-300'
                  : 'bg-red-950 border-red-500 text-red-300'
              }`}
              title="Flecha de Posesión Alternada FIBA (Salto entre dos)"
            >
              <span>Flecha Salto:</span>
              <b>{state.possessionArrow === 'local' ? '⬅ LOCAL' : 'VISITANTE ➡'}</b>
            </button>

            <button
              onClick={() => onResetShotClock(24)}
              className="bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs px-3 py-2 rounded-lg transition shadow"
              title="Resetear a 24 segundos"
            >
              Reset 24s
            </button>
            <button
              onClick={() => onResetShotClock(14)}
              className="bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs px-3 py-2 rounded-lg transition shadow"
              title="Resetear a 14 segundos (Rebote ofensivo / Falta en pista delantera)"
            >
              Reset 14s
            </button>
            {state.shotClockRunning ? (
              <button
                onClick={onPauseShotClock}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs px-3 py-2 rounded-lg transition"
              >
                Pausa
              </button>
            ) : (
              <button
                onClick={onStartShotClock}
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs px-3 py-2 rounded-lg transition"
              >
                Iniciar
              </button>
            )}
          </div>
        </section>
      )}

      {/* PANEL DE EXCLUSIONES TEMPORIZADAS DE 2 MINUTOS (HANDBALL Y FUTSAL) */}
      {(state.sport === 'handball' || state.sport === 'futsal') && (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Sanciones de 2 Minutos (Inferioridad Numérica):
            </span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Local Penalties */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-400">LOCAL:</span>
              <button
                onClick={() => handleAddTwoMinPenalty('local')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-2.5 py-1 rounded"
              >
                +2 Min
              </button>
              {state.penaltyLocal1 !== null && (
                <span className="font-digital text-sm bg-blue-950 border border-blue-500 text-blue-300 px-2 py-0.5 rounded animate-pulse">
                  {Math.floor(state.penaltyLocal1 / 60)}:{String(state.penaltyLocal1 % 60).padStart(2, '0')}
                </span>
              )}
              {state.penaltyLocal2 !== null && (
                <span className="font-digital text-sm bg-blue-950 border border-blue-500 text-blue-300 px-2 py-0.5 rounded animate-pulse">
                  {Math.floor(state.penaltyLocal2 / 60)}:{String(state.penaltyLocal2 % 60).padStart(2, '0')}
                </span>
              )}
            </div>

            {/* Visitor Penalties */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-red-400">VISITANTE:</span>
              <button
                onClick={() => handleAddTwoMinPenalty('visitor')}
                className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-2.5 py-1 rounded"
              >
                +2 Min
              </button>
              {state.penaltyVisitor1 !== null && (
                <span className="font-digital text-sm bg-red-950 border border-red-500 text-red-300 px-2 py-0.5 rounded animate-pulse">
                  {Math.floor(state.penaltyVisitor1 / 60)}:{String(state.penaltyVisitor1 % 60).padStart(2, '0')}
                </span>
              )}
              {state.penaltyVisitor2 !== null && (
                <span className="font-digital text-sm bg-red-950 border border-red-500 text-red-300 px-2 py-0.5 rounded animate-pulse">
                  {Math.floor(state.penaltyVisitor2 / 60)}:{String(state.penaltyVisitor2 % 60).padStart(2, '0')}
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* PANELES DE EQUIPO: LOCAL Y VISITANTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* EQUIPO LOCAL */}
        <div className={`bg-slate-900/90 rounded-2xl p-4 shadow-xl flex flex-col justify-between transition-all ${
          isLocalInBonus || isLocalFutsalDoblePenal
            ? 'border-2 border-rose-500 shadow-rose-950/50'
            : 'border-2 border-blue-500/40'
        }`}>
          <div>
            {/* Header del Equipo Local */}
            <div className="flex justify-between items-center mb-2">
              <input
                type="text"
                value={state.localName}
                onChange={(e) => updateState({ localName: e.target.value.toUpperCase() })}
                placeholder="LOCAL"
                className="bg-transparent border-b border-blue-500/50 text-blue-400 font-stadium font-black text-xl uppercase outline-none focus:border-blue-400 w-2/3"
              />
              <div className="flex items-center gap-1.5">
                {isLocalInBonus && (
                  <span className="text-[10px] font-mono-code font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                    BONUS
                  </span>
                )}
                {isLocalFutsalDoblePenal && (
                  <span className="text-[10px] font-mono-code font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full animate-bounce">
                    10 METROS
                  </span>
                )}
                <button
                  onClick={() => updateState({ possession: state.possession === 'local' ? 'none' : 'local' })}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                    state.possession === 'local'
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>POSESIÓN</span>
                </button>
              </div>
            </div>

            {/* Sets Ganados en Voleibol */}
            {state.sport === 'volleyball' && (
              <div className="bg-blue-950/60 border border-blue-500/30 rounded-lg p-2 mb-2 flex items-center justify-between text-xs">
                <span className="font-bold text-blue-300">SETS GANADOS: <b className="font-digital text-base text-white">{state.setsLocal}</b></span>
                <div className="flex gap-1">
                  <button
                    onClick={() => updateState({ setsLocal: Math.max(0, state.setsLocal - 1) })}
                    className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-slate-300 font-bold"
                  >
                    -
                  </button>
                  <button
                    onClick={() => updateState({ setsLocal: state.setsLocal + 1 })}
                    className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Display Puntuación */}
            <div className="bg-black/90 border border-blue-500/30 rounded-xl py-3 my-2 text-center shadow-inner relative">
              {isVoleySetPoint && state.scoreLocal > state.scoreVisitor && (
                <span className="absolute top-2 right-2 text-[10px] font-mono-code bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-bold animate-bounce">
                  SET POINT
                </span>
              )}
              <span className="font-digital text-6xl sm:text-7xl font-black text-blue-500 glow-blue">
                {String(state.scoreLocal).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Botones de Puntos */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            <button
              onClick={() => {
                onChangeScore('local', 1);
                if (state.sport === 'soccer' || state.sport === 'futsal') sounds.playGoalHorn();
                else if (state.sport === 'volleyball') sounds.playSpikeAce();
                else if (state.sport === 'handball') sounds.playHandballGoal();
              }}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-stadium font-bold py-2.5 rounded-xl text-lg shadow"
            >
              +1
            </button>
            <button
              onClick={() => onChangeScore('local', 2)}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-stadium font-bold py-2.5 rounded-xl text-lg shadow"
            >
              +2
            </button>
            <button
              onClick={() => {
                onChangeScore('local', 3);
                sounds.playTripleBasket();
              }}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-stadium font-bold py-2.5 rounded-xl text-lg shadow flex items-center justify-center gap-1"
            >
              <span>+3</span>
              <span className="text-xs">🔥</span>
            </button>
            <button
              onClick={() => onChangeScore('local', -1)}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-stadium font-bold py-2.5 rounded-xl text-lg shadow"
            >
              -1
            </button>
          </div>

          {/* Estadísticas Específicas por Deporte (Fútbol, Básquet, Vóley) */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
            {/* Faltas */}
            <div className="bg-slate-950 p-2 rounded-lg flex items-center justify-between">
              <span className="text-slate-400 font-bold">Faltas: <b className="text-blue-400">{state.foulsLocal}</b></span>
              <div className="flex gap-1">
                <button
                  onClick={() => updateState({ foulsLocal: Math.max(0, state.foulsLocal - 1) })}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    const next = state.foulsLocal + 1;
                    updateState({ foulsLocal: next });
                    if (state.sport === 'futsal' && next >= 6) sounds.playDoblePenal();
                  }}
                  className="w-6 h-6 rounded bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Time-Outs Reglamentarios */}
            <div className="bg-slate-950 p-2 rounded-lg flex items-center justify-between">
              <span className="text-slate-400 font-bold">T. Muerto: <b className="text-blue-400">{state.timeoutsLocal}</b></span>
              <button
                onClick={() => handleStartTimeOut('local', 60)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-2 py-1 rounded"
              >
                Pedir 60s
              </button>
            </div>

            {/* Tarjetas en Fútbol / Futsal */}
            {(state.sport === 'soccer' || state.sport === 'futsal' || state.sport === 'handball') && (
              <>
                <div className="bg-slate-950 p-2 rounded-lg flex items-center justify-between col-span-2">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-bold flex items-center gap-1">
                      🟨 <b className="text-amber-400">{state.yellowCardsLocal}</b>
                    </span>
                    <span className="text-slate-400 font-bold flex items-center gap-1">
                      🟥 <b className="text-red-400">{state.redCardsLocal}</b>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        updateState({ yellowCardsLocal: state.yellowCardsLocal + 1 });
                        sounds.playCardAlarm();
                      }}
                      className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-1 rounded"
                    >
                      + Amarilla
                    </button>
                    <button
                      onClick={() => {
                        updateState({ redCardsLocal: state.redCardsLocal + 1 });
                        sounds.playCardAlarm();
                      }}
                      className="bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] px-2 py-1 rounded"
                    >
                      + Roja
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* EQUIPO VISITANTE */}
        <div className={`bg-slate-900/90 rounded-2xl p-4 shadow-xl flex flex-col justify-between transition-all ${
          isVisitorInBonus || isVisitorFutsalDoblePenal
            ? 'border-2 border-rose-500 shadow-rose-950/50'
            : 'border-2 border-red-500/40'
        }`}>
          <div>
            {/* Header del Equipo Visitante */}
            <div className="flex justify-between items-center mb-2">
              <input
                type="text"
                value={state.visitorName}
                onChange={(e) => updateState({ visitorName: e.target.value.toUpperCase() })}
                placeholder="VISITANTE"
                className="bg-transparent border-b border-red-500/50 text-red-400 font-stadium font-black text-xl uppercase outline-none focus:border-red-400 w-2/3"
              />
              <div className="flex items-center gap-1.5">
                {isVisitorInBonus && (
                  <span className="text-[10px] font-mono-code font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                    BONUS
                  </span>
                )}
                {isVisitorFutsalDoblePenal && (
                  <span className="text-[10px] font-mono-code font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full animate-bounce">
                    10 METROS
                  </span>
                )}
                <button
                  onClick={() => updateState({ possession: state.possession === 'visitor' ? 'none' : 'visitor' })}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                    state.possession === 'visitor'
                      ? 'bg-red-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>POSESIÓN</span>
                </button>
              </div>
            </div>

            {/* Sets Ganados en Voleibol */}
            {state.sport === 'volleyball' && (
              <div className="bg-red-950/60 border border-red-500/30 rounded-lg p-2 mb-2 flex items-center justify-between text-xs">
                <span className="font-bold text-red-300">SETS GANADOS: <b className="font-digital text-base text-white">{state.setsVisitor}</b></span>
                <div className="flex gap-1">
                  <button
                    onClick={() => updateState({ setsVisitor: Math.max(0, state.setsVisitor - 1) })}
                    className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-slate-300 font-bold"
                  >
                    -
                  </button>
                  <button
                    onClick={() => updateState({ setsVisitor: state.setsVisitor + 1 })}
                    className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Display Puntuación */}
            <div className="bg-black/90 border border-red-500/30 rounded-xl py-3 my-2 text-center shadow-inner relative">
              {isVoleySetPoint && state.scoreVisitor > state.scoreLocal && (
                <span className="absolute top-2 right-2 text-[10px] font-mono-code bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-bold animate-bounce">
                  SET POINT
                </span>
              )}
              <span className="font-digital text-6xl sm:text-7xl font-black text-red-500 glow-red">
                {String(state.scoreVisitor).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Botones de Puntos */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            <button
              onClick={() => {
                onChangeScore('visitor', 1);
                if (state.sport === 'soccer' || state.sport === 'futsal') sounds.playGoalHorn();
                else if (state.sport === 'volleyball') sounds.playSpikeAce();
                else if (state.sport === 'handball') sounds.playHandballGoal();
              }}
              className="bg-red-600 hover:bg-red-500 active:scale-95 text-white font-stadium font-bold py-2.5 rounded-xl text-lg shadow"
            >
              +1
            </button>
            <button
              onClick={() => onChangeScore('visitor', 2)}
              className="bg-red-600 hover:bg-red-500 active:scale-95 text-white font-stadium font-bold py-2.5 rounded-xl text-lg shadow"
            >
              +2
            </button>
            <button
              onClick={() => {
                onChangeScore('visitor', 3);
                sounds.playTripleBasket();
              }}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-stadium font-bold py-2.5 rounded-xl text-lg shadow flex items-center justify-center gap-1"
            >
              <span>+3</span>
              <span className="text-xs">🔥</span>
            </button>
            <button
              onClick={() => onChangeScore('visitor', -1)}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-stadium font-bold py-2.5 rounded-xl text-lg shadow"
            >
              -1
            </button>
          </div>

          {/* Estadísticas Específicas por Deporte */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
            {/* Faltas */}
            <div className="bg-slate-950 p-2 rounded-lg flex items-center justify-between">
              <span className="text-slate-400 font-bold">Faltas: <b className="text-red-400">{state.foulsVisitor}</b></span>
              <div className="flex gap-1">
                <button
                  onClick={() => updateState({ foulsVisitor: Math.max(0, state.foulsVisitor - 1) })}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    const next = state.foulsVisitor + 1;
                    updateState({ foulsVisitor: next });
                    if (state.sport === 'futsal' && next >= 6) sounds.playDoblePenal();
                  }}
                  className="w-6 h-6 rounded bg-red-600 hover:bg-red-500 flex items-center justify-center text-white"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Time-Outs Reglamentarios */}
            <div className="bg-slate-950 p-2 rounded-lg flex items-center justify-between">
              <span className="text-slate-400 font-bold">T. Muerto: <b className="text-red-400">{state.timeoutsVisitor}</b></span>
              <button
                onClick={() => handleStartTimeOut('visitor', 60)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] px-2 py-1 rounded"
              >
                Pedir 60s
              </button>
            </div>

            {/* Tarjetas en Fútbol / Futsal */}
            {(state.sport === 'soccer' || state.sport === 'futsal' || state.sport === 'handball') && (
              <>
                <div className="bg-slate-950 p-2 rounded-lg flex items-center justify-between col-span-2">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-bold flex items-center gap-1">
                      🟨 <b className="text-amber-400">{state.yellowCardsVisitor}</b>
                    </span>
                    <span className="text-slate-400 font-bold flex items-center gap-1">
                      🟥 <b className="text-red-400">{state.redCardsVisitor}</b>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        updateState({ yellowCardsVisitor: state.yellowCardsVisitor + 1 });
                        sounds.playCardAlarm();
                      }}
                      className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-1 rounded"
                    >
                      + Amarilla
                    </button>
                    <button
                      onClick={() => {
                        updateState({ redCardsVisitor: state.redCardsVisitor + 1 });
                        sounds.playCardAlarm();
                      }}
                      className="bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] px-2 py-1 rounded"
                    >
                      + Roja
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
