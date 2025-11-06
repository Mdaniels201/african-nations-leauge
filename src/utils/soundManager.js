/**
 * Sound Manager for Live Match Events
 * 
 * This class manages all audio effects for the live match simulation including:
 * - Goal celebration sounds (crowd cheering)
 * - Referee whistle sounds (kickoff, halftime, fulltime)
 * - Sound file loading and fallback management
 * - Volume control and user preferences
 * 
 * The sound manager supports both WAV and MP3 files and includes fallback
 * mechanisms for when audio files fail to load.
 * 
 * @class SoundManager
 */
class SoundManager {
  /**
   * Initialize the Sound Manager
   * Sets up audio configuration and preloads sound files
   */
  constructor() {
    this.sounds = {}; // Sound configuration objects
    this.audioElements = {}; // Preloaded HTML Audio elements
    this.isEnabled = true; // Whether sounds are enabled
    this.volume = 0.7; // Master volume (0.0 to 1.0)
    this.initializeSounds(); // Load and configure all sounds
  }

  initializeSounds() {
    // Real sound files from public/sounds folder
    // Supports both .mp3 and .wav formats
    this.sounds = {
      // Goal celebration - crowd cheering
      goal: {
        src: '/sounds/goal-celebration.wav',
        fallbacks: ['/sounds/goal-celebration.mp3', '/sounds/crowd-cheer.wav', '/sounds/crowd-cheer.mp3'],
        volume: 0.8,
        duration: 3000 // 3 seconds
      },
      
      // Referee whistle - short blast
      whistle: {
        src: '/sounds/whistle-short.wav',
        fallbacks: ['/sounds/whistle-short.mp3'],
        volume: 0.6,
        duration: 800
      },
      
      // Match start/kickoff whistle
      kickoff: {
        src: '/sounds/whistle-short.wav',
        fallbacks: ['/sounds/whistle-short.mp3'],
        volume: 0.5,
        duration: 800
      },
      
      // Half-time whistle - longer blast
      halftime: {
        src: '/sounds/whistle-long.wav',
        fallbacks: ['/sounds/whistle-long.mp3', '/sounds/whistle-short.wav', '/sounds/whistle-short.mp3'],
        volume: 0.6,
        duration: 2000
      },
      
      // Full-time whistle - use short whistle since no triple file
      fulltime: {
        src: '/sounds/whistle-short.wav',
        fallbacks: ['/sounds/whistle-short.mp3'],
        volume: 0.7,
        duration: 800
      },
      
      // General crowd excitement - use goal celebration
      cheer: {
        src: '/sounds/goal-celebration.wav',
        fallbacks: ['/sounds/goal-celebration.mp3'],
        volume: 0.6,
        duration: 2000
      }
    };
    
    // Preload audio elements
    this.preloadSounds();
  }

  // Preload all sound files
  preloadSounds() {
    Object.keys(this.sounds).forEach(soundName => {
      const soundConfig = this.sounds[soundName];
      this.loadSoundWithFallbacks(soundName, soundConfig);
    });
  }

  // Load sound with multiple fallback options
  loadSoundWithFallbacks(soundName, soundConfig) {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = soundConfig.volume * this.volume;
    audio.loop = soundConfig.loop || false;
    
    let currentIndex = -1; // Start with main src
    
    const tryNextSource = () => {
      currentIndex++;
      
      let nextSrc;
      if (currentIndex === 0) {
        nextSrc = soundConfig.src; // Try main source first
      } else if (soundConfig.fallbacks && currentIndex <= soundConfig.fallbacks.length) {
        nextSrc = soundConfig.fallbacks[currentIndex - 1]; // Try fallbacks
      } else {
        console.warn(`All sources failed for sound: ${soundName}`);
        return;
      }
      
      console.log(`Loading ${soundName}: ${nextSrc}`);
      audio.src = nextSrc;
    };
    
    // Handle successful load
    audio.addEventListener('canplaythrough', () => {
      console.log(`✅ Successfully loaded ${soundName}: ${audio.src}`);
    });
    
    // Handle load errors - try next fallback
    audio.addEventListener('error', () => {
      console.warn(`❌ Failed to load ${audio.src}`);
      tryNextSource();
    });
    
    // Start loading
    tryNextSource();
    
    // Store reference
    this.audioElements[soundName] = audio;
  }

