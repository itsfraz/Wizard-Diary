export class AudioManager {
  constructor() {
    this.ctx = null;
    this.quillSource = null;
    this.quillFilter = null;
    this.quillGain = null;
    this.quillInterval = null;
    this.isQuillPlaying = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playHeavyThud() {
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Low frequency punch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sine';
    
    // Sweep frequency down quickly
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(10, t + 0.5);
    
    // Volume envelope
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(1, t + 0.05); // quick attack
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6); // slow decay
    
    // Add a slightly higher freq "leather creak" layer
    const creakOsc = this.ctx.createOscillator();
    const creakGain = this.ctx.createGain();
    creakOsc.connect(creakGain);
    creakGain.connect(this.ctx.destination);
    
    creakOsc.type = 'triangle';
    creakOsc.frequency.setValueAtTime(200, t);
    creakOsc.frequency.linearRampToValueAtTime(50, t + 0.4);
    
    creakGain.gain.setValueAtTime(0, t);
    creakGain.gain.linearRampToValueAtTime(0.2, t + 0.1);
    creakGain.gain.linearRampToValueAtTime(0, t + 0.5);

    osc.start(t);
    osc.stop(t + 0.6);
    creakOsc.start(t);
    creakOsc.stop(t + 0.5);
  }

  playMagicChime() {
    if (!this.ctx) return;

    const notes = [880, 1108.73, 1318.51, 1760, 2217.46]; // A major pentatonic (A5, C#6, E6, A6, C#7)
    const t = this.ctx.currentTime;
    
    // Create a master gain for the chimes
    const masterGain = this.ctx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(this.ctx.destination);

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const delay = i * 0.08; // Arpeggiate
      
      gain.gain.setValueAtTime(0, t + delay);
      gain.gain.linearRampToValueAtTime(0.8, t + delay + 0.02); // quick ding
      gain.gain.exponentialRampToValueAtTime(0.01, t + delay + 2.0); // very long ring
      
      osc.start(t + delay);
      osc.stop(t + delay + 2.1);
    });
  }

  startQuill() {
    if (!this.ctx || this.isQuillPlaying) return;
    this.isQuillPlaying = true;

    // Generate brown noise buffer for scratching sound
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // (rough compensation for gain)
    }

    this.quillSource = this.ctx.createBufferSource();
    this.quillSource.buffer = buffer;
    this.quillSource.loop = true;
    
    // Bandpass filter to make it sound like paper scratching
    this.quillFilter = this.ctx.createBiquadFilter();
    this.quillFilter.type = 'bandpass';
    this.quillFilter.frequency.value = 1500;
    this.quillFilter.Q.value = 1.5;

    this.quillGain = this.ctx.createGain();
    this.quillGain.gain.value = 0;
    
    this.quillSource.connect(this.quillFilter);
    this.quillFilter.connect(this.quillGain);
    this.quillGain.connect(this.ctx.destination);
    
    this.quillSource.start();

    // Erratic volume envelope to simulate handwriting strokes
    const modulateVolume = () => {
      if (!this.isQuillPlaying) return;
      const now = this.ctx.currentTime;
      // Randomly spike volume for a stroke, then fade
      this.quillGain.gain.cancelScheduledValues(now);
      this.quillGain.gain.linearRampToValueAtTime(0.4 + Math.random() * 0.4, now + 0.05);
      this.quillGain.gain.exponentialRampToValueAtTime(0.1, now + 0.15 + Math.random() * 0.1);
      
      this.quillInterval = setTimeout(modulateVolume, 100 + Math.random() * 200);
    };

    modulateVolume();
  }

  stopQuill() {
    if (!this.isQuillPlaying) return;
    this.isQuillPlaying = false;
    
    if (this.quillInterval) {
      clearTimeout(this.quillInterval);
      this.quillInterval = null;
    }

    if (this.quillGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.quillGain.gain.cancelScheduledValues(now);
      this.quillGain.gain.linearRampToValueAtTime(0, now + 0.1);
    }

    setTimeout(() => {
      if (this.quillSource) {
        this.quillSource.stop();
        this.quillSource.disconnect();
        this.quillSource = null;
      }
      if (this.quillFilter) {
        this.quillFilter.disconnect();
        this.quillFilter = null;
      }
      if (this.quillGain) {
        this.quillGain.disconnect();
        this.quillGain = null;
      }
    }, 150);
  }
}

export const audioManager = new AudioManager();
