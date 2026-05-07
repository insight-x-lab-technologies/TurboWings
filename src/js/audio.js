window.TurboWingsAudio = (() => {
  class TurboWingsAudioManager {
    constructor({ getTheme, getPreferences }) {
      this.getTheme = getTheme;
      this.getPreferences = getPreferences;
      this.context = null;
      this.masterGain = null;
      this.loopTimer = null;
      this.currentMode = null;
    }

    ensureContext() {
      if (this.context) {
        return;
      }

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        return;
      }

      this.context = new AudioContextClass();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.9;
      this.masterGain.connect(this.context.destination);
    }

    unlock() {
      this.ensureContext();
      if (this.context && this.context.state === "suspended") {
        this.context.resume().catch(() => {});
      }

      if (this.context && this.currentMode && !this.loopTimer && this.canPlayMusic()) {
        this.scheduleMusicLoop();
      }
    }

    canPlayMusic() {
      return !!this.getPreferences()?.musicEnabled;
    }

    canPlaySfx() {
      return !!this.getPreferences()?.sfxEnabled;
    }

    canPlayGameplaySfx() {
      return !!this.getPreferences()?.gameplayAudioEnabled;
    }

    stopMusic() {
      if (this.loopTimer) {
        window.clearTimeout(this.loopTimer);
        this.loopTimer = null;
      }
      this.currentMode = null;
    }

    startMenuMusic() {
      this.startMusic("menu");
    }

    startGameplayMusic() {
      this.startMusic("gameplay");
    }

    refreshTheme() {
      if (this.currentMode) {
        this.startMusic(this.currentMode);
      }
    }

    startMusic(mode) {
      if (!this.canPlayMusic()) {
        this.stopMusic();
        return;
      }

      if (!this.context) {
        this.currentMode = mode;
        return;
      }

      if (this.currentMode === mode && this.loopTimer) {
        return;
      }

      this.stopMusic();
      this.currentMode = mode;
      this.scheduleMusicLoop();
    }

    scheduleMusicLoop() {
      if (!this.context || !this.currentMode || !this.canPlayMusic()) {
        return;
      }

      const theme = this.getTheme();
      const pattern = theme?.audio?.[this.currentMode];
      if (!pattern) {
        return;
      }

      const duration = this.playPattern(pattern);
      this.loopTimer = window.setTimeout(() => this.scheduleMusicLoop(), duration * 1000);
    }

    playButton() {
      this.playNamedPattern("button");
    }

    playNavigation() {
      this.playNamedPattern("navigation");
    }

    playGameplaySfx(name, variant = null) {
      if (!this.context || !this.canPlayGameplaySfx()) {
        return;
      }

      const theme = this.getTheme();
      const library = theme?.audio?.gameplaySfx;
      if (!library) {
        return;
      }

      const keyedName = variant ? `${name}:${variant}` : name;
      const pattern = library[keyedName] || library[name];
      if (!pattern) {
        return;
      }

      this.playPattern(pattern, this.context.currentTime + 0.008);
    }

    playNamedPattern(name) {
      if (!this.context || !this.canPlaySfx()) {
        return;
      }

      const theme = this.getTheme();
      const pattern = theme?.audio?.[name];
      if (!pattern) {
        return;
      }

      this.playPattern(pattern, this.context.currentTime + 0.01);
    }

    playPattern(pattern, startTime = null) {
      const now = startTime ?? this.context.currentTime + 0.02;
      let cursor = now;
      const wave = pattern.wave || "triangle";
      const volume = pattern.volume || 0.04;

      for (const note of pattern.pattern) {
        const [frequency, duration, gap = 0.02] = note;
        if (frequency > 0) {
          this.playTone(frequency, cursor, duration, wave, volume);
          this.playTone(frequency * 0.5, cursor, duration * 0.86, "sine", volume * 0.42);
        }
        cursor += duration + gap;
      }

      return Math.max(0.4, cursor - now + 0.18);
    }

    playTone(frequency, start, duration, wave, volume) {
      const oscillator = this.context.createOscillator();
      const gainNode = this.context.createGain();

      oscillator.type = wave;
      oscillator.frequency.setValueAtTime(frequency, start);

      gainNode.gain.setValueAtTime(0.0001, start);
      gainNode.gain.exponentialRampToValueAtTime(volume, start + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.04);
    }
  }

  return { TurboWingsAudioManager };
})();