  // Generate synthetic crowd cheer using Web Audio API
  generateCrowdCheer() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 3; // 3 seconds
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(2, duration * sampleRate, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        // Create crowd-like noise with varying amplitude
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 0.5) * (1 + Math.sin(t * 10) * 0.3);
        channelData[i] = (Math.random() * 2 - 1) * envelope * 0.3;
      }
    }
    
    return this.bufferToDataURL(buffer, audioContext);
  }

  // Generate synthetic whistle sound
  generateWhistle() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 0.8; // 0.8 seconds
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      const frequency = 2000; // High pitch whistle
      const envelope = Math.exp(-t * 3) * Math.sin(t * Math.PI * 4); // Fade out
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.5;
    }
    
    return this.bufferToDataURL(buffer, audioContext);
  }

  // Generate long whistle for half-time
  generateLongWhistle() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 2; // 2 seconds
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      const frequency = 1800;
      const envelope = t < 1.5 ? 1 : Math.exp(-(t - 1.5) * 5); // Sustain then fade
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.4;
    }
    
    return this.bufferToDataURL(buffer, audioContext);
  }

  // Generate triple whistle for full-time
  generateTripleWhistle() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 3; // 3 seconds total
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      const frequency = 1800;
      
      // Three whistle blasts
      let envelope = 0;
      if (t < 0.5) envelope = Math.exp(-t * 6);
      else if (t > 1 && t < 1.5) envelope = Math.exp(-(t - 1) * 6);
      else if (t > 2 && t < 2.5) envelope = Math.exp(-(t - 2) * 6);
      
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.4;
    }
    
    return this.bufferToDataURL(buffer, audioContext);
  }

  // Generate ambient crowd noise
  generateAmbientCrowd() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 10; // 10 seconds loop
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(2, duration * sampleRate, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        const t = i / sampleRate;
        // Low-frequency crowd murmur
        const noise = (Math.random() * 2 - 1) * 0.1;
        const murmur = Math.sin(t * 0.5) * 0.05;
        channelData[i] = noise + murmur;
      }
    }
    
    return this.bufferToDataURL(buffer, audioContext);
  }

  // Convert audio buffer to data URL (simplified - in real implementation you'd use proper encoding)
  bufferToDataURL(buffer, audioContext) {
    // This is a simplified version - in production you'd want proper WAV encoding
    return 'data:audio/wav;base64,'; // Placeholder
  }

  // Play sound by name
  async playSound(soundName, options = {}) {
    if (!this.isEnabled) return;
    
    try {
      const audio = this.audioElements[soundName];
      if (!audio) {
        console.warn(`Sound '${soundName}' not found`);
        return;
      }

      // Reset audio to beginning
      audio.currentTime = 0;
      
      // Update volume
      audio.volume = (this.sounds[soundName].volume || 0.5) * this.volume;
      
      // Special handling for full-time (play 3 times)
      if (soundName === 'fulltime' && !this.sounds[soundName].src.includes('triple')) {
        // If we don't have a triple whistle file, play single whistle 3 times
        await this.playTripleWhistle();
        return;
      }
      
      // Play the sound
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
      }
      
    } catch (error) {
      console.warn(`Could not play sound '${soundName}':`, error);
      // Fallback to synthetic sound generation
      this.playFallbackSound(soundName);
    }
  }

  // Play triple whistle if no triple file available
  async playTripleWhistle() {
    const whistleAudio = this.audioElements['whistle'];
    if (!whistleAudio) return;
    
    for (let i = 0; i < 3; i++) {
      setTimeout(async () => {
        try {
          whistleAudio.currentTime = 0;
          await whistleAudio.play();
        } catch (error) {
          console.warn('Error playing whistle:', error);
        }
      }, i * 600); // 600ms between whistles
    }
  }

  // Simplified sound generation using Web Audio API
  async playGoalSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a more complex goal celebration sound
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Celebration chord
    oscillator1.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator2.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
    
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    
    // Envelope for celebration effect
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
    
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 2);
    oscillator2.stop(audioContext.currentTime + 2);
  }

  async playWhistleSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(2000, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.8);
  }

  async playHalftimeWhistle() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(1800, audioContext.currentTime);
    oscillator.type = 'sine';
    
    // Longer whistle for half-time
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime + 1.5);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 2);
  }

  async playFulltimeWhistle() {
    // Three short whistle blasts
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playWhistleSound();
      }, i * 600);
    }
  }

  stopAmbient() {
    // No ambient sounds to stop anymore
    console.log('No ambient sounds in use');
  }

  // Fallback to synthetic sounds if files fail
  playFallbackSound(soundName) {
    switch (soundName) {
      case 'goal':
        this.playGoalSound();
        break;
      case 'whistle':
      case 'kickoff':
        this.playWhistleSound();
        break;
      case 'halftime':
        this.playHalftimeWhistle();
        break;
      case 'fulltime':
        this.playFulltimeWhistle();
        break;
      default:
        console.warn(`No fallback for sound: ${soundName}`);
    }
  }

  // Control methods
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
    this.stopAmbient();
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled) {
      this.stopAmbient();
    }
  }
}

// Create singleton instance
const soundManager = new SoundManager();

export default soundManager;