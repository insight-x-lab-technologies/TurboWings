window.TurboWingsAudio = (() => {
  class TurboWingsAudioManager {
    constructor({ getTheme, getPreferences }) {
      this.getTheme = getTheme;
      this.getPreferences = getPreferences;
      this.context = null;
      this.masterGain = null;
      this.loopTimer = null;
      this.currentMode = null;
      this.musicAudio = typeof Audio !== "undefined" ? new Audio() : null;

      if (this.musicAudio) {
        this.musicAudio.loop = true;
        this.musicAudio.preload = "auto";
      }
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

      if (this.currentMode && this.canPlayMusic()) {
        this.syncMusicPlayback();
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
      if (this.musicAudio) {
        this.musicAudio.pause();
        this.musicAudio.currentTime = 0;
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
        this.syncMusicPlayback(true);
      }
    }

    startMusic(mode) {
      if (!this.canPlayMusic()) {
        this.stopMusic();
        return;
      }

      if (this.currentMode === mode && (this.loopTimer || !this.musicAudio?.paused)) {
        return;
      }

      this.stopMusic();
      this.currentMode = mode;
      this.syncMusicPlayback(true);
    }

    syncMusicPlayback(restart = false) {
      if (!this.currentMode || !this.canPlayMusic()) {
        if (this.musicAudio) {
          this.musicAudio.pause();
        }
        return;
      }

      const theme = this.getTheme();
      const track = theme?.audio?.[this.currentMode];
      if (!track) {
        return;
      }

      if (track.src && this.musicAudio) {
        if (this.loopTimer) {
          window.clearTimeout(this.loopTimer);
          this.loopTimer = null;
        }

        const nextSrc = new URL(track.src, window.location.href).href;
        if (this.musicAudio.src !== nextSrc) {
          this.musicAudio.src = nextSrc;
          restart = true;
        }

        this.musicAudio.volume = track.volume ?? 0.22;
        if (restart) {
          this.musicAudio.currentTime = 0;
        }
        this.musicAudio.play().catch(() => {});
        return;
      }

      if (this.musicAudio) {
        this.musicAudio.pause();
      }

      if (!this.context) {
        return;
      }

      const duration = this.playPattern(track);
      this.loopTimer = window.setTimeout(() => this.syncMusicPlayback(), duration * 1000);
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
