class RetroAudio {
  private ctx: AudioContext | null = null;
  public muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    const ua = (navigator as unknown as { userActivation?: { hasBeenActive: boolean } }).userActivation;
    if (ua && !ua.hasBeenActive) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType = 'square',
    gainPeak = 0.08,
    delay = 0
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playJump(): void {
    const jitter = 0.94 + Math.random() * 0.12;
    this.playTone(230 * jitter, 520 * jitter, 0.13, 'square', 0.07);
  }

  playLand(): void {
    this.playTone(130, 65, 0.07, 'triangle', 0.07);
  }

  playStep(): void {
    const jitter = 0.92 + Math.random() * 0.16;
    this.playTone(160 * jitter, 90 * jitter, 0.035, 'triangle', 0.03);
  }

  playCollect(): void {
    const jitter = 0.96 + Math.random() * 0.08;
    this.playTone(660 * jitter, 880 * jitter, 0.07, 'square', 0.06, 0);
    this.playTone(990 * jitter, 1320 * jitter, 0.1, 'square', 0.06, 0.06);
  }

  playStomp(): void {
    this.playTone(320, 120, 0.1, 'square', 0.08, 0);
    this.playTone(460, 680, 0.09, 'triangle', 0.07, 0.04);
  }

  playHurt(): void {
    this.playTone(190, 58, 0.22, 'sawtooth', 0.1);
  }

  playLaser(): void {
    this.playTone(760, 210, 0.1, 'sawtooth', 0.045);
  }

  playEnterStage(): void {
    this.playTone(330, 440, 0.07, 'square', 0.06, 0);
    this.playTone(554, 659, 0.12, 'square', 0.06, 0.07);
  }

  playVictory(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, n * 1.02, 0.16, 'square', 0.07, idx * 0.1);
    });
  }

  playGameOver(): void {
    const notes = [392, 349.23, 311.13, 261.63];
    notes.forEach((n, idx) => {
      this.playTone(n, n * 0.96, 0.18, 'sawtooth', 0.06, idx * 0.12);
    });
  }
}

export const retroAudio = new RetroAudio();
