// Generador de sonidos y música de estadio multideporte con Web Audio API

export type StadiumSoundType = 
  // Básquetbol
  | 'horn' 
  | 'shot_clock_warn'
  | 'shot_clock_horn'
  | 'defense' 
  | 'charge' 
  | 'triple' 
  | 'whistle' 
  | 'timeout' 
  | 'timeout_warn'
  // Fútbol y Futsal
  | 'goal'
  | 'ole'
  | 'double_whistle'
  | 'soccer_end'
  | 'doble_penal'
  | 'card_alarm'
  | 'applause'
  // Vóley
  | 'set_point'
  | 'spike_ace'
  | 'serve_whistle'
  | 'rotation_beep'
  // Handball
  | 'handball_goal'
  | 'two_min_suspension'
  | 'passive_play'
  // Entrenamiento / Gimnasio
  | 'countdown' 
  | 'boxing_bell'
  | 'gong'
  | 'click' 
  | 'beep';

class StadiumSoundEngine {
  private ctx: AudioContext | null = null;

  private initContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // ==========================================
  // 1. SONIDOS DE BÁSQUETBOL
  // ==========================================

  // Chicharra de estadio / Bocina potente NBA/FIBA
  playHorn(durationMs = 1500) {
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const dur = durationMs / 1000;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const osc4 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(140, now);
      osc1.frequency.linearRampToValueAtTime(136, now + dur);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(210, now);

      osc3.type = 'sawtooth';
      osc3.frequency.setValueAtTime(280, now);

      osc4.type = 'sawtooth';
      osc4.frequency.setValueAtTime(420, now);

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(0.5, now + 0.03);
      gainNode.gain.setValueAtTime(0.5, now + dur - 0.06);
      gainNode.gain.linearRampToValueAtTime(0.001, now + dur);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      osc3.connect(gainNode);
      osc4.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      osc4.start(now);

      osc1.stop(now + dur);
      osc2.stop(now + dur);
      osc3.stop(now + dur);
      osc4.stop(now + dur);
    } catch {
      // Ignore
    }
  }

  // Sonido de Alerta de Últimos Segundos de Posesión (5, 4, 3, 2, 1s) - Beep agudo penetrante NBA/FIBA
  playShotClockWarning(secondsLeft?: number) {
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Frecuencia dinámica: más aguda a medida que se acaba el tiempo (de 5s a 1s)
      let baseFreq = 1046.50; // C6
      if (secondsLeft !== undefined) {
        if (secondsLeft <= 1) baseFreq = 1396.91; // F6
        else if (secondsLeft === 2) baseFreq = 1318.51; // E6
        else if (secondsLeft === 3) baseFreq = 1174.66; // D6
        else if (secondsLeft === 4) baseFreq = 1046.50; // C6
        else baseFreq = 987.77; // B5
      }

      // Doble pulso corto y penetrante
      const playPulse = (offset: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(baseFreq, now + offset);

        gain.gain.setValueAtTime(0.01, now + offset);
        gain.gain.linearRampToValueAtTime(0.35, now + offset + 0.015);
        gain.gain.setValueAtTime(0.35, now + offset + dur - 0.02);
        gain.gain.linearRampToValueAtTime(0.001, now + offset + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + dur);
      };

      playPulse(0.00, 0.09);
      playPulse(0.12, 0.09);
    } catch {
      // Ignore
    }
  }

  // Chicharra de Violación de 24s / Fin de Posesión (Buzzer áspero de tablero LED)
  playShotClockViolation(durationMs = 1100) {
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const dur = durationMs / 1000;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Timbre característico más áspero y estridente que la chicharra de cuarto
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(360, now);
      osc1.frequency.linearRampToValueAtTime(350, now + dur);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(540, now);

      osc3.type = 'sawtooth';
      osc3.frequency.setValueAtTime(720, now);

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(0.48, now + 0.02);
      gainNode.gain.setValueAtTime(0.48, now + dur - 0.04);
      gainNode.gain.linearRampToValueAtTime(0.001, now + dur);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      osc3.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);

      osc1.stop(now + dur);
      osc2.stop(now + dur);
      osc3.stop(now + dur);
    } catch {
      // Ignore
    }
  }

  // Simulación demostración de los últimos 5 segundos + Chicharra final
  playShotClockSequence() {
    [5, 4, 3, 2, 1].forEach((sec, idx) => {
      setTimeout(() => {
        this.playShotClockWarning(sec);
      }, idx * 600);
    });

    setTimeout(() => {
      this.playShotClockViolation();
    }, 5 * 600);
  }

  // Fanfarria clásica: "CHARGE!" / ¡A la carga!
  playChargeFanfare() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [
        { freq: 392.00, time: 0.00, dur: 0.15 }, // Sol (G4)
        { freq: 523.25, time: 0.16, dur: 0.15 }, // Do (C5)
        { freq: 659.25, time: 0.32, dur: 0.15 }, // Mi (E5)
        { freq: 783.99, time: 0.48, dur: 0.30 }, // Sol (G5)
        { freq: 659.25, time: 0.80, dur: 0.15 }, // Mi (E5)
        { freq: 783.99, time: 0.96, dur: 0.65 }, // Sol (G5) largo
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0.01, now + time);
        gain.gain.linearRampToValueAtTime(0.35, now + time + 0.02);
        gain.gain.setValueAtTime(0.3, now + time + dur - 0.04);
        gain.gain.linearRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur);
      });
    } catch {
      // Ignore
    }
  }

  // Ritmo de cancha: "DEFENSE! 👏 👏"
  playDefenseChant() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      
      const playOrganChord = (baseFreq: number, start: number, dur: number) => {
        [baseFreq, baseFreq * 1.5, baseFreq * 2].forEach(f => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + start);

          gain.gain.setValueAtTime(0.01, now + start);
          gain.gain.linearRampToValueAtTime(0.25, now + start + 0.02);
          gain.gain.linearRampToValueAtTime(0.001, now + start + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + start);
          osc.stop(now + start + dur);
        });
      };

      playOrganChord(261.63, 0.0, 0.28);
      playOrganChord(196.00, 0.35, 0.45);

      this.playSyntheticClap(now + 0.90);
      this.playSyntheticClap(now + 1.20);
      this.playSyntheticClap(now + 1.50);
    } catch {
      // Ignore
    }
  }

  // Efecto ¡TRIPLE! 🔥
  playTripleBasket() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.01, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.4);
      });
    } catch {
      // Ignore
    }
  }

  // Canasta de Básquetbol (+1 o +2 pts) - Chime de anotación nítido
  playBasketScore() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      [587.33, 880.00].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.01, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch {
      // Ignore
    }
  }

  // Silbato de Árbitro
  playWhistle() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const dur = 0.55;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(2650, now);
      osc1.frequency.linearRampToValueAtTime(2800, now + dur);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(2850, now);

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(0.4, now + 0.04);
      gainNode.gain.setValueAtTime(0.38, now + dur - 0.06);
      gainNode.gain.linearRampToValueAtTime(0.001, now + dur);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + dur);
      osc2.stop(now + dur);
    } catch {
      // Ignore
    }
  }

  // Doble Tono Tiempo Muerto
  playTimeoutHorn() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const playTone = (start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now + start);

        gain.gain.setValueAtTime(0.01, now + start);
        gain.gain.linearRampToValueAtTime(0.4, now + start + 0.02);
        gain.gain.linearRampToValueAtTime(0.001, now + start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur);
      };

      playTone(0.0, 0.25);
      playTone(0.35, 0.45);
    } catch {
      // Ignore
    }
  }

  // ==========================================
  // 2. SONIDOS DE FUTSAL / FÚTBOL
  // ==========================================

  // ¡GOOOL! - Sirena de Gol de Estadio + Bocina Euforia
  playGoalHorn() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // 1. Sirena ascendente y descendente (Air raid goal horn)
      const siren = ctx.createOscillator();
      const sirenGain = ctx.createGain();
      siren.type = 'sawtooth';
      siren.frequency.setValueAtTime(260, now);
      siren.frequency.exponentialRampToValueAtTime(650, now + 0.6);
      siren.frequency.linearRampToValueAtTime(520, now + 1.2);
      siren.frequency.exponentialRampToValueAtTime(700, now + 1.8);
      siren.frequency.linearRampToValueAtTime(300, now + 2.5);

      sirenGain.gain.setValueAtTime(0.01, now);
      sirenGain.gain.linearRampToValueAtTime(0.35, now + 0.1);
      sirenGain.gain.setValueAtTime(0.35, now + 2.2);
      sirenGain.gain.linearRampToValueAtTime(0.001, now + 2.6);

      siren.connect(sirenGain);
      sirenGain.connect(ctx.destination);
      siren.start(now);
      siren.stop(now + 2.6);

      // 2. Bocina grave de fondo
      const horn = ctx.createOscillator();
      const hornGain = ctx.createGain();
      horn.type = 'square';
      horn.frequency.setValueAtTime(175, now);
      hornGain.gain.setValueAtTime(0.01, now);
      hornGain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      hornGain.gain.linearRampToValueAtTime(0.001, now + 2.4);

      horn.connect(hornGain);
      hornGain.connect(ctx.destination);
      horn.start(now);
      horn.stop(now + 2.4);

      // 3. Aplausos de fondo
      this.playMassApplause(now, 2.8);
    } catch {
      // Ignore
    }
  }

  // Cántico de tribuna: "¡Olé, Olé, Olé, Olé!"
  playOleChant() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Notas: G4, E4, C4, D4, E4, F4, E4, D4, C4
      const notes = [
        { f: 392.00, t: 0.00, d: 0.22 }, // O-
        { f: 523.25, t: 0.24, d: 0.22 }, // lé,
        { f: 392.00, t: 0.48, d: 0.22 }, // O-
        { f: 523.25, t: 0.72, d: 0.22 }, // lé,
        { f: 392.00, t: 0.96, d: 0.20 }, // O-
        { f: 523.25, t: 1.18, d: 0.20 }, // lé,
        { f: 587.33, t: 1.40, d: 0.20 }, // O-
        { f: 659.25, t: 1.62, d: 0.45 }, // LÉEE
      ];

      notes.forEach(({ f, t, d }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.01, now + t);
        gain.gain.linearRampToValueAtTime(0.28, now + t + 0.02);
        gain.gain.linearRampToValueAtTime(0.001, now + t + d);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + d);
      });
    } catch {
      // Ignore
    }
  }

  // Doble Silbato de Árbitro (Falta / Tiro Libre)
  playDoubleWhistle() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const playPuff = (startTime: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2750, now + startTime);
        osc.frequency.linearRampToValueAtTime(2900, now + startTime + dur);

        gain.gain.setValueAtTime(0.01, now + startTime);
        gain.gain.linearRampToValueAtTime(0.35, now + startTime + 0.02);
        gain.gain.linearRampToValueAtTime(0.001, now + startTime + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + startTime);
        osc.stop(now + startTime + dur);
      };

      playPuff(0.00, 0.18);
      playPuff(0.25, 0.35);
    } catch {
      // Ignore
    }
  }

  // Silbato Reglamentario de Fin de Partido (Corto - Corto - Largo)
  playSoccerMatchWhistle() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const playPuff = (startTime: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2800, now + startTime);
        osc.frequency.linearRampToValueAtTime(2650, now + startTime + dur);

        gain.gain.setValueAtTime(0.01, now + startTime);
        gain.gain.linearRampToValueAtTime(0.4, now + startTime + 0.02);
        gain.gain.linearRampToValueAtTime(0.001, now + startTime + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + startTime);
        osc.stop(now + startTime + dur);
      };

      // 3 pitidos reglamentarios
      playPuff(0.00, 0.20);
      playPuff(0.35, 0.20);
      playPuff(0.70, 0.90);
    } catch {
      // Ignore
    }
  }

  // Alarma de 6ª Falta Acumulada Futsal (Doble Penal 10m sin barrera)
  playDoblePenal() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.linearRampToValueAtTime(1400, now + 0.25);
      osc.frequency.linearRampToValueAtTime(900, now + 0.5);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.45, now + 0.05);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch {
      // Ignore
    }
  }

  // Aviso sonoro a los 50s del Time-out (10s para reanudar el juego)
  playTimeoutWarning() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      [0, 0.18, 0.36].forEach((time) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now + time);

        gain.gain.setValueAtTime(0.01, now + time);
        gain.gain.linearRampToValueAtTime(0.35, now + time + 0.02);
        gain.gain.linearRampToValueAtTime(0.001, now + time + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + 0.12);
      });
    } catch {
      // Ignore
    }
  }

  // Alarma de Tarjeta / Sanción
  playCardAlarm() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.45);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.03);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Ignore
    }
  }

  // ==========================================
  // 3. SONIDOS DE VOLEIBOL (VÓLEY)
  // ==========================================

  // ¡SET POINT! / Punto de Set Decisivo (Fanfarria brillante)
  playSetPoint() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const notes = [
        { f: 587.33, t: 0.00, d: 0.12 }, // D5
        { f: 739.99, t: 0.12, d: 0.12 }, // F#5
        { f: 880.00, t: 0.24, d: 0.12 }, // A5
        { f: 1174.66, t: 0.36, d: 0.60 }, // D6 Triunfal
      ];

      notes.forEach(({ f, t, d }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.01, now + t);
        gain.gain.linearRampToValueAtTime(0.35, now + t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + d);
      });
    } catch {
      // Ignore
    }
  }

  // ¡BLOQUEO / REMATE ACE! (Spike / Ace impactante)
  playSpikeAce() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Golpe grave percusivo
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.3);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);

      // Resonancia de campana
      const bell = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bell.type = 'triangle';
      bell.frequency.setValueAtTime(1046.50, now);
      bellGain.gain.setValueAtTime(0.3, now);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      bell.connect(bellGain);
      bellGain.connect(ctx.destination);
      bell.start(now);
      bell.stop(now + 0.8);
    } catch {
      // Ignore
    }
  }

  // Silbato corto de Saque / Servicio
  playServeWhistle() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2900, now);
      osc.frequency.linearRampToValueAtTime(3100, now + 0.22);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Ignore
    }
  }

  // Rotación / Cambio de Jugadores
  playRotationBeep() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const playTone = (freq: number, start: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + start);
        gain.gain.setValueAtTime(0.01, now + start);
        gain.gain.linearRampToValueAtTime(0.3, now + start + 0.02);
        gain.gain.linearRampToValueAtTime(0.001, now + start + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + 0.12);
      };

      playTone(587, 0.00); // D5
      playTone(880, 0.12); // A5
    } catch {
      // Ignore
    }
  }

  // ==========================================
  // 4. SONIDOS DE HANDBALL (BALONMANO)
  // ==========================================

  // ¡Golazo Handball! (Bocina Europea de Cancha)
  playHandballGoal() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(220, now);
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(330, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.45, now + 0.04);
      gain.gain.setValueAtTime(0.45, now + 1.2);
      gain.gain.linearRampToValueAtTime(0.001, now + 1.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.5);
      osc2.stop(now + 1.5);
    } catch {
      // Ignore
    }
  }

  // Exclusión de 2 Minutos (Sanción Handball)
  playTwoMinSuspension() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // 3 beeps de advertencia descendentes
      [660, 520, 390].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.16);

        gain.gain.setValueAtTime(0.01, now + idx * 0.16);
        gain.gain.linearRampToValueAtTime(0.35, now + idx * 0.16 + 0.02);
        gain.gain.linearRampToValueAtTime(0.001, now + idx * 0.16 + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.16);
        osc.stop(now + idx * 0.16 + 0.12);
      });
    } catch {
      // Ignore
    }
  }

  // Aviso de Juego Pasivo
  playPassivePlay() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      [0.0, 0.2, 0.4].forEach((t) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now + t);

        gain.gain.setValueAtTime(0.01, now + t);
        gain.gain.linearRampToValueAtTime(0.3, now + t + 0.02);
        gain.gain.linearRampToValueAtTime(0.001, now + t + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + 0.08);
      });
    } catch {
      // Ignore
    }
  }

  // ==========================================
  // 5. ENTRENAMIENTO, GIMNASIO Y MULTIDEPORTE
  // ==========================================

  // Cuenta Regresiva 3, 2, 1, ¡GO! (HIIT / Salida)
  playCountdown() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // 3, 2, 1 (Beeps graves)
      [0.0, 1.0, 2.0].forEach((t) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now + t);

        gain.gain.setValueAtTime(0.01, now + t);
        gain.gain.linearRampToValueAtTime(0.35, now + t + 0.03);
        gain.gain.linearRampToValueAtTime(0.001, now + t + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + 0.2);
      });

      // ¡GO! (Beep agudo largo a los 3.0s)
      const goOsc = ctx.createOscillator();
      const goGain = ctx.createGain();
      goOsc.type = 'sawtooth';
      goOsc.frequency.setValueAtTime(1200, now + 3.0);

      goGain.gain.setValueAtTime(0.01, now + 3.0);
      goGain.gain.linearRampToValueAtTime(0.45, now + 3.0 + 0.03);
      goGain.gain.linearRampToValueAtTime(0.001, now + 3.8);

      goOsc.connect(goGain);
      goGain.connect(ctx.destination);
      goOsc.start(now + 3.0);
      goOsc.stop(now + 3.8);
    } catch {
      // Ignore
    }
  }

  // Campana de Round de Boxeo / Gimnasio (Ring Bell)
  playBoxingBell() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const playStrike = (time: number) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(1864.66, now + time); // A#6
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2793.83, now + time); // F7

        gain.gain.setValueAtTime(0.5, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now + time);
        osc2.start(now + time);
        osc1.stop(now + time + 0.8);
        osc2.stop(now + time + 0.8);
      };

      playStrike(0.00);
      playStrike(0.20);
      playStrike(0.40);
    } catch {
      // Ignore
    }
  }

  // Gong Grave de Descanso / Fin de Circuito
  playGong() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(95, now + 2.5);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.5);
    } catch {
      // Ignore
    }
  }

  // Aplausos de Estadio / Ovación de Tribuna
  playMassApplause(startTime?: number, duration = 2.0) {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = startTime !== undefined ? startTime : ctx.currentTime;

      const bufferSize = ctx.sampleRate * duration;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        // Envolvente de densidad estocástica de aplausos
        const t = i / ctx.sampleRate;
        const envelope = Math.sin((Math.PI * t) / duration);
        output[i] = (Math.random() * 2 - 1) * envelope;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 1.8;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.linearRampToValueAtTime(0.001, now + duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + duration);
    } catch {
      // Ignore
    }
  }

  private playSyntheticClap(startTime: number) {
    if (!this.ctx) return;
    try {
      const ctx = this.ctx;
      const bufferSize = ctx.sampleRate * 0.12;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1100;
      filter.Q.value = 2.5;

      const clapGain = ctx.createGain();
      clapGain.gain.setValueAtTime(0.4, startTime);
      clapGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);

      whiteNoise.connect(filter);
      filter.connect(clapGain);
      clapGain.connect(ctx.destination);

      whiteNoise.start(startTime);
      whiteNoise.stop(startTime + 0.12);
    } catch {
      // Ignore
    }
  }

  // Beep de aviso o posesión
  playBeep(frequency = 880, durationMs = 250) {
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(0.25, now + 0.02);
      gainNode.gain.linearRampToValueAtTime(0.001, now + durationMs / 1000);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + durationMs / 1000);
    } catch {
      // Ignore
    }
  }

  // Click de interfaz táctil
  playClick() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.03);

      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch {
      // Ignore
    }
  }

  // ==========================================
  // 6. REPRODUCTOR DE AUDIO PROPIO / PERSONALIZADO
  // ==========================================
  private audioBufferCache = new Map<string, AudioBuffer>();
  private activeCustomSources = new Map<string, { stop: () => void }>();

  // Pre-decodificar y almacenar en caché el audio para reproducción con latencia CERO
  async preloadCustomAudio(id: string, dataUrl: string): Promise<AudioBuffer | null> {
    if (this.audioBufferCache.has(id)) {
      return this.audioBufferCache.get(id) || null;
    }

    try {
      const ctx = this.initContext();
      if (!ctx) return null;

      // Convertir dataURL / base64 a ArrayBuffer
      const res = await fetch(dataUrl);
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.audioBufferCache.set(id, audioBuffer);
      return audioBuffer;
    } catch (e) {
      console.warn(`No se pudo decodificar audio Web Audio API para ${id}, usando fallback HTMLAudio`, e);
      return null;
    }
  }

  // Reproducir un sonido propio cargado por el usuario
  async playCustomSound(
    id: string,
    dataUrl: string,
    volume = 1.0,
    loop = false,
    onEnded?: () => void
  ): Promise<boolean> {
    try {
      const ctx = this.initContext();
      
      // Detener si ya estaba sonando esta instancia
      this.stopCustomSound(id);

      // Intento 1: Web Audio API (Latencia 0ms)
      if (ctx) {
        let buffer = this.audioBufferCache.get(id);
        if (!buffer) {
          buffer = (await this.preloadCustomAudio(id, dataUrl)) || undefined;
        }

        if (buffer) {
          const source = ctx.createBufferSource();
          const gainNode = ctx.createGain();
          
          source.buffer = buffer;
          source.loop = loop;
          gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), ctx.currentTime);

          source.connect(gainNode);
          gainNode.connect(ctx.destination);

          source.onended = () => {
            this.activeCustomSources.delete(id);
            if (onEnded) onEnded();
          };

          source.start(0);

          this.activeCustomSources.set(id, {
            stop: () => {
              try {
                source.stop();
                source.disconnect();
              } catch {
                // Ignore
              }
              this.activeCustomSources.delete(id);
            }
          });

          return true;
        }
      }

      // Intento 2: Fallback con HTML5 Audio Element
      const audio = new Audio(dataUrl);
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.loop = loop;

      audio.onended = () => {
        this.activeCustomSources.delete(id);
        if (onEnded) onEnded();
      };

      await audio.play();

      this.activeCustomSources.set(id, {
        stop: () => {
          try {
            audio.pause();
            audio.currentTime = 0;
          } catch {
            // Ignore
          }
          this.activeCustomSources.delete(id);
        }
      });

      return true;
    } catch (e) {
      console.error('Error al reproducir sonido personalizado:', e);
      return false;
    }
  }

  // Detener un sonido personalizado específico
  stopCustomSound(id: string) {
    const active = this.activeCustomSources.get(id);
    if (active) {
      active.stop();
      this.activeCustomSources.delete(id);
    }
  }

  // Comprobar si un sonido está reproduciéndose
  isCustomSoundPlaying(id: string): boolean {
    return this.activeCustomSources.has(id);
  }

  // Detener TODOS los sonidos activos (propios y de estadio)
  stopAllSounds() {
    this.activeCustomSources.forEach((source) => {
      try {
        source.stop();
      } catch {
        // Ignore
      }
    });
    this.activeCustomSources.clear();
  }

  // Limpiar caché de sonido eliminado
  removeCustomSoundCache(id: string) {
    this.stopCustomSound(id);
    this.audioBufferCache.delete(id);
  }

  // Alias para silbato de árbitro y compatibilidad
  playRefereeWhistle() {
    this.playWhistle();
  }

  // Alias para órgano de defensa de básquet
  playDefenseOrgan() {
    this.playDefenseChant();
  }

  // Alias para advertencia de juego pasivo handball
  playPassivePlayWarning() {
    this.playPassivePlay();
  }
}

export const sounds = new StadiumSoundEngine();
