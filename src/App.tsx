import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ScoreboardState, AppMode, SportType, LogEntry, ConnectionType, 
  KeyboardShortcutsMap, ShortcutActionId, ClockColor, CustomSoundItem, SoundEventOverrides 
} from './types';
import { hardware } from './utils/hardwareManager';
import { sounds } from './utils/audio';
import { 
  getStoredShortcuts, 
  getStoredShortcutsEnabled, 
  saveStoredShortcuts, 
  saveStoredShortcutsEnabled 
} from './utils/keyboardManager';
import { 
  getStoredCustomSounds, 
  saveStoredCustomSounds, 
  getStoredSoundOverrides, 
  saveStoredSoundOverrides 
} from './utils/customSoundManager';
import { VirtualLedSignPreview } from './components/VirtualLedSignPreview';
import { ScoreboardPanel } from './components/ScoreboardPanel';
import { ClockPanel } from './components/ClockPanel';
import { MessageBannerPanel } from './components/MessageBannerPanel';
import { CodeVerificationAudit } from './components/CodeVerificationAudit';
import { ArduinoSketchModal } from './components/ArduinoSketchModal';
import { ProtocolTerminal } from './components/ProtocolTerminal';
import { ConnectionModal } from './components/ConnectionModal';
import { KeyboardConfigModal } from './components/KeyboardConfigModal';
import { KeyboardHudOverlay } from './components/KeyboardHudOverlay';
import { UserManualPanel } from './components/UserManualPanel';
import { AppDownloadPanel } from './components/AppDownloadPanel';
import { CustomSoundManagerModal } from './components/CustomSoundManagerModal';
import { 
  Trophy, Clock, MessageSquare, ShieldCheck, Cpu, Volume2, VolumeX, 
  Wifi, Bluetooth, Usb, Radio, Sparkles, Keyboard, BookOpen, Download,
  Laptop, Smartphone, Music, Sliders
} from 'lucide-react';

