/**
 * Synthesized Web Audio sound effects for Rock Paper Scissors game.
 * Zero external audio assets required - runs smoothly everywhere and offline.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public playClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Ignore audio errors
    }
  }

  public playCountdown(pitch: number = 440) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Ignore audio errors
    }
  }

  public playShoot() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Ignore audio errors
    }
  }

  public playWin() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);

        const startTime = ctx.currentTime + idx * 0.09;
        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.23);
      });
    } catch {
      // Ignore audio errors
    }
  }

  public playLose() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [400, 370, 330, 260];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

        const startTime = ctx.currentTime + idx * 0.1;
        gain.gain.setValueAtTime(0.14, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.18);
      });
    } catch {
      // Ignore audio errors
    }
  }

  public playDraw() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch {
      // Ignore audio errors
    }
  }
}

export const soundFx = new SoundEngine();
