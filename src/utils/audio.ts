// Luxury ambient audio synthesizer using Web Audio API
class AtelierSoundscape {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private nodes: (OscillatorNode | GainNode)[] = [];

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }

  public play() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.06, this.ctx.currentTime + 3);
      this.masterGain.connect(this.ctx.destination);

      // Warm harmonic chords (D major 9th / atmospheric warm pads)
      const freqs = [146.83, 220.0, 277.18, 329.63, 440.0, 554.37];
      this.nodes = [];

      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        // Gentle subtle vibrato/drift
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.12 + idx * 0.05, this.ctx.currentTime);
        lfoGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        lfo.connect(osc.frequency);
        lfo.start();

        const baseVol = (1 / (idx + 2)) * 0.35;
        gain.gain.setValueAtTime(baseVol, this.ctx.currentTime);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        this.nodes.push(osc, gain, lfo, lfoGain);
      });

      this.isPlaying = true;
    } catch {
      this.isPlaying = false;
    }
  }

  public stop() {
    if (this.ctx && this.masterGain) {
      try {
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
        setTimeout(() => {
          this.nodes.forEach(n => {
            if ('stop' in n && typeof n.stop === 'function') {
              try { n.stop(); } catch { /* ignore */ }
            }
          });
          this.nodes = [];
          this.isPlaying = false;
        }, 1300);
      } catch {
        this.isPlaying = false;
      }
    } else {
      this.isPlaying = false;
    }
  }
}

export const atelierSound = new AtelierSoundscape();