export default function App() {
  const [state, setState] = useState<ScoreboardState>({
    appMode: 'scoreboard',
    sport: 'basketball',
    timerSeconds: 600, // 10 minutos
    targetSeconds: 600,
    timerRunning: false,
    timerMode: 'down',
    period: '1',
    timerTenths: 0,
    enableTenthsLastMinute: true,
    shotClockSeconds: 24,
    shotClockRunning: false,
    shotClockVisible: true,
    syncShotClockWithMain: true,
    autoResetShotClockOnScore: true,
    localName: 'LOCAL',
    visitorName: 'VISITANTE',
    scoreLocal: 0,
    scoreVisitor: 0,
    foulsLocal: 0,
    foulsVisitor: 0,
    timeoutsLocal: 0,
    timeoutsVisitor: 0,
    possession: 'none',
    possessionArrow: 'local',
    setsLocal: 0,
    setsVisitor: 0,
    subsLocal: 0,
    subsVisitor: 0,
    service: 'local',
    yellowCardsLocal: 0,
    yellowCardsVisitor: 0,
    redCardsLocal: 0,
    redCardsVisitor: 0,
    addedTimeMinutes: 0,
    penaltyLocal1: null,
    penaltyLocal2: null,
    penaltyVisitor1: null,
    penaltyVisitor2: null,
    blueCardsLocal: 0,
    blueCardsVisitor: 0,
    timeoutCountdown: null,
    timeoutRunning: false,
    timeoutTeam: null,
    marqueeText: 'BIENVENIDOS AL GIMNASIO',
    brightness: 80,
    bannerAnimation: 'scroll',
    autoSyncRtc: true,
    clockColor: 'cyan',
    connectionType: 'simulation',
    connectionLabel: 'Simulador Arduino Activo',
    baudRate: 9600,
    wifiIp: '192.168.1.50',
    soundEnabled: true,
  });

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: 'Panel de Control iniciado. Simulador de Hardware Arduino y protocolo serie cargados.',
    }
  ]);

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isKeyConfigModalOpen, setIsKeyConfigModalOpen] = useState(false);
  const [isCustomSoundModalOpen, setIsCustomSoundModalOpen] = useState(false);
  
  // Sonidos Propios y Mapeo de Eventos
  const [customSounds, setCustomSounds] = useState<CustomSoundItem[]>(getStoredCustomSounds());
  const [soundOverrides, setSoundOverrides] = useState<SoundEventOverrides>(getStoredSoundOverrides());

  const [shortcuts, setShortcuts] = useState<KeyboardShortcutsMap>(getStoredShortcuts());
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = useState<boolean>(getStoredShortcutsEnabled());
  const [lastTriggeredAction, setLastTriggeredAction] = useState<string | null>(null);
  const lastActionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [rtcTime, setRtcTime] = useState<{ hours: string; minutes: string; seconds: string; date: string }>({
    hours: '00',
    minutes: '00',
    seconds: '00',
    date: '--/--/----'
  });

  // Guardar Sonidos Propios
  const handleSaveCustomSounds = (updated: CustomSoundItem[]) => {
    setCustomSounds(updated);
    saveStoredCustomSounds(updated);
  };

  // Guardar Mapeo de Eventos
  const handleSaveSoundOverrides = (updated: SoundEventOverrides) => {
    setSoundOverrides(updated);
    saveStoredSoundOverrides(updated);
  };

  // Helper para disparar sonido de evento (propio si está mapeado o predeterminado)
  const triggerEventSound = (
    eventId: keyof SoundEventOverrides,
    defaultSoundFn: () => void,
    arduinoFallbackCmd?: string
  ) => {
    if (!state.soundEnabled) return;
    const overrideId = soundOverrides[eventId];
    if (overrideId && overrideId !== 'default') {
      const custom = customSounds.find((s) => s.id === overrideId);
      if (custom) {
        sounds.playCustomSound(custom.id, custom.audioData, custom.volume || 1.0, custom.loop || false);
        if (custom.arduinoCmd) {
          hardware.sendCommand(custom.arduinoCmd);
        } else if (arduinoFallbackCmd) {
          hardware.sendCommand(arduinoFallbackCmd);
        }
        return;
      }
    }
    defaultSoundFn();
    if (arduinoFallbackCmd) hardware.sendCommand(arduinoFallbackCmd);
  };

  // Helper para añadir logs
  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs((prev) => [...prev.slice(-150), newLog]);
  }, []);

  // Configurar callbacks de hardware
  useEffect(() => {
    hardware.setCallbacks(
      (entry) => addLog(entry),
      (type, label) => {
        setState((prev) => ({ ...prev, connectionType: type, connectionLabel: label }));
      },
      (rxData) => {
        // Parsear eventos provenientes de Arduino
        if (rxData.includes('EVT:TIEMPO_CERO')) {
          if (state.soundEnabled) sounds.playHorn(2000);
        }
      }
    );
  }, [addLog, state.soundEnabled]);

  // Actualizar reloj RTC en tiempo real (Buenos Aires UTC-3)
  const getBuenosAiresTime = useCallback(() => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    const p: Record<string, string> = {};
    parts.forEach(part => {
      if (part.type !== 'literal') p[part.type] = part.value;
    });

    let hourStr = p.hour || '00';
    if (hourStr === '24') hourStr = '00';

    return {
      hours: hourStr.padStart(2, '0'),
      minutes: (p.minute || '00').padStart(2, '0'),
      seconds: (p.second || '00').padStart(2, '0'),
      date: `${p.day || '01'}/${p.month || '01'}/${p.year || '2026'}`
    };
  }, []);

  // Reloj de pared Tick cada 1s
  useEffect(() => {
    const interval = setInterval(() => {
      const time = getBuenosAiresTime();
      setRtcTime(time);

      // Auto sincronizar con el RTC de Arduino al segundo :00 si está activo
      if (state.appMode === 'clock' && state.autoSyncRtc && time.seconds === '00') {
        syncRealTimeClock();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [getBuenosAiresTime, state.appMode, state.autoSyncRtc]);

  // Formato mm:ss o ss.d si queda menos de 1 minuto
  const formatTimer = (totalSeconds: number, tenths = 0, showTenths = false) => {
    if (showTenths && totalSeconds < 60) {
      const secs = Math.max(0, totalSeconds);
      return `${String(secs).padStart(2, '0')}.${tenths}`;
    }
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Enviar estado de cronómetro a Arduino
  const sendTimerStateToArduino = useCallback((secs: number, per: string, mode: 'down' | 'up', tenths = 0) => {
    const formatted = formatTimer(secs, tenths, false);
    const modeFlag = mode === 'down' ? 'D' : 'U';
    hardware.sendCommand(`T:${formatted}:${per}:${modeFlag}`);
  }, []);

  // Bucle de temporizador principal + Exclusiones de 2 minutos
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (state.timerRunning) {
      interval = setInterval(() => {
        setState((prev) => {
          // Descontar sanciones de 2 minutos (Handball / Futsal)
          const updatePenalty = (pen: number | null) => {
            if (pen === null) return null;
            if (pen <= 1) {
              if (prev.soundEnabled) sounds.playBeep(880, 200);
              return null;
            }
            return pen - 1;
          };

          const pL1 = updatePenalty(prev.penaltyLocal1);
          const pL2 = updatePenalty(prev.penaltyLocal2);
          const pV1 = updatePenalty(prev.penaltyVisitor1);
          const pV2 = updatePenalty(prev.penaltyVisitor2);

          if (prev.timerMode === 'down') {
            if (prev.timerSeconds > 1) {
              const newSecs = prev.timerSeconds - 1;
              if (newSecs % 5 === 0 || newSecs <= 10) {
                sendTimerStateToArduino(newSecs, prev.period, prev.timerMode);
              }
              return { 
                ...prev, 
                timerSeconds: newSecs,
                penaltyLocal1: pL1,
                penaltyLocal2: pL2,
                penaltyVisitor1: pV1,
                penaltyVisitor2: pV2,
              };
            } else {
              // Fin de tiempo reglamentario
              if (prev.soundEnabled) {
                if (prev.sport === 'soccer') {
                  sounds.playSoccerMatchWhistle();
                } else {
                  sounds.playHorn(2000);
                }
              }
              hardware.sendCommand('CMD:HORN');
              hardware.sendCommand('CMD:PAUSE');
              sendTimerStateToArduino(0, prev.period, prev.timerMode);
              return { 
                ...prev, 
                timerSeconds: 0, 
                timerRunning: false,
                shotClockRunning: false,
                penaltyLocal1: pL1,
                penaltyLocal2: pL2,
                penaltyVisitor1: pV1,
                penaltyVisitor2: pV2,
              };
            }
          } else {
            // Progresivo (Fútbol o Vóley)
            const newSecs = prev.timerSeconds + 1;
            if (newSecs % 5 === 0) {
              sendTimerStateToArduino(newSecs, prev.period, prev.timerMode);
            }
            if (prev.targetSeconds > 0 && newSecs >= prev.targetSeconds) {
              if (prev.soundEnabled) {
                if (prev.sport === 'soccer') {
                  sounds.playSoccerMatchWhistle();
                } else {
                  sounds.playHorn(2000);
                }
              }
              hardware.sendCommand('CMD:HORN');
              hardware.sendCommand('CMD:PAUSE');
              return { 
                ...prev, 
                timerSeconds: newSecs, 
                timerRunning: false,
                penaltyLocal1: pL1,
                penaltyLocal2: pL2,
                penaltyVisitor1: pV1,
                penaltyVisitor2: pV2,
              };
            }
            return { 
              ...prev, 
              timerSeconds: newSecs,
              penaltyLocal1: pL1,
              penaltyLocal2: pL2,
              penaltyVisitor1: pV1,
              penaltyVisitor2: pV2,
            };
          }
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.timerRunning, sendTimerStateToArduino]);

  // Bucle del Reloj de Posesión (24s Shot Clock)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (state.shotClockRunning) {
      interval = setInterval(() => {
        setState((prev) => {
          if (prev.shotClockSeconds > 1) {
            const nextSecs = prev.shotClockSeconds - 1;
            // Sonido reglamentario de alerta en los últimos 5 segundos de posesión (5s, 4s, 3s, 2s, 1s)
            if (nextSecs <= 5) {
              if (prev.soundEnabled) {
                sounds.playShotClockWarning(nextSecs);
              }
              hardware.sendCommand(`CMD:SND:SHOT_WARN:${nextSecs}`);
            }
            return { ...prev, shotClockSeconds: nextSecs };
          } else {
            // Fin de posesión / Violación de 24s o 14s (Bocina de tablero)
            if (prev.soundEnabled) {
              sounds.playShotClockViolation();
            }
            hardware.sendCommand('CMD:SHOT_CLOCK_EXPIRED');
            hardware.sendCommand('CMD:SND:SHOT_EXPIRED');
            return { ...prev, shotClockSeconds: 0, shotClockRunning: false };
          }
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.shotClockRunning]);

  // Bucle de Time-Out Oficial (60 segundos reglamentario)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (state.timeoutRunning && state.timeoutCountdown !== null) {
      interval = setInterval(() => {
        setState((prev) => {
          if (prev.timeoutCountdown === null) return prev;
          if (prev.timeoutCountdown > 1) {
            const next = prev.timeoutCountdown - 1;
            // Aviso reglamentario a los 50s (quedan 10s para volver a la pista)
            if (next === 10 && prev.soundEnabled) {
              sounds.playTimeoutWarning();
            }
            return { ...prev, timeoutCountdown: next };
          } else {
            // Fin del tiempo muerto
            if (prev.soundEnabled) sounds.playHorn(1200);
            return { ...prev, timeoutCountdown: 0, timeoutRunning: false };
          }
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.timeoutRunning]);

  // Handlers de Control
  const handleStartTimer = () => {
    if (state.soundEnabled) sounds.playClick();
    setState((prev) => ({ 
      ...prev, 
      timerRunning: true,
      shotClockRunning: prev.sport === 'basketball' && prev.syncShotClockWithMain ? true : prev.shotClockRunning 
    }));
    hardware.sendCommand('CMD:START');
    sendTimerStateToArduino(state.timerSeconds, state.period, state.timerMode);
  };

  const handlePauseTimer = () => {
    if (state.soundEnabled) sounds.playClick();
    setState((prev) => ({ 
      ...prev, 
      timerRunning: false,
      shotClockRunning: prev.sport === 'basketball' && prev.syncShotClockWithMain ? false : prev.shotClockRunning
    }));
    hardware.sendCommand('CMD:PAUSE');
    sendTimerStateToArduino(state.timerSeconds, state.period, state.timerMode);
  };

  const handleResetTimer = () => {
    if (state.soundEnabled) sounds.playClick();
    const target = state.timerMode === 'down' ? state.targetSeconds : 0;
    setState((prev) => ({ ...prev, timerRunning: false, timerSeconds: target }));
    hardware.sendCommand('CMD:RESET');
    sendTimerStateToArduino(target, state.period, state.timerMode);
  };

  const handleAdjustTimer = (seconds: number) => {
    if (state.soundEnabled) sounds.playClick();
    setState((prev) => {
      const newSecs = Math.max(0, prev.timerSeconds + seconds);
      const newTarget = Math.max(0, prev.targetSeconds + seconds);
      sendTimerStateToArduino(newSecs, prev.period, prev.timerMode);
      return { ...prev, timerSeconds: newSecs, targetSeconds: newTarget };
    });
  };

  const handleChangeScore = (team: 'local' | 'visitor', delta: number) => {
    if (state.soundEnabled) sounds.playClick();
    setState((prev) => {
      let nextShotClockSeconds = prev.shotClockSeconds;
      let nextShotClockRunning = prev.shotClockRunning;
      let nextPossession = prev.possession;

      // REGLAMENTO OFICIAL DE BÁSQUETBOL (FIBA / NBA):
      // Al convertir una canasta (+1, +2, +3 puntos), la posesión ofensiva finaliza de inmediato.
      // Si está activo 'autoResetShotClockOnScore':
      // 1. Se corta y pausa el reloj de posesión (shot clock)
      // 2. Se resetea a 24 segundos
      // 3. Se alterna la posesión al equipo rival para la reposición de fondo
      // 4. Se envían los comandos de sincronización a los displays de 24s en Arduino
      if (prev.sport === 'basketball' && delta > 0 && prev.autoResetShotClockOnScore) {
        nextShotClockSeconds = 24;
        nextShotClockRunning = false;
        nextPossession = team === 'local' ? 'visitor' : 'local';
        
        hardware.sendCommand('CMD:SHOT_CLOCK_RESET:24');
        hardware.sendCommand('CMD:SHOT_CLOCK_PAUSE');

        if (prev.soundEnabled) {
          if (delta === 3) {
            sounds.playTripleBasket();
          } else {
            sounds.playBasketScore();
          }
        }
      }

      if (team === 'local') {
        const val = Math.max(0, Math.min(99, prev.scoreLocal + delta));
        hardware.sendCommand(`L:${val}`);
        if (delta > 0) {
          triggerEventSound('onScoreLocal', () => {
            if (prev.sport === 'soccer' || prev.sport === 'futsal') sounds.playGoalHorn();
          });
        }
        return { 
          ...prev, 
          scoreLocal: val,
          shotClockSeconds: nextShotClockSeconds,
          shotClockRunning: nextShotClockRunning,
          possession: nextPossession
        };
      } else {
        const val = Math.max(0, Math.min(99, prev.scoreVisitor + delta));
        hardware.sendCommand(`V:${val}`);
        if (delta > 0) {
          triggerEventSound('onScoreVisitor', () => {
            if (prev.sport === 'soccer' || prev.sport === 'futsal') sounds.playWhistle();
          });
        }
        return { 
          ...prev, 
          scoreVisitor: val,
          shotClockSeconds: nextShotClockSeconds,
          shotClockRunning: nextShotClockRunning,
          possession: nextPossession
        };
      }
    });
  };

  const handleTriggerHorn = () => {
    triggerEventSound(
      'onPeriodEndHorn',
      () => {
        if (state.sport === 'soccer') {
          sounds.playSoccerMatchWhistle();
        } else {
          sounds.playHorn(1500);
        }
      },
      'CMD:HORN'
    );
  };

  const handleStartShotClock = () => {
    if (state.soundEnabled) sounds.playClick();
    setState((prev) => ({ ...prev, shotClockRunning: true }));
    hardware.sendCommand('CMD:SHOT_CLOCK_START');
  };

  const handlePauseShotClock = () => {
    if (state.soundEnabled) sounds.playClick();
    setState((prev) => ({ ...prev, shotClockRunning: false }));
    hardware.sendCommand('CMD:SHOT_CLOCK_PAUSE');
  };

  const handleResetShotClock = (secs: number) => {
    if (state.soundEnabled) sounds.playClick();
    setState((prev) => ({ ...prev, shotClockSeconds: secs, shotClockRunning: false }));
    hardware.sendCommand(`CMD:SHOT_CLOCK_RESET:${secs}`);
  };

  const handleSetSport = (sport: SportType) => {
    if (state.soundEnabled) sounds.playClick();
    if (sport === 'basketball') {
      setState((prev) => ({
        ...prev,
        sport,
        timerSeconds: 600,
        targetSeconds: 600,
        timerMode: 'down',
        period: '1',
        shotClockVisible: true,
        shotClockSeconds: 24,
        shotClockRunning: false,
        autoResetShotClockOnScore: true,
        possessionArrow: 'local',
      }));
      sendTimerStateToArduino(600, '1', 'down');
    } else if (sport === 'soccer') {
      // Fútbol Tradicional: 45 minutos oficiales por tiempo
      setState((prev) => ({
        ...prev,
        sport,
        timerSeconds: 2700, // 45:00
        targetSeconds: 2700,
        timerMode: 'down',
        period: '1T',
        shotClockVisible: false,
        shotClockRunning: false,
        addedTimeMinutes: 0,
      }));
      sendTimerStateToArduino(2700, '1T', 'down');
    } else if (sport === 'futsal') {
      setState((prev) => ({
        ...prev,
        sport,
        timerSeconds: 1200,
        targetSeconds: 1200,
        timerMode: 'down',
        period: '1T',
        shotClockVisible: false,
        shotClockRunning: false,
      }));
      sendTimerStateToArduino(1200, '1T', 'down');
    } else if (sport === 'volleyball') {
      setState((prev) => ({
        ...prev,
        sport,
        timerSeconds: 0,
        targetSeconds: 0,
        timerMode: 'up',
        period: 'S1',
        shotClockVisible: false,
        shotClockRunning: false,
        setsLocal: 0,
        setsVisitor: 0,
        subsLocal: 0,
        subsVisitor: 0,
        service: 'local',
      }));
      sendTimerStateToArduino(0, 'S1', 'up');
    } else if (sport === 'handball') {
      setState((prev) => ({
        ...prev,
        sport,
        timerSeconds: 1800,
        targetSeconds: 1800,
        timerMode: 'down',
        period: '1T',
        shotClockVisible: false,
        shotClockRunning: false,
        penaltyLocal1: null,
        penaltyLocal2: null,
        penaltyVisitor1: null,
        penaltyVisitor2: null,
      }));
      sendTimerStateToArduino(1800, '1T', 'down');
    }
  };

  const syncRealTimeClock = () => {
    const time = getBuenosAiresTime();
    const parts = time.date.split('/');
    const d = parts[0] || '01';
    const m = parts[1] || '01';
    const y = parts[2] || '2026';
    hardware.sendCommand(`CLK:${time.hours}:${time.minutes}:${time.seconds}:${d}:${m}:${y}`);
  };

  const handleSetBrightness = (brightness: number) => {
    const val = Math.max(0, Math.min(100, brightness));
    setState((prev) => ({ ...prev, brightness: val }));
    hardware.sendCommand(`BRIGHT:${val}`);
  };

  const handleSetClockColor = (color: ClockColor) => {
    if (state.soundEnabled) sounds.playClick();
    setState((prev) => ({ ...prev, clockColor: color }));
    hardware.sendCommand(`CLKCLR:${color.toUpperCase()}`);
  };

  const handleSetAppMode = (mode: AppMode) => {
    if (state.soundEnabled) sounds.playClick();
    setState((prev) => ({ ...prev, appMode: mode }));
    if (mode === 'clock') {
      if (state.timerRunning) handlePauseTimer();
      hardware.sendCommand('CMD:MODE_CLOCK');
      syncRealTimeClock();
    } else if (mode === 'scoreboard') {
      hardware.sendCommand('CMD:MODE_SCOREBOARD');
      sendTimerStateToArduino(state.timerSeconds, state.period, state.timerMode);
    } else if (mode === 'banner') {
      hardware.sendCommand(`MSG:${state.marqueeText}`);
    }
  };

  const handleAddFoul = (team: 'local' | 'visitor') => {
    if (state.soundEnabled) sounds.playBeep(600, 150);
    setState((prev) => {
      if (team === 'local') {
        const val = Math.min(99, prev.foulsLocal + 1);
        hardware.sendCommand(`CMD:FOUL:LOCAL:${val}`);
        return { ...prev, foulsLocal: val };
      } else {
        const val = Math.min(99, prev.foulsVisitor + 1);
        hardware.sendCommand(`CMD:FOUL:VISITOR:${val}`);
        return { ...prev, foulsVisitor: val };
      }
    });
  };

  const handleStartTimeOut = (team: 'local' | 'visitor', durationSecs = 60) => {
    if (state.soundEnabled) sounds.playTimeoutHorn();
    setState((prev) => ({
      ...prev,
      timeoutCountdown: durationSecs,
      timeoutRunning: true,
      timeoutTeam: team,
      ...(team === 'local' ? { timeoutsLocal: prev.timeoutsLocal + 1 } : { timeoutsVisitor: prev.timeoutsVisitor + 1 })
    }));
    hardware.sendCommand(`CMD:TIMEOUT:${team.toUpperCase()}:${durationSecs}`);
  };

  const handleAdvancePeriod = () => {
    if (state.soundEnabled) sounds.playClick();
    const periodsBySport: Record<SportType, string[]> = {
      basketball: ['1', '2', '3', '4', 'TE'],
      soccer: ['1T', '2T', 'TE'],
      futsal: ['1T', '2T', 'TE'],
      handball: ['1T', '2T', 'TE'],
      volleyball: ['S1', 'S2', 'S3', 'S4', 'S5'],
      custom: ['1', '2', '3', '4', 'TE'],
    };
    const list = periodsBySport[state.sport] || ['1', '2', '3', '4'];
    const currentIndex = list.indexOf(state.period);
    const nextPeriod = list[(currentIndex + 1) % list.length];
    setState((prev) => ({ ...prev, period: nextPeriod }));
    sendTimerStateToArduino(state.timerSeconds, nextPeriod, state.timerMode);
  };

  // Listener global de atajos de teclado para PC (Mesa de Control)
  useEffect(() => {
    if (!keyboardShortcutsEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar atajos si se está escribiendo en un input, textarea, select o editable
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      // Buscar qué acción coincide con el código de tecla e.code
      const actionEntry = Object.entries(shortcuts).find(([_, code]) => code === e.code) as [ShortcutActionId, string] | undefined;
      
      if (!actionEntry) return;

      const [actionId] = actionEntry;
      e.preventDefault();

      // Feedback visual del HUD
      setLastTriggeredAction(actionId);
      if (lastActionTimerRef.current) clearTimeout(lastActionTimerRef.current);
      lastActionTimerRef.current = setTimeout(() => {
        setLastTriggeredAction(null);
      }, 400);

      // Ejecutar la acción correspondiente
      switch (actionId) {
        case 'timer_toggle':
          if (state.timerRunning) handlePauseTimer();
          else handleStartTimer();
          break;
        case 'timer_reset':
          handleResetTimer();
          break;
        case 'timer_add_min':
          handleAdjustTimer(60);
          break;
        case 'timer_sub_min':
          handleAdjustTimer(-60);
          break;
        case 'timer_add_sec':
          handleAdjustTimer(10);
          break;
        case 'timer_sub_sec':
          handleAdjustTimer(-10);
          break;
        case 'score_local_add1':
          handleChangeScore('local', 1);
          break;
        case 'score_local_add2':
          handleChangeScore('local', 2);
          break;
        case 'score_local_add3':
          handleChangeScore('local', 3);
          break;
        case 'score_local_sub1':
          handleChangeScore('local', -1);
          break;
        case 'foul_local_add':
          handleAddFoul('local');
          break;
        case 'timeout_local':
          handleStartTimeOut('local', 60);
          break;
        case 'score_visitor_add1':
          handleChangeScore('visitor', 1);
          break;
        case 'score_visitor_add2':
          handleChangeScore('visitor', 2);
          break;
        case 'score_visitor_add3':
          handleChangeScore('visitor', 3);
          break;
        case 'score_visitor_sub1':
          handleChangeScore('visitor', -1);
          break;
        case 'foul_visitor_add':
          handleAddFoul('visitor');
          break;
        case 'timeout_visitor':
          handleStartTimeOut('visitor', 60);
          break;
        case 'shot_clock_24':
          handleResetShotClock(24);
          break;
        case 'shot_clock_14':
          handleResetShotClock(14);
          break;
        case 'shot_clock_toggle':
          if (state.shotClockRunning) handlePauseShotClock();
          else handleStartShotClock();
          break;
        case 'possession_arrow':
          setState((prev) => ({ ...prev, possessionArrow: prev.possessionArrow === 'local' ? 'visitor' : 'local' }));
          break;
        case 'horn_trigger':
          handleTriggerHorn();
          break;
        case 'whistle_trigger':
          if (state.soundEnabled) sounds.playRefereeWhistle();
          hardware.sendCommand('CMD:SND:WHISTLE');
          break;
        case 'goal_sound_trigger':
          if (state.soundEnabled) sounds.playGoalHorn();
          hardware.sendCommand('CMD:SND:GOAL');
          break;
        case 'next_period':
          handleAdvancePeriod();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    keyboardShortcutsEnabled,
    shortcuts,
    state.timerRunning,
    state.shotClockRunning,
    state.soundEnabled,
    state.period,
    state.sport,
    state.timerSeconds,
    state.timerMode,
    handleChangeScore,
    handleStartTimer,
    handlePauseTimer,
    handleResetTimer,
    handleAdjustTimer,
    handleTriggerHorn,
    handleStartShotClock,
    handlePauseShotClock,
    handleResetShotClock,
  ]);

  const updateState = (partial: Partial<ScoreboardState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  };

  const handleToggleShortcutsEnabled = (val: boolean) => {
    setKeyboardShortcutsEnabled(val);
    saveStoredShortcutsEnabled(val);
  };

  const handleSaveShortcuts = (updated: KeyboardShortcutsMap) => {
    setShortcuts(updated);
    saveStoredShortcuts(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-10">
      
      {/* HEADER PRINCIPAL */}
      <header className="bg-slate-900 border-b border-slate-800 p-3.5 sticky top-0 z-40 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-3">
          
          {/* Logo y Título */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center shadow-inner">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-stadium font-black text-white leading-none flex items-center gap-2">
                TABLERO GIMNASIO ESCOLAR
                <span className="text-[10px] bg-blue-600/30 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/40">
                  ARDUINO / ESP32
                </span>
              </h1>
              <span className="text-xs text-slate-400 font-mono-code">Controlador Luminoso y Protocolo Serie</span>
            </div>
          </div>

          {/* Acciones del Header: Conexión, Audio, Macros PC, Estado */}
          <div className="flex items-center space-x-2">
            
            {/* Botón Acceso Rápido Configuración Macros de Teclado PC */}
            <button
              onClick={() => setIsKeyConfigModalOpen(true)}
              className={`px-3 py-2 rounded-xl border flex items-center space-x-1.5 transition font-stadium font-bold text-xs ${
                keyboardShortcutsEnabled
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 hover:bg-amber-500/20 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title="Configurar Macros y Atajos de Teclado (Modo PC / Mesa de Control)"
            >
              <Keyboard className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">MACROS PC</span>
            </button>

            {/* Botón Acceso Sonidos Propios y Voces */}
            <button
              onClick={() => setIsCustomSoundModalOpen(true)}
              className="px-3 py-2 rounded-xl border flex items-center space-x-1.5 transition font-stadium font-bold text-xs bg-pink-500/15 border-pink-500/40 text-pink-300 hover:bg-pink-500/25 shadow-md"
              title="Cargar MP3 propios, grabar audios del estadio y personalizar eventos"
            >
              <Music className="w-4 h-4 text-pink-400" />
              <span className="hidden lg:inline">SONIDOS PROPIOS ({customSounds.length})</span>
            </button>

            {/* Botón Rápido Descarga e Instalación (Win11 / Android) */}
            <button
              onClick={() => handleSetAppMode('downloads')}
              className={`px-3 py-2 rounded-xl border flex items-center space-x-1.5 transition font-stadium font-bold text-xs ${
                state.appMode === 'downloads'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
              }`}
              title="Descargar e Instalar en Windows 11 o Android"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">DESCARGAR APP</span>
            </button>

            {/* Toggle de Sonido Web Audio */}
            <button
              onClick={() => setState((p) => ({ ...p, soundEnabled: !p.soundEnabled }))}
              className={`p-2 rounded-xl border transition ${
                state.soundEnabled
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={state.soundEnabled ? 'Sonido Activado' : 'Silenciado'}
            >
              {state.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Badge de Conexión */}
            <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  state.connectionType !== 'none' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              ></span>
              <span className="text-xs font-bold text-slate-300 max-w-[130px] truncate">
                {state.connectionLabel}
              </span>
            </div>

            {/* Botón Abrir Conexión */}
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-stadium font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-lg transition"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>ENLACE</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 space-y-5">
        
        {/* VISTA PREVIA DEL CARTEL FÍSICO LUMINOSO (SIEMPRE VISIBLE ARRIBA) */}
        <VirtualLedSignPreview
          state={state}
          rtcTime={rtcTime}
          formatTimer={formatTimer}
          onSetBrightness={handleSetBrightness}
          onSetClockColor={handleSetClockColor}
        />

        {/* HUD DE GUÍA DE ATRIBUTOS Y MACROS DE TECLADO */}
        <KeyboardHudOverlay
          shortcuts={shortcuts}
          enabled={keyboardShortcutsEnabled}
          onOpenConfig={() => setIsKeyConfigModalOpen(true)}
          lastTriggeredAction={lastTriggeredAction}
        />

        {/* BARRA DE PESTAÑAS DE CONTROL */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1.5 flex flex-wrap gap-1.5 shadow-lg text-xs">
          <button
            onClick={() => handleSetAppMode('scoreboard')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-stadium font-bold transition flex items-center justify-center space-x-2 ${
              state.appMode === 'scoreboard'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>TABLERO DE JUEGO</span>
          </button>

          <button
            onClick={() => handleSetAppMode('clock')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-stadium font-bold transition flex items-center justify-center space-x-2 ${
              state.appMode === 'clock'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>RELOJ RTC (DS3231)</span>
          </button>

          <button
            onClick={() => handleSetAppMode('banner')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-stadium font-bold transition flex items-center justify-center space-x-2 ${
              state.appMode === 'banner'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>CARTEL MENSAJES</span>
          </button>

          <button
            onClick={() => handleSetAppMode('manual')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-stadium font-bold transition flex items-center justify-center space-x-2 ${
              state.appMode === 'manual'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-300" />
            <span>MANUAL DE USUARIO</span>
          </button>

          <button
            onClick={() => handleSetAppMode('audit')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-stadium font-bold transition flex items-center justify-center space-x-2 ${
              state.appMode === 'audit'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-300" />
            <span>INFORME AUDITORÍA</span>
          </button>

          <button
            onClick={() => handleSetAppMode('downloads')}
            className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl font-stadium font-bold transition flex items-center justify-center space-x-2 ${
              state.appMode === 'downloads'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                : 'text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 hover:bg-emerald-900/40'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-300" />
            <span>DESCARGAS & APP</span>
          </button>

          <button
            onClick={() => handleSetAppMode('arduino_code')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-stadium font-bold transition flex items-center justify-center space-x-2 ${
              state.appMode === 'arduino_code'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4 text-emerald-300" />
            <span>CÓDIGO .INO</span>
          </button>
        </div>

        {/* PANELES SEGÚN PESTAÑA ACTIVA */}
        {state.appMode === 'scoreboard' && (
          <ScoreboardPanel
            state={state}
            updateState={updateState}
            onStartTimer={handleStartTimer}
            onPauseTimer={handlePauseTimer}
            onResetTimer={handleResetTimer}
            onAdjustTimer={handleAdjustTimer}
            onChangeScore={handleChangeScore}
            onTriggerHorn={handleTriggerHorn}
            onStartShotClock={handleStartShotClock}
            onPauseShotClock={handlePauseShotClock}
            onResetShotClock={handleResetShotClock}
            onSetSport={handleSetSport}
            onOpenKeyConfig={() => setIsKeyConfigModalOpen(true)}
            customSounds={customSounds}
            soundOverrides={soundOverrides}
            onOpenCustomSoundManager={() => setIsCustomSoundModalOpen(true)}
          />
        )}

        {state.appMode === 'clock' && (
          <ClockPanel
            state={state}
            updateState={updateState}
            rtcTime={rtcTime}
            onSyncRtc={syncRealTimeClock}
            onSetClockColor={handleSetClockColor}
          />
        )}

        {state.appMode === 'banner' && (
          <MessageBannerPanel
            state={state}
            updateState={updateState}
            onSendMarqueeText={(text) => hardware.sendCommand(`MSG:${text}`)}
            onSetBrightness={handleSetBrightness}
          />
        )}

        {state.appMode === 'manual' && (
          <UserManualPanel />
        )}

        {state.appMode === 'audit' && (
          <CodeVerificationAudit />
        )}

        {state.appMode === 'arduino_code' && (
          <ArduinoSketchModal />
        )}

        {state.appMode === 'downloads' && (
          <AppDownloadPanel soundEnabled={state.soundEnabled} />
        )}

        {/* MONITOR SERIE Y REGISTRO DE PROTOCOLO (SIEMPRE DISPONIBLE EN LA PARTE INFERIOR) */}
        <ProtocolTerminal
          logs={logs}
          onSendCommand={(cmd) => hardware.sendCommand(cmd)}
          onClearLogs={() => setLogs([])}
        />

      </main>

      {/* MODAL DE CONFIGURACIÓN DE MACROS DE TECLADO (PC) */}
      <KeyboardConfigModal
        isOpen={isKeyConfigModalOpen}
        onClose={() => setIsKeyConfigModalOpen(false)}
        shortcuts={shortcuts}
        onSaveShortcuts={handleSaveShortcuts}
        enabled={keyboardShortcutsEnabled}
        onToggleEnabled={handleToggleShortcutsEnabled}
      />

      {/* MODAL DE GESTIÓN DE SONIDOS PROPIOS, MP3 Y VOCES */}
      <CustomSoundManagerModal
        isOpen={isCustomSoundModalOpen}
        onClose={() => setIsCustomSoundModalOpen(false)}
        soundsList={customSounds}
        onSaveSounds={handleSaveCustomSounds}
        soundOverrides={soundOverrides}
        onSaveOverrides={handleSaveSoundOverrides}
      />

      {/* MODAL DE CONEXIÓN HARDWARE */}
      <ConnectionModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        connectionType={state.connectionType}
        currentLabel={state.connectionLabel}
        onConnectSerial={(baud) => hardware.connectSerial(baud)}
        onConnectBluetooth={() => hardware.connectBluetoothBLE()}
        onConnectWifi={(ip) => hardware.connectWifi(ip)}
        onConnectSimulation={() => hardware.connectSimulation()}
        onDisconnect={() => hardware.disconnect()}
      />
    </div>
  );
}
