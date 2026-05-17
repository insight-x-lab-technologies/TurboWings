window.TurboWingsGameplay = (() => {
  const BEST_SCORE_KEY = "turbo-wings-best-score";
  const DEFAULT_DIFFICULTY_ID = "normal";

  const POWERUP_DURATIONS = {
    shield: 8,
    magnet: 6,
    slow: 5
  };

  const DIFFICULTY_DEFINITIONS = [
    {
      id: "breeze",
      level: 1,
      labelKey: "difficulty.breeze",
      descriptionKey: "difficulty.breezeDescription",
      baseSpeed: 192,
      speedGrowth: 4.1,
      baseGap: 250,
      minGap: 184,
      spawnDelay: 1.56,
      gravity: 1360,
      flapStrength: -425
    },
    {
      id: "normal",
      level: 2,
      labelKey: "difficulty.normal",
      descriptionKey: "difficulty.normalDescription",
      baseSpeed: 248,
      speedGrowth: 7.5,
      baseGap: 220,
      minGap: 150,
      spawnDelay: 1.35,
      gravity: 1450,
      flapStrength: -460
    },
    {
      id: "storm",
      level: 3,
      labelKey: "difficulty.storm",
      descriptionKey: "difficulty.stormDescription",
      baseSpeed: 284,
      speedGrowth: 8.6,
      baseGap: 194,
      minGap: 138,
      spawnDelay: 1.14,
      gravity: 1505,
      flapStrength: -470
    },
    {
      id: "turbo",
      level: 4,
      labelKey: "difficulty.turbo",
      descriptionKey: "difficulty.turboDescription",
      baseSpeed: 326,
      speedGrowth: 9.4,
      baseGap: 176,
      minGap: 126,
      spawnDelay: 0.98,
      gravity: 1540,
      flapStrength: -478,
      unlockRequirement: {
        difficultyId: "storm",
        score: 100
      }
    },
    {
      id: "legend",
      level: 5,
      labelKey: "difficulty.legend",
      descriptionKey: "difficulty.legendDescription",
      baseSpeed: 365,
      speedGrowth: 10.4,
      baseGap: 162,
      minGap: 118,
      spawnDelay: 0.86,
      gravity: 1570,
      flapStrength: -486,
      unlockRequirement: {
        difficultyId: "turbo",
        score: 100
      }
    }
  ];

  const OBSTACLE_VARIANTS = [
    { type: "building", minFlightLevel: 1, weight: 6 },
    { type: "highrise", minFlightLevel: 2, weight: 5 },
    { type: "tower", minFlightLevel: 3, weight: 4 },
    { type: "crane", minFlightLevel: 4, weight: 3 }
  ];

  // ─── OBSTACLE IMAGE CROP (top inset) ─────────────────────────────────────
  // Fraction of the source image height to SKIP at the antenna/spire tip.
  // Applied only when DRAWING — collision boundaries stay at gapTop/gapBottom
  // unchanged, so game difficulty is not affected.
  // Index matches buildObstacleList() in themes.js:
  //   0 → v1_default_game_obstacle_1.png   (5 %)
  //   1 → v1_default_game_obstacle_3.png   (5 %)
  //   2 → v1_default_game_obstacle_7.png   (3 %)
  //   3 → v1_default_game_obstacle_5.png   (9 %)
  //   4 → v1_default_game_obstacle_11.png  (3 %)
  const OBSTACLE_TOP_INSETS = [0.05, 0.05, 0.03, 0.09, 0.03];
  // ─────────────────────────────────────────────────────────────────────────

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function createThemeImage(src) {
    if (!src) {
      return null;
    }

    const image = new Image();
    image.src = src;
    return image;
  }

  function getDifficultyDefinitions() {
    return DIFFICULTY_DEFINITIONS.map((difficulty) => ({ ...difficulty }));
  }

  function getDifficultyById(difficultyId) {
    return (
      DIFFICULTY_DEFINITIONS.find((difficulty) => difficulty.id === difficultyId) ||
      DIFFICULTY_DEFINITIONS.find((difficulty) => difficulty.id === DEFAULT_DIFFICULTY_ID)
    );
  }

  class TurboWingsGame {
    constructor({
      canvas,
      getTheme,
      onScoreChange,
      onCoinsChange,
      onEffectsChange,
      onFlightLevelChange,
      onBestScoreChange,
      onPhaseChange,
      onGameOver,
      playSound
    }) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.getTheme = getTheme;
      this.onScoreChange = onScoreChange;
      this.onCoinsChange = onCoinsChange;
      this.onEffectsChange = onEffectsChange;
      this.onFlightLevelChange = onFlightLevelChange;
      this.onBestScoreChange = onBestScoreChange;
      this.onPhaseChange = onPhaseChange;
      this.onGameOver = onGameOver;
      this.playSound = playSound;

      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      this.animationFrame = 0;
      this.lastTime = 0;
      this.isLoopRunning = false;
      this.isInteractive = false;

      this.bestScore = this.readBestScore();
      this.activeDifficultyId = DEFAULT_DIFFICULTY_ID;
      this.activeThemeId = "city-day";
      this.activeTuning = { speedPercent: 100, gapPercent: 100 };
      this.featureFlags = {
        obstaclesEnabled: true,
        powerUpsEnabled: true,
        coinsEnabled: true,
        effectsEnabled: true
      };
      this.effectSignature = "";
      this.debugCollisionEnabled = false;
      this.flightLevel = 1;
      this.themeAssets = {
        themeId: null,
        background: null,
        plane: null,
        planeFrame: null,
        obstacles: [],
        icons: {}
      };

      this.handlePointerDown = this.handlePointerDown.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleResize = this.handleResize.bind(this);
      this.loop = this.loop.bind(this);

      this.canvas.addEventListener("pointerdown", this.handlePointerDown, { passive: false });
      window.addEventListener("keydown", this.handleKeyDown);
      window.addEventListener("resize", this.handleResize);

      this.reset();
      this.resize();
      this.preloadThemeAssets();
    }

    readBestScore() {
      const storedValue = window.localStorage.getItem(BEST_SCORE_KEY);
      const parsedValue = Number.parseInt(storedValue || "0", 10);
      return Number.isFinite(parsedValue) ? parsedValue : 0;
    }

    getBestScore() {
      return this.bestScore;
    }

    preloadThemeAssets(themeId = this.activeThemeId) {
      const theme = this.getTheme?.(themeId);
      const assets = theme?.assets;
      if (!assets || this.themeAssets.themeId === themeId) {
        return;
      }

      this.themeAssets = {
        themeId,
        background: createThemeImage(assets.backgroundImage),
        plane: createThemeImage(assets.gameplayJet),
        planeFrame: assets.gameplayJetFrame || null,
        obstacles: Array.isArray(assets.obstacles)
          ? assets.obstacles.map((path) => createThemeImage(path)).filter(Boolean)
          : [],
        icons: {
          coin: createThemeImage(assets.icons?.coinGold || assets.icons?.coin),
          powerupShield: createThemeImage(assets.icons?.powerupShield),
          powerupMagnet: createThemeImage(assets.icons?.powerupMagnet),
          powerupSlow: createThemeImage(assets.icons?.powerupSlow)
        }
      };

      [
        this.themeAssets.background,
        this.themeAssets.plane,
        ...this.themeAssets.obstacles,
        ...Object.values(this.themeAssets.icons)
      ]
        .filter(Boolean)
        .forEach((image) => {
          if (!image.complete) {
            image.addEventListener("load", () => this.draw(), { once: true });
          }
        });
    }

    persistBestScore(score) {
      if (score <= this.bestScore) {
        return;
      }

      this.bestScore = score;
      window.localStorage.setItem(BEST_SCORE_KEY, String(score));
      this.onBestScoreChange?.(score);
    }

    applyDifficultyConfig(difficultyId, tuning = {}) {
      const difficulty = getDifficultyById(difficultyId);
      const speedPercent = Number.isFinite(Number(tuning.speedPercent))
        ? Number(tuning.speedPercent)
        : 100;
      const gapPercent = Number.isFinite(Number(tuning.gapPercent))
        ? Number(tuning.gapPercent)
        : 100;

      this.activeDifficultyId = difficulty.id;
      this.activeTuning = { speedPercent, gapPercent };
      this.gravity = difficulty.gravity;
      this.flapStrength = difficulty.flapStrength;
      this.baseSpeed = difficulty.baseSpeed * (speedPercent / 100);
      this.speedGrowth = difficulty.speedGrowth * Math.max(0.82, speedPercent / 100);
      this.baseGap = difficulty.baseGap * (gapPercent / 100);
      this.minGap = difficulty.minGap * (gapPercent / 100);
      this.baseSpawnDelay = difficulty.spawnDelay;
    }

    reset() {
      this.score = 0;
      this.runCoins = 0;
      this.distance = 0;
      this.started = false;
      this.paused = false;
      this.ended = false;
      this.elapsed = 0;
      this.spawnCooldown = 1.25;
      this.powerupCooldown = 2.5;
      this.invulnerableTimer = 0;
      this.flightLevel = 1;
      this.maxFlightLevelReached = 1;
      this.effectSignature = "";
      this.difficultyState = null;
      this.soundCooldowns = {};
      this.backgroundScrollX = 0;
      this.runMetrics = {
        powerUpsCollected: 0,
        obstaclesPassed: 0,
        shieldSaves: 0,
        coinsCollectedWithMagnet: 0,
        totalCollisions: 0
      };

      this.clouds = [];
      this.obstacles = [];
      this.cityLayers = [];
      this.trail = [];
      this.coins = [];
      this.powerups = [];
      this.particles = [];
      this.activeEffects = {
        shield: 0,
        magnet: 0,
        slow: 0
      };

      this.groundPadding = 36;
      this.ceilingPadding = 20;
      this.obstacleWidth = 0;

      this.plane = {
        x: Math.min(this.width * 0.28, 180),
        y: this.height * 0.5,
        velocity: 0,
        radius: 24,
        bob: 0,
        rotation: 0
      };

      this.applyDifficultyConfig(this.activeDifficultyId, this.activeTuning);
      this.updateResponsiveMetrics();
      this.seedClouds();
      this.generateCityLayers();
      this.spawnCooldown = this.baseSpawnDelay + 0.48;
      this.updateDifficultyState(true);
      this.onScoreChange?.(0);
      this.onCoinsChange?.(0);
      this.notifyEffectsChange(true);
      this.onPhaseChange?.("ready");
    }

    updateResponsiveMetrics() {
      this.plane.x = Math.min(this.width * 0.23, 270);
      this.plane.radius = clamp(this.width * 0.028, 24, 34) * 0.5;
      this.obstacleWidth = clamp(this.width * 0.12, 116, 184);
      this.baseGap = Math.max(152, this.baseGap);
      this.minGap = Math.max(118, this.minGap);
      this.groundPadding = clamp(this.height * 0.04, 26, 40);
      this.ceilingPadding = clamp(this.height * 0.02, 12, 22);
    }

    seedClouds() {
      const cloudCount = Math.max(7, Math.min(12, Math.round(this.width / 170)));
      this.clouds = Array.from({ length: cloudCount }, (_, index) => {
        const farLayer = index % 3 === 0;
        return {
          x: (index / cloudCount) * this.width,
          y: this.height * (0.08 + Math.random() * 0.42),
          width: 90 + Math.random() * 130,
          height: 28 + Math.random() * 26,
          speed: farLayer ? 10 + Math.random() * 12 : 16 + Math.random() * 20,
          depth: farLayer ? 0.45 + Math.random() * 0.18 : 0.72 + Math.random() * 0.34,
          opacity: farLayer ? 0.28 + Math.random() * 0.14 : 0.5 + Math.random() * 0.22
        };
      });
    }

    generateCityLayers() {
      const createLayer = (colorKey, speedFactor, baseHeight, variance) => {
        const buildings = [];
        let cursor = -40;

        while (cursor < this.width + 180) {
          const width = 40 + Math.random() * 60;
          const height = baseHeight + Math.random() * variance;
          buildings.push({ x: cursor, width, height });
          cursor += width + 14 + Math.random() * 20;
        }

        return { colorKey, speedFactor, buildings };
      };

      this.cityLayers = [
        createLayer("cityBack", 0.12, this.height * 0.12, this.height * 0.1),
        createLayer("cityMid", 0.24, this.height * 0.18, this.height * 0.14),
        createLayer("cityFront", 0.4, this.height * 0.24, this.height * 0.18)
      ];
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;

      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.updateResponsiveMetrics();
      this.generateCityLayers();
      this.draw();
    }

    handleResize() {
      this.resize();
    }

    handlePointerDown(event) {
      if (!this.isInteractive) {
        return;
      }

      event.preventDefault();
      this.flap();
    }

    handleKeyDown(event) {
      if (!this.isInteractive) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        this.flap();
        return;
      }

      if (event.code === "KeyP") {
        event.preventDefault();
        this.togglePause();
      }
    }

    enter({
      difficultyId = DEFAULT_DIFFICULTY_ID,
      tuning = {},
      themeId = "default",
      features = {},
      rng = null
    } = {}) {
      this.rng = typeof rng === "function" ? rng : Math.random.bind(Math);
      this.isInteractive = true;
      this.activeThemeId = themeId;
      this.preloadThemeAssets(themeId);
      this.featureFlags = { ...this.featureFlags, ...features };
      this.applyDifficultyConfig(difficultyId, tuning);
      this.reset();
      this.draw();
      this.startLoop();
    }

    startLoop() {
      if (this.isLoopRunning) {
        return;
      }

      this.isLoopRunning = true;
      this.lastTime = performance.now();
      this.animationFrame = requestAnimationFrame(this.loop);
    }

    haltLoop() {
      if (!this.isLoopRunning) {
        return;
      }

      this.isLoopRunning = false;
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = 0;
    }

    stop() {
      this.isInteractive = false;
      this.haltLoop();
    }

    setTheme(themeId = this.activeThemeId) {
      this.activeThemeId = themeId;
      this.preloadThemeAssets(themeId);
      this.draw();
    }

    setCollisionDebug(enabled) {
      this.debugCollisionEnabled = !!enabled;
      this.draw();
    }

    flap() {
      if (this.ended || this.paused) {
        return;
      }

      if (!this.started) {
        this.started = true;
        this.onPhaseChange?.("playing");
      }

      this.playSoundOnce("flap", 0.06);
      this.plane.velocity = this.flapStrength;
      this.trail.push({
        x: this.plane.x - this.plane.radius * 0.2,
        y: this.plane.y,
        life: 0.52,
        radius: 9 + Math.random() * 5
      });
    }

    togglePause(forceState) {
      if (this.ended || !this.started) {
        return;
      }

      const nextState = typeof forceState === "boolean" ? forceState : !this.paused;
      if (nextState === this.paused) {
        return;
      }

      this.paused = nextState;
      if (this.paused) {
        this.playSoundOnce("pause", 0.12);
        this.haltLoop();
        this.draw();
        this.onPhaseChange?.("paused");
        return;
      }

      this.playSoundOnce("resume", 0.12);
      this.onPhaseChange?.("playing");
      this.startLoop();
    }

    loop(timestamp) {
      if (!this.isLoopRunning) {
        return;
      }

      const delta = Math.min((timestamp - this.lastTime) / 1000, 0.033);
      this.lastTime = timestamp;

      if (!this.paused && !this.ended) {
        this.update(delta);
      }

      this.draw();

      if (this.isLoopRunning) {
        this.animationFrame = requestAnimationFrame(this.loop);
      }
    }

    update(delta) {
      this.updateSoundCooldowns(delta);
      this.updateEffectTimers(delta);
      const difficultyState = this.updateDifficultyState();
      const worldMultiplier = this.activeEffects.slow > 0 ? 0.62 : 1;
      const worldSpeed = difficultyState.worldSpeed * worldMultiplier;

      if (this.started) {
        this.elapsed += delta;
        this.distance += worldSpeed * delta;
      }

      this.powerupCooldown = Math.max(0, this.powerupCooldown - delta);
      this.invulnerableTimer = Math.max(0, this.invulnerableTimer - delta);

      this.updateClouds(delta, worldMultiplier, this.started);
      this.updateBackgroundScroll(delta, worldSpeed, this.started);
      this.updateTrail(delta);
      this.updateParticles(delta);

      if (!this.started) {
        this.plane.bob += delta * 3.2;
        this.plane.y = this.height * 0.5 + Math.sin(this.plane.bob) * 8;
        this.plane.rotation = -0.08 + Math.sin(this.plane.bob * 0.8) * 0.04;
        return;
      }

      this.plane.velocity += this.gravity * delta;
      this.plane.y += this.plane.velocity * delta;
      this.plane.rotation = Math.max(-0.52, Math.min(1.08, this.plane.velocity / 530));

      this.spawnCooldown -= delta;
      if (this.spawnCooldown <= 0) {
        this.spawnObstacle(difficultyState);
        this.spawnCooldown = difficultyState.spawnDelay * (0.92 + this.rng() * 0.16);
      }

      this.updateObstacles(delta, worldSpeed);
      this.updateCoins(delta, worldSpeed);
      this.updatePowerups(delta, worldSpeed);

      const collision = this.getCollision();
      if (collision) {
        if (this.activeEffects.shield > 0) {
          this.consumeShield(collision);
        } else {
          this.playSoundOnce("collision", 0.18);
          this.endRun(collision);
        }
      }
    }

    updateSoundCooldowns(delta) {
      Object.keys(this.soundCooldowns).forEach((key) => {
        this.soundCooldowns[key] = Math.max(0, this.soundCooldowns[key] - delta);
      });
    }

    playSoundOnce(name, cooldown = 0.08, variant = null) {
      if ((this.soundCooldowns[name] || 0) > 0) {
        return;
      }

      this.soundCooldowns[name] = cooldown;
      this.playSound?.(name, variant);
    }

    calculateDifficultyState() {
      const progressScore = Math.max(0, this.score - 1);
      const survivalPressure = Math.max(0, this.elapsed - 5);
      const flightLevel = 1 + Math.floor(Math.max(this.score / 7, this.elapsed / 16));
      const levelPressure = Math.max(0, flightLevel - 1);

      const worldSpeed =
        this.baseSpeed +
        Math.min(245, survivalPressure * 3.6 + progressScore * this.speedGrowth + levelPressure * 10);
      const gapSize = clamp(
        this.baseGap - levelPressure * 8 - progressScore * 0.8,
        this.minGap,
        this.baseGap
      );
      const spawnDelay = clamp(
        this.baseSpawnDelay - levelPressure * 0.028 - progressScore * 0.003,
        0.64,
        this.baseSpawnDelay + 0.08
      );

      return {
        flightLevel,
        worldSpeed,
        gapSize,
        spawnDelay,
        specialStage: clamp(flightLevel, 1, 6)
      };
    }

    updateDifficultyState(force = false) {
      this.difficultyState = this.calculateDifficultyState();
      if (force || this.difficultyState.flightLevel !== this.flightLevel) {
        this.flightLevel = this.difficultyState.flightLevel;
        this.maxFlightLevelReached = Math.max(this.maxFlightLevelReached, this.flightLevel);
        this.onFlightLevelChange?.(this.flightLevel);
      }
      return this.difficultyState;
    }

    updateEffectTimers(delta) {
      let changed = false;
      Object.keys(this.activeEffects).forEach((key) => {
        const nextValue = Math.max(0, this.activeEffects[key] - delta);
        if (nextValue !== this.activeEffects[key]) {
          this.activeEffects[key] = nextValue;
          changed = true;
        }
      });

      if (changed) {
        this.notifyEffectsChange();
      }
    }

    notifyEffectsChange(force = false) {
      const effects = Object.entries(this.activeEffects)
        .filter(([, remaining]) => remaining > 0)
        .map(([type, remaining]) => ({
          type,
          remaining: Math.max(0, Math.round(remaining * 10) / 10)
        }));

      const nextSignature = JSON.stringify(effects);
      if (force || nextSignature !== this.effectSignature) {
        this.effectSignature = nextSignature;
        this.onEffectsChange?.(effects);
      }
    }

    updateClouds(delta, worldMultiplier, moving) {
      if (!this.featureFlags.effectsEnabled) {
        return;
      }

      const speedBoost = moving ? 0.7 + worldMultiplier * 0.34 : 0.58;
      for (const cloud of this.clouds) {
        cloud.x -= cloud.speed * cloud.depth * delta * speedBoost;
        if (cloud.x + cloud.width * 1.8 < 0) {
          cloud.x = this.width + cloud.width * 0.5;
          cloud.y = this.height * (0.08 + Math.random() * 0.38);
        }
      }
    }

    updateBackgroundScroll(delta, worldSpeed, moving) {
      const image = this.themeAssets.background;
      if (!image?.naturalWidth || !image?.naturalHeight) {
        return;
      }

      const idleSpeed = 18;
      const parallaxFactor = 0.18;
      const scrollSpeed = moving ? worldSpeed * parallaxFactor : idleSpeed;
      const drawWidth = Math.max(
        1,
        this.height * (image.naturalWidth / image.naturalHeight)
      );

      this.backgroundScrollX =
        (this.backgroundScrollX + scrollSpeed * delta) % drawWidth;
    }

    updateTrail(delta) {
      if (!this.featureFlags.effectsEnabled) {
        this.trail = [];
        return;
      }

      this.trail = this.trail
        .map((particle) => ({
          ...particle,
          x: particle.x - 80 * delta,
          y: particle.y + (Math.random() - 0.5) * 10 * delta,
          life: particle.life - delta
        }))
        .filter((particle) => particle.life > 0);
    }

    updateParticles(delta) {
      if (!this.featureFlags.effectsEnabled) {
        this.particles = [];
        return;
      }

      this.particles = this.particles
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.vx * delta,
          y: particle.y + particle.vy * delta,
          vx: particle.vx * (particle.drag || 0.98),
          vy: particle.vy * (particle.drag || 0.98) + (particle.gravity || 0) * delta,
          life: particle.life - delta,
          size: Math.max(0, particle.size * (particle.shrink || 1))
        }))
        .filter((particle) => particle.life > 0 && particle.size > 0.4);
    }

    updateObstacles(delta, worldSpeed) {
      const nextObstacles = [];

      for (const obstacle of this.obstacles) {
        obstacle.x -= worldSpeed * delta;
        obstacle.phase += delta;

        for (const hazard of obstacle.hazards) {
          hazard.phase += delta * hazard.phaseSpeed;
          hazard.currentY = hazard.baseY + Math.sin(hazard.phase) * hazard.bobAmplitude;
          hazard.swayX =
            hazard.type === "drone" ? Math.sin(hazard.phase * 1.8) * hazard.swayAmplitude : 0;
        }

        for (const veil of obstacle.veils) {
          veil.phase += delta * veil.phaseSpeed;
          veil.offsetY = Math.sin(veil.phase) * veil.driftAmplitude;
        }

        if (!obstacle.scored && obstacle.x + obstacle.width < this.plane.x) {
          obstacle.scored = true;
          this.score += 1;
          this.runMetrics.obstaclesPassed += 1;
          this.onScoreChange?.(this.score);
        }

        if (obstacle.x + obstacle.width > -120) {
          nextObstacles.push(obstacle);
        }
      }

      this.obstacles = nextObstacles;
    }

    updateCoins(delta, worldSpeed) {
      if (!this.featureFlags.coinsEnabled) {
        this.coins = [];
        return;
      }

      const collectionRadius = this.plane.radius + 16;
      const magnetRange = 180;
      const nextCoins = [];

      for (const coin of this.coins) {
        coin.x -= worldSpeed * delta;
        coin.phase += delta * 7;
        coin.glint += delta * 4.5;

        if (this.activeEffects.magnet > 0) {
          const dx = this.plane.x - coin.x;
          const dy = this.plane.y - coin.y;
          const distance = Math.hypot(dx, dy);
          if (distance < magnetRange) {
            const pull = (1 - distance / magnetRange) * 620 * delta;
            if (distance > 0.001) {
              coin.x += (dx / distance) * pull;
              coin.y += (dy / distance) * pull;
            }
          }
        }

        const distanceToPlane = Math.hypot(this.plane.x - coin.x, this.plane.y - coin.y);
        if (distanceToPlane <= collectionRadius) {
          this.runCoins += 1;
          if (this.activeEffects.magnet > 0) {
            this.runMetrics.coinsCollectedWithMagnet += 1;
          }
          this.onCoinsChange?.(this.runCoins);
          this.spawnBurst(coin.x, coin.y, "#ffd54f", 4, 74, 1.16);
          this.spawnRing(coin.x, coin.y, "#fff2a6", 11, 0.2);
          this.playSoundOnce("coin", 0.05);
          continue;
        }

        if (coin.x + coin.radius > -24) {
          nextCoins.push(coin);
        }
      }

      this.coins = nextCoins;
    }

    updatePowerups(delta, worldSpeed) {
      if (!this.featureFlags.powerUpsEnabled) {
        this.powerups = [];
        return;
      }

      const pickupRadius = this.plane.radius + 20;
      const nextPowerups = [];

      for (const powerup of this.powerups) {
        powerup.x -= worldSpeed * delta;
        powerup.phase += delta * 4.4;

        const distanceToPlane = Math.hypot(this.plane.x - powerup.x, this.plane.y - powerup.y);
        if (distanceToPlane <= pickupRadius) {
          this.activatePowerup(powerup.type, powerup.x, powerup.y);
          continue;
        }

        if (powerup.x + powerup.radius > -24) {
          nextPowerups.push(powerup);
        }
      }

      this.powerups = nextPowerups;
    }

    activatePowerup(type, x, y) {
      this.activeEffects[type] = POWERUP_DURATIONS[type];
      this.runMetrics.powerUpsCollected += 1;
      this.notifyEffectsChange(true);
      this.spawnBurst(x, y, this.getPowerupColor(type), 6, 96, 1.2);
      this.spawnRing(x, y, this.getPowerupColor(type), 15, 0.24);
      this.playSoundOnce("powerup", 0.08);
    }

    getPowerupColor(type) {
      if (type === "shield") {
        return "#7be7ff";
      }
      if (type === "magnet") {
        return "#ffd166";
      }
      return "#8fb6ff";
    }

    consumeShield(collision) {
      this.activeEffects.shield = 0;
      this.invulnerableTimer = 0.8;
      this.runMetrics.shieldSaves += 1;
      this.notifyEffectsChange(true);
      this.spawnBurst(this.plane.x, this.plane.y, "#8feaff", 8, 112, 1.16);
      this.spawnRing(this.plane.x, this.plane.y, "#8feaff", this.plane.radius * 1.5, 0.26);
      this.playSoundOnce("shield", 0.12);

      if (collision.kind === "hazard" && collision.hazard) {
        collision.obstacle.hazards = collision.obstacle.hazards.filter(
          (hazard) => hazard !== collision.hazard
        );
      }

      if (collision.kind === "boundary-top") {
        this.plane.y = this.ceilingPadding + this.plane.radius * 0.86 + 4;
        this.plane.velocity = 180;
        return;
      }

      if (collision.kind === "boundary-bottom") {
        this.plane.y = this.height - this.groundPadding - this.plane.radius * 0.86 - 4;
        this.plane.velocity = -240;
        return;
      }

      const obstacle = collision.obstacle;
      if (!obstacle) {
        this.plane.velocity = -210;
        return;
      }

      const gapTop = obstacle.gapY - obstacle.gapHeight * 0.5;
      const gapBottom = obstacle.gapY + obstacle.gapHeight * 0.5;
      const planeHalf = this.plane.radius * 0.62;
      const safeMargin = 12;
      const obstacleMid = gapTop + (gapBottom - gapTop) * 0.5;

      if (this.plane.y < obstacleMid) {
        this.plane.y = gapTop + planeHalf + safeMargin;
        this.plane.velocity = 150;
      } else {
        this.plane.y = gapBottom - planeHalf - safeMargin;
        this.plane.velocity = -220;
      }
    }

    pickObstacleVariant(flightLevel) {
      const candidates = OBSTACLE_VARIANTS.filter(
        (variant) => flightLevel >= variant.minFlightLevel
      );
      const totalWeight = candidates.reduce((sum, variant) => sum + variant.weight, 0);
      let cursor = this.rng() * totalWeight;

      for (const variant of candidates) {
        cursor -= variant.weight;
        if (cursor <= 0) {
          return variant.type;
        }
      }

      return candidates[candidates.length - 1]?.type || "building";
    }

    pickObstacleAssetIndex(flightLevel) {
      const availableCount = Math.max(1, this.themeAssets.obstacles.length || 0);
      if (availableCount === 1) {
        return 0;
      }

      const maxAssetIndex = Math.min(
        availableCount - 1,
        Math.floor((Math.max(1, flightLevel) - 1) * 2.5)
      );
      return Math.floor(this.rng() * (maxAssetIndex + 1));
    }

    spawnObstacle(difficultyState) {
      const paddingTop = this.height * 0.12;
      const paddingBottom = this.height * 0.12;
      const gapSize = difficultyState.gapSize;
      const maxGapCenter = this.height - paddingBottom - gapSize * 0.5;
      const minGapCenter = paddingTop + gapSize * 0.5;
      const gapCenter = minGapCenter + this.rng() * Math.max(24, maxGapCenter - minGapCenter);
      const obstacleX = this.width + this.obstacleWidth + this.rng() * 34;

      const obstacle = {
        x: obstacleX,
        width: this.obstacleWidth,
        gapY: gapCenter,
        gapHeight: gapSize,
        scored: false,
        phase: this.rng() * Math.PI * 2,
        accentOffset: this.rng() * 20,
        topStyle: this.pickObstacleVariant(difficultyState.flightLevel),
        bottomStyle: this.pickObstacleVariant(difficultyState.flightLevel),
        topAssetIndex: this.pickObstacleAssetIndex(difficultyState.flightLevel),
        bottomAssetIndex: this.pickObstacleAssetIndex(difficultyState.flightLevel),
        hazards: [],
        veils: []
      };

      this.attachSpecialTraffic(obstacle, difficultyState);
      this.spawnCollectiblesForGap(obstacle, difficultyState);
      this.obstacles.push(obstacle);
    }

    attachSpecialTraffic(obstacle, difficultyState) {
      const safeMargin = clamp(obstacle.gapHeight * 0.18, 24, 42);
      const minY = obstacle.gapY - obstacle.gapHeight * 0.5 + safeMargin;
      const maxY = obstacle.gapY + obstacle.gapHeight * 0.5 - safeMargin;

      if (difficultyState.flightLevel >= 2 && this.rng() < 0.32) {
        obstacle.veils.push({
          offsetX: obstacle.width * (0.22 + this.rng() * 0.26),
          y: minY + (maxY - minY) * (0.22 + this.rng() * 0.56),
          width: 90 + this.rng() * 34,
          height: 34 + this.rng() * 14,
          phase: this.rng() * Math.PI * 2,
          phaseSpeed: 0.5 + this.rng() * 0.3,
          driftAmplitude: 8 + this.rng() * 5,
          offsetY: 0,
          alpha: 0.22 + this.rng() * 0.1
        });
      }

      const hazardChance = difficultyState.flightLevel >= 5 ? 0.34 : difficultyState.flightLevel >= 3 ? 0.26 : 0.16;
      if (difficultyState.flightLevel < 2 || this.rng() >= hazardChance) {
        return;
      }

      const available = [];
      if (difficultyState.flightLevel >= 2) {
        available.push("balloon");
      }
      if (difficultyState.flightLevel >= 3) {
        available.push("drone");
      }

      const type = available[Math.floor(this.rng() * available.length)];
      if (type === "balloon") {
        obstacle.hazards.push({
          type,
          offsetX: obstacle.width * 0.5 + 18 + this.rng() * 18,
          baseY: minY + this.rng() * Math.max(24, maxY - minY),
          currentY: obstacle.gapY,
          radius: 17,
          phase: this.rng() * Math.PI * 2,
          phaseSpeed: 1.2 + this.rng() * 0.4,
          bobAmplitude: 16 + this.rng() * 10,
          swayAmplitude: 0
        });
      } else {
        obstacle.hazards.push({
          type,
          offsetX: obstacle.width * 0.48 + 16 + this.rng() * 24,
          baseY: minY + this.rng() * Math.max(30, maxY - minY),
          currentY: obstacle.gapY,
          width: 30,
          height: 16,
          phase: this.rng() * Math.PI * 2,
          phaseSpeed: 1.8 + this.rng() * 0.5,
          bobAmplitude: 10 + this.rng() * 6,
          swayAmplitude: 14 + this.rng() * 8
        });
      }
    }

    spawnCollectiblesForGap(obstacle) {
      const safeMargin = Math.max(24, obstacle.gapHeight * 0.14);
      const minY = obstacle.gapY - obstacle.gapHeight * 0.5 + safeMargin;
      const maxY = obstacle.gapY + obstacle.gapHeight * 0.5 - safeMargin;

      if (maxY <= minY) {
        return;
      }

      if (this.featureFlags.coinsEnabled && this.rng() < 0.74) {
        const coinCount = 2 + Math.floor(this.rng() * 4);
        const riskBias = obstacle.hazards.length
          ? (this.rng() < 0.5 ? -1 : 1) * Math.min(30, obstacle.gapHeight * 0.16)
          : (this.rng() - 0.5) * obstacle.gapHeight * 0.42;
        const centerY = clamp(obstacle.gapY + riskBias, minY, maxY);
        const waveAmplitude = Math.min(26, obstacle.gapHeight * 0.12);

        for (let index = 0; index < coinCount; index += 1) {
          const x = obstacle.x + obstacle.width * 0.34 + index * 34;
          let y = centerY + Math.sin(index * 0.7) * waveAmplitude;

          if (this.isPointNearHazard(obstacle, x, y, 26)) {
            y = clamp(y + (y < obstacle.gapY ? -28 : 28), minY, maxY);
          }

          this.coins.push({
            x,
            y,
            radius: 11,
            phase: this.rng() * Math.PI * 2,
            glint: this.rng() * Math.PI * 2
          });
        }
      }

      if (this.featureFlags.powerUpsEnabled && this.powerupCooldown <= 0 && this.rng() < 0.16) {
        const powerupTypes = ["shield", "magnet", "slow"];
        const type = powerupTypes[Math.floor(this.rng() * powerupTypes.length)];
        const powerupX = obstacle.x + obstacle.width * 0.58;
        let powerupY = minY + this.rng() * (maxY - minY);

        if (this.isPointNearHazard(obstacle, powerupX, powerupY, 30)) {
          powerupY = clamp(obstacle.gapY + (powerupY < obstacle.gapY ? 34 : -34), minY, maxY);
        }

        this.powerups.push({
          x: powerupX,
          y: powerupY,
          radius: 15,
          type,
          phase: this.rng() * Math.PI * 2
        });

        this.powerupCooldown = 5.4 + this.rng() * 2.8;
      }
    }

    isPointNearHazard(obstacle, x, y, padding) {
      for (const hazard of obstacle.hazards) {
        const hazardX = obstacle.x + hazard.offsetX + (hazard.swayX || 0);
        const hazardY = hazard.currentY || hazard.baseY;
        if (hazard.type === "balloon") {
          if (Math.hypot(x - hazardX, y - hazardY) < hazard.radius + padding) {
            return true;
          }
        } else {
          const dx = Math.abs(x - hazardX);
          const dy = Math.abs(y - hazardY);
          if (dx < hazard.width * 0.7 + padding && dy < hazard.height + padding * 0.7) {
            return true;
          }
        }
      }
      return false;
    }

    getPlaneHitbox() {
      return {
        x: this.plane.x - this.plane.radius * 0.85,
        y: this.plane.y - this.plane.radius * 0.55,
        width: this.plane.radius * 1.7,
        height: this.plane.radius * 1.1
      };
    }

    getCollision() {
      const hitbox = this.getPlaneHitbox();

      if (this.invulnerableTimer > 0) {
        return null;
      }

      if (hitbox.y <= this.ceilingPadding) {
        return { kind: "boundary-top", hitbox };
      }

      if (hitbox.y + hitbox.height >= this.height - this.groundPadding) {
        return { kind: "boundary-bottom", hitbox };
      }

      if (!this.featureFlags.obstaclesEnabled) {
        return null;
      }

      for (const obstacle of this.obstacles) {
        const collidesHorizontally =
          hitbox.x + hitbox.width > obstacle.x && hitbox.x < obstacle.x + obstacle.width;

        if (collidesHorizontally) {
          const gapTop = obstacle.gapY - obstacle.gapHeight * 0.5;
          const gapBottom = obstacle.gapY + obstacle.gapHeight * 0.5;
          const hitsTop = hitbox.y < gapTop;
          const hitsBottom = hitbox.y + hitbox.height > gapBottom;
          if (hitsTop || hitsBottom) {
            return { kind: hitsTop ? "obstacle-top" : "obstacle-bottom", obstacle, hitbox };
          }
        }

        for (const hazard of obstacle.hazards) {
          const hazardX = obstacle.x + hazard.offsetX + (hazard.swayX || 0);
          const hazardY = hazard.currentY || hazard.baseY;
          if (hazard.type === "balloon") {
            const distance = Math.hypot(
              this.plane.x - hazardX,
              this.plane.y - hazardY
            );
            if (distance < this.plane.radius * 0.84 + hazard.radius * 0.88) {
              return { kind: "hazard", obstacle, hazard, hitbox };
            }
          } else {
            if (
              hitbox.x + hitbox.width > hazardX - hazard.width * 0.62 &&
              hitbox.x < hazardX + hazard.width * 0.62 &&
              hitbox.y + hitbox.height > hazardY - hazard.height * 0.8 &&
              hitbox.y < hazardY + hazard.height * 0.8
            ) {
              return { kind: "hazard", obstacle, hazard, hitbox };
            }
          }
        }
      }

      return null;
    }

    getCollisionContactPoint(collision) {
      if (!collision) {
        return { x: this.plane.x, y: this.plane.y };
      }

      const hitbox = collision.hitbox || this.getPlaneHitbox();
      const planeCenterX = hitbox.x + hitbox.width * 0.5;
      const planeCenterY = hitbox.y + hitbox.height * 0.5;

      if (collision.kind === "boundary-top") {
        return { x: planeCenterX, y: this.ceilingPadding };
      }

      if (collision.kind === "boundary-bottom") {
        return { x: planeCenterX, y: this.height - this.groundPadding };
      }

      if (collision.kind === "hazard" && collision.hazard) {
        const hazard = collision.hazard;
        const hazardX = collision.obstacle.x + hazard.offsetX + (hazard.swayX || 0);
        const hazardY = hazard.currentY || hazard.baseY;

        if (hazard.type === "balloon") {
          const angle = Math.atan2(planeCenterY - hazardY, planeCenterX - hazardX);
          return {
            x: hazardX + Math.cos(angle) * hazard.radius,
            y: hazardY + Math.sin(angle) * hazard.radius
          };
        }

        return {
          x: Math.max(hazardX - hazard.width * 0.62, Math.min(planeCenterX, hazardX + hazard.width * 0.62)),
          y: Math.max(hazardY - hazard.height * 0.8, Math.min(planeCenterY, hazardY + hazard.height * 0.8))
        };
      }

      if (collision.obstacle) {
        const gapTop = collision.obstacle.gapY - collision.obstacle.gapHeight * 0.5;
        const gapBottom = collision.obstacle.gapY + collision.obstacle.gapHeight * 0.5;
        return {
          x: Math.max(collision.obstacle.x, Math.min(hitbox.x + hitbox.width, collision.obstacle.x + collision.obstacle.width)),
          y: collision.kind === "obstacle-top" ? gapTop : gapBottom
        };
      }

      return { x: planeCenterX, y: planeCenterY };
    }

    spawnExplosion(x, y) {
      this.spawnBurst(x, y, "#ffd8b3", 16, 190, 1.12);
      this.spawnBurst(x, y, "#ff8f4e", 22, 240, 1.08);
      this.spawnBurst(x, y, "#fff2d9", 10, 110, 1.18);
      this.spawnRing(x, y, "rgba(255, 214, 176, 0.92)", this.plane.radius * 2.4, 0.2);
      this.spawnRing(x, y, "rgba(255, 132, 90, 0.72)", this.plane.radius * 3.2, 0.26);
    }

    endRun(collision = null) {
      if (this.ended) {
        return;
      }

      this.ended = true;
      this.started = false;
      this.haltLoop();
      this.runMetrics.totalCollisions += 1;
      const wasNewBestScore = this.score > this.bestScore;
      const contactPoint = this.getCollisionContactPoint(collision);
      this.persistBestScore(this.score);
      this.spawnExplosion(contactPoint.x, contactPoint.y);
      this.playSoundOnce("gameover", 0.2);
      this.draw();
      this.onPhaseChange?.("gameover");
      this.onGameOver?.({
        score: this.score,
        coinsCollected: this.runCoins,
        powerUpsCollected: this.runMetrics.powerUpsCollected,
        obstaclesPassed: this.runMetrics.obstaclesPassed,
        timeSurvived: this.elapsed,
        flightLevelReached: this.maxFlightLevelReached,
        shieldSaves: this.runMetrics.shieldSaves,
        coinsCollectedWithMagnet: this.runMetrics.coinsCollectedWithMagnet,
        totalCollisions: this.runMetrics.totalCollisions,
        themeUsed: this.activeThemeId,
        wasNewBestScore,
        bestScore: this.bestScore,
        difficultyId: this.activeDifficultyId
      });
    }

    spawnBurst(x, y, color, count, speed, shrink = 0.98) {
      for (let index = 0; index < count; index += 1) {
        const angle = (Math.PI * 2 * index) / count + Math.random() * 0.36;
        const velocity = speed * (0.35 + Math.random() * 0.65);
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 0.18 + Math.random() * 0.14,
          size: 2 + Math.random() * 2.2,
          color,
          drag: 0.92,
          gravity: 30,
          shrink
        });
      }
    }

    spawnRing(x, y, color, radius, duration) {
      this.particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        life: duration,
        size: radius,
        color,
        drag: 1,
        gravity: 0,
        shrink: 1.015,
        ring: true
      });
    }

    draw() {
      const theme = this.getTheme()?.gameplay;
      if (!theme) {
        return;
      }

      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);
      const drewImageBackground = this.drawBackgroundImage(theme);
      if (!drewImageBackground) {
        this.drawSky(theme);
        this.drawSun(theme);
        this.drawClouds(theme);
        this.drawCity(theme);
      }
      this.drawObstacles(theme);
      this.drawCoins();
      this.drawPowerups();
      this.drawHazards();
      this.drawTrail(theme);
      this.drawPlane(theme);
      this.drawParticles();
      this.drawVeils(theme);
      this.drawAtmosphere();
      this.drawCollisionDebug();

      if (!this.started && !this.ended) {
        this.drawReadyPrompt();
      }
    }

    drawCollisionDebug() {
      if (!this.debugCollisionEnabled) {
        return;
      }

      const ctx = this.ctx;
      const hitbox = this.getPlaneHitbox();
      ctx.save();
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);

      ctx.strokeStyle = "rgba(110, 232, 255, 0.95)";
      ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);

      for (const obstacle of this.obstacles) {
        const gapTop = obstacle.gapY - obstacle.gapHeight * 0.5;
        const gapBottom = obstacle.gapY + obstacle.gapHeight * 0.5;

        ctx.strokeStyle = "rgba(255, 143, 78, 0.95)";
        ctx.strokeRect(obstacle.x, 0, obstacle.width, gapTop);
        ctx.strokeRect(obstacle.x, gapBottom, obstacle.width, this.height - gapBottom);

        for (const hazard of obstacle.hazards) {
          const hazardX = obstacle.x + hazard.offsetX + (hazard.swayX || 0);
          const hazardY = hazard.currentY || hazard.baseY;
          ctx.strokeStyle = "rgba(255, 236, 132, 0.95)";
          if (hazard.type === "balloon") {
            ctx.beginPath();
            ctx.arc(hazardX, hazardY, hazard.radius, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            ctx.strokeRect(
              hazardX - hazard.width * 0.62,
              hazardY - hazard.height * 0.8,
              hazard.width * 1.24,
              hazard.height * 1.6
            );
          }
        }
      }

      ctx.restore();
    }

    drawBackgroundImage(theme) {
      const image = this.themeAssets.background;
      if (!image?.complete || !image.naturalWidth || !image.naturalHeight) {
        return false;
      }

      const drawWidth = this.height * (image.naturalWidth / image.naturalHeight);
      const drawHeight = this.height;
      const offsetX = this.backgroundScrollX % drawWidth;
      const firstTileX = -offsetX;
      const tileCount = Math.ceil(this.width / drawWidth) + 2;

      for (let index = 0; index < tileCount; index += 1) {
        this.ctx.drawImage(
          image,
          firstTileX + index * drawWidth,
          0,
          drawWidth,
          drawHeight
        );
      }

      this.ctx.fillStyle = theme.haze || "rgba(255, 155, 96, 0.08)";
      this.ctx.fillRect(0, 0, this.width, this.height);
      return true;
    }

    drawSky(theme) {
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
      gradient.addColorStop(0, theme.skyStart);
      gradient.addColorStop(0.5, theme.skyMid);
      gradient.addColorStop(1, theme.skyEnd);
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawSun(theme) {
      const sunX = this.width * 0.78;
      const sunY = this.height * 0.18;
      const radius = Math.min(this.width, this.height) * 0.1;
      const gradient = this.ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, radius * 1.5);
      gradient.addColorStop(0, theme.sunColor);
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(sunX, sunY, radius * 1.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    drawClouds(theme) {
      for (const cloud of this.clouds) {
        this.ctx.save();
        this.ctx.translate(cloud.x, cloud.y);
        this.ctx.scale(cloud.depth, cloud.depth);
        this.ctx.globalAlpha = cloud.opacity;
        this.ctx.fillStyle = theme.cloud;
        this.drawCloudShape(cloud.width, cloud.height);
        this.ctx.restore();
      }
    }

    drawCloudShape(width, height) {
      const ctx = this.ctx;
      ctx.beginPath();
      ctx.ellipse(0, 0, width * 0.34, height * 0.42, 0, 0, Math.PI * 2);
      ctx.ellipse(width * 0.22, -height * 0.12, width * 0.28, height * 0.48, 0, 0, Math.PI * 2);
      ctx.ellipse(width * 0.48, 0, width * 0.26, height * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    drawCity(theme) {
      const laneY = this.height - this.groundPadding;

      for (const layer of this.cityLayers) {
        this.ctx.fillStyle = theme[layer.colorKey];

        for (const building of layer.buildings) {
          const x = ((building.x - this.distance * layer.speedFactor) % (this.width + 220)) - 110;
          const y = laneY - building.height;
          this.drawRoundedRect(x, y, building.width, building.height, 8);
          this.ctx.fill();

          this.ctx.fillStyle = theme.window;
          const columns = Math.max(2, Math.floor(building.width / 18));
          const rows = Math.max(2, Math.floor(building.height / 24));

          for (let column = 0; column < columns; column += 1) {
            for (let row = 0; row < rows; row += 1) {
              const windowX = x + 8 + column * 14;
              const windowY = y + 10 + row * 18;
              if (windowX + 5 < x + building.width - 5 && windowY + 8 < y + building.height - 5) {
                this.ctx.fillRect(windowX, windowY, 5, 8);
              }
            }
          }

          this.ctx.fillStyle = theme[layer.colorKey];
        }
      }

      const groundGradient = this.ctx.createLinearGradient(0, laneY - 20, 0, this.height);
      groundGradient.addColorStop(0, "rgba(255,255,255,0)");
      groundGradient.addColorStop(1, "rgba(9, 21, 40, 0.24)");
      this.ctx.fillStyle = groundGradient;
      this.ctx.fillRect(0, laneY - 20, this.width, this.height - laneY + 20);
    }

    drawObstacles(theme) {
      if (!this.featureFlags.obstaclesEnabled) {
        return;
      }

      for (const obstacle of this.obstacles) {
        const gapTop = obstacle.gapY - obstacle.gapHeight * 0.5;
        const gapBottom = obstacle.gapY + obstacle.gapHeight * 0.5;
        const topImage = this.themeAssets.obstacles[obstacle.topAssetIndex];
        const bottomImage = this.themeAssets.obstacles[obstacle.bottomAssetIndex];

        if (topImage?.complete && topImage.naturalWidth) {
          const topInset = OBSTACLE_TOP_INSETS[obstacle.topAssetIndex] ?? 0;
          this.ctx.save();
          this.ctx.fillStyle = theme.obstacleMain;
          this.ctx.fillRect(obstacle.x, 0, obstacle.width, gapTop);
          this.ctx.restore();
          this.drawObstacleImage(obstacle.x, 0, obstacle.width, gapTop, topImage, true, topInset);
        } else {
          this.drawTower(
            obstacle.x,
            0,
            obstacle.width,
            gapTop,
            obstacle.accentOffset,
            theme,
            true,
            obstacle.topStyle
          );
        }

        if (bottomImage?.complete && bottomImage.naturalWidth) {
          const bottomInset = OBSTACLE_TOP_INSETS[obstacle.bottomAssetIndex] ?? 0;
          this.ctx.save();
          this.ctx.fillStyle = theme.obstacleMain;
          this.ctx.fillRect(obstacle.x, gapBottom, obstacle.width, this.height - gapBottom);
          this.ctx.restore();
          this.drawObstacleImage(
            obstacle.x,
            gapBottom,
            obstacle.width,
            this.height - gapBottom,
            bottomImage,
            false,
            bottomInset
          );
        } else {
          this.drawTower(
            obstacle.x,
            gapBottom,
            obstacle.width,
            this.height - gapBottom,
            obstacle.accentOffset,
            theme,
            false,
            obstacle.bottomStyle
          );
        }
      }
    }

    drawObstacleImage(x, y, width, height, image, flipY = false, topInsetRatio = 0) {
      if (height <= 0 || !image?.naturalWidth || !image?.naturalHeight) {
        return;
      }

      const ctx = this.ctx;
      const naturalHeight = width * (image.naturalHeight / image.naturalWidth);
      const cropRatio = Math.min(1, height / naturalHeight);
      const fullSourceH = image.naturalHeight * cropRatio;
      const skipPx = Math.round(image.naturalHeight * topInsetRatio);
      const sourceY = skipPx;
      const sourceH = Math.max(1, fullSourceH - skipPx);

      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.34)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = flipY ? -10 : 10;
      if (flipY) {
        ctx.translate(x + width * 0.5, y + height * 0.5);
        ctx.rotate(Math.PI);
        ctx.drawImage(
          image,
          0, sourceY,
          image.naturalWidth, sourceH,
          -width * 0.5, -height * 0.5,
          width, height
        );
      } else {
        ctx.drawImage(image, 0, sourceY, image.naturalWidth, sourceH, x, y, width, height);
      }
      ctx.restore();
    }

    drawTower(x, y, width, height, accentOffset, theme, topTower, style) {
      const ctx = this.ctx;
      ctx.save();

      const towerGradient = ctx.createLinearGradient(x, y, x + width, y);
      towerGradient.addColorStop(0, theme.obstacleTop);
      towerGradient.addColorStop(1, theme.obstacleMain);
      ctx.fillStyle = towerGradient;
      this.drawRoundedRect(x, y, width, height, style === "tower" ? 10 : 14);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(x + 10, y + 12, 8, Math.max(0, height - 24));

      if (style === "highrise") {
        this.drawHighriseWindows(x, y, width, height, accentOffset, theme);
      } else if (style === "tower") {
        this.drawTowerWindows(x, y, width, height, theme, topTower);
      } else {
        this.drawBuildingWindows(x, y, width, height, accentOffset, theme);
      }

      ctx.fillStyle = theme.obstacleTop;
      const capHeight = style === "tower" ? 10 : 12;
      const capY = topTower ? Math.max(0, height - capHeight) : y;
      ctx.fillRect(x - 6, capY, width + 12, capHeight);

      if (style === "crane") {
        this.drawCraneAccent(x, y, width, height, topTower, theme);
      }

      if (style === "tower") {
        this.drawTowerAntenna(x, y, width, height, topTower, theme);
      }

      ctx.restore();
    }

    drawBuildingWindows(x, y, width, height, accentOffset, theme) {
      const ctx = this.ctx;
      ctx.fillStyle = theme.window;
      const rows = Math.max(2, Math.floor(height / 26));
      const cols = Math.max(2, Math.floor(width / 18));

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const windowX = x + 16 + col * 16;
          const windowY = y + 18 + row * 18 + (accentOffset % 8);
          if (windowX + 6 < x + width - 8 && windowY + 9 < y + height - 12) {
            ctx.fillRect(windowX, windowY, 6, 9);
          }
        }
      }
    }

    drawHighriseWindows(x, y, width, height, accentOffset, theme) {
      const ctx = this.ctx;
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(x + width * 0.18, y + 14, width * 0.64, Math.max(10, height - 28));
      ctx.fillStyle = theme.window;

      const rows = Math.max(3, Math.floor(height / 22));
      for (let row = 0; row < rows; row += 1) {
        const windowY = y + 16 + row * 16 + (accentOffset % 6);
        if (windowY + 7 >= y + height - 10) {
          break;
        }
        ctx.fillRect(x + width * 0.26, windowY, width * 0.16, 7);
        ctx.fillRect(x + width * 0.58, windowY, width * 0.16, 7);
      }
    }

    drawTowerWindows(x, y, width, height, theme, topTower) {
      const ctx = this.ctx;
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(x + width * 0.36, y + 12, width * 0.28, Math.max(10, height - 24));
      ctx.fillStyle = theme.window;

      const rows = Math.max(2, Math.floor(height / 24));
      for (let row = 0; row < rows; row += 1) {
        const windowY = y + 18 + row * 18;
        if (windowY + 8 >= y + height - 12) {
          break;
        }
        ctx.fillRect(x + width * 0.44, windowY, width * 0.12, 8);
      }

      if (topTower) {
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(x + width * 0.1, y + 8, width * 0.8, 5);
      }
    }

    drawCraneAccent(x, y, width, height, topTower, theme) {
      const ctx = this.ctx;
      const anchorY = topTower ? Math.max(18, height - 28) : y + 28;
      const mastX = x + width * 0.52;
      const armLength = width * 0.95;
      ctx.strokeStyle = theme.obstacleTop;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(mastX, anchorY);
      ctx.lineTo(mastX, anchorY + (topTower ? -20 : 20));
      ctx.lineTo(mastX + armLength * (topTower ? 1 : -1), anchorY + (topTower ? -20 : 20));
      ctx.stroke();

      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mastX + armLength * (topTower ? 0.7 : -0.7), anchorY + (topTower ? -20 : 20));
      ctx.lineTo(mastX + armLength * (topTower ? 0.7 : -0.7), anchorY + (topTower ? 2 : 38));
      ctx.stroke();
    }

    drawTowerAntenna(x, y, width, height, topTower, theme) {
      if (!topTower || height < 36) {
        return;
      }

      const ctx = this.ctx;
      ctx.strokeStyle = theme.obstacleTop;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + width * 0.5, height - 10);
      ctx.lineTo(x + width * 0.5, height - 34);
      ctx.stroke();
    }

    drawCoins() {
      if (!this.featureFlags.coinsEnabled) {
        return;
      }

      const ctx = this.ctx;
      const coinImage = this.themeAssets.icons.coin;
      for (const coin of this.coins) {
        const pulse = this.featureFlags.effectsEnabled ? 1 + Math.sin(coin.phase) * 0.12 : 1;
        const radius = coin.radius * pulse;

        ctx.save();
        ctx.translate(coin.x, coin.y);
        ctx.rotate(this.featureFlags.effectsEnabled ? Math.sin(coin.phase * 0.7) * 0.3 : 0);
        if (coinImage?.complete && coinImage.naturalWidth) {
          const size = radius * 2.5;
          ctx.shadowColor = "rgba(255, 185, 79, 0.42)";
          ctx.shadowBlur = 22;
          ctx.drawImage(coinImage, -size * 0.5, -size * 0.5, size, size);
        } else {
          ctx.scale(pulse, 1);
          ctx.fillStyle = "#ffd54f";
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "#ffb300";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, radius * 0.76, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    drawPowerups() {
      if (!this.featureFlags.powerUpsEnabled) {
        return;
      }

      for (const powerup of this.powerups) {
        this.ctx.save();
        this.ctx.translate(powerup.x, powerup.y);
        this.ctx.rotate(this.featureFlags.effectsEnabled ? Math.sin(powerup.phase) * 0.15 : 0);
        const scale = this.featureFlags.effectsEnabled
          ? 1 + Math.sin(powerup.phase * 1.4) * 0.08
          : 1;
        this.ctx.scale(scale, scale);

        const powerupImage =
          powerup.type === "shield"
            ? this.themeAssets.icons.powerupShield
            : powerup.type === "magnet"
              ? this.themeAssets.icons.powerupMagnet
              : this.themeAssets.icons.powerupSlow;

        if (powerupImage?.complete && powerupImage.naturalWidth) {
          const size = powerup.radius * 2.5;
          this.ctx.shadowColor = this.getPowerupColor(powerup.type);
          this.ctx.shadowBlur = 22;
          this.ctx.drawImage(powerupImage, -size * 0.5, -size * 0.5, size, size);
        } else if (powerup.type === "shield") {
          this.drawShieldPowerup(powerup.radius);
        } else if (powerup.type === "magnet") {
          this.drawMagnetPowerup(powerup.radius);
        } else {
          this.drawSlowPowerup(powerup.radius);
        }

        this.ctx.restore();
      }
    }

    drawShieldPowerup(radius) {
      const ctx = this.ctx;
      ctx.fillStyle = "#7be7ff";
      ctx.beginPath();
      ctx.moveTo(0, -radius);
      ctx.lineTo(radius * 0.86, -radius * 0.34);
      ctx.lineTo(radius * 0.58, radius * 0.8);
      ctx.lineTo(0, radius);
      ctx.lineTo(-radius * 0.58, radius * 0.8);
      ctx.lineTo(-radius * 0.86, -radius * 0.34);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    drawMagnetPowerup(radius) {
      const ctx = this.ctx;
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.7, Math.PI * 0.15, Math.PI * 0.85, true);
      ctx.stroke();

      ctx.strokeStyle = "#ff9f1c";
      ctx.beginPath();
      ctx.moveTo(-radius * 0.5, radius * 0.14);
      ctx.lineTo(-radius * 0.5, radius * 0.62);
      ctx.moveTo(radius * 0.5, radius * 0.14);
      ctx.lineTo(radius * 0.5, radius * 0.62);
      ctx.stroke();
    }

    drawSlowPowerup(radius) {
      const ctx = this.ctx;
      ctx.strokeStyle = "#8fb6ff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-radius * 0.48, -radius * 0.72);
      ctx.lineTo(radius * 0.48, -radius * 0.72);
      ctx.lineTo(-radius * 0.24, -radius * 0.06);
      ctx.lineTo(radius * 0.24, radius * 0.74);
      ctx.lineTo(-radius * 0.48, radius * 0.74);
      ctx.stroke();
    }

    drawHazards() {
      if (!this.featureFlags.obstaclesEnabled) {
        return;
      }

      for (const obstacle of this.obstacles) {
        for (const hazard of obstacle.hazards) {
          const x = obstacle.x + hazard.offsetX + (hazard.swayX || 0);
          const y = hazard.currentY || hazard.baseY;
          if (hazard.type === "balloon") {
            this.drawBalloon(x, y, hazard.radius);
          } else {
            this.drawDrone(x, y, hazard.width, hazard.height, hazard.phase);
          }
        }
      }
    }

    drawBalloon(x, y, radius) {
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "#ff7f66";
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.82, radius, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.beginPath();
      ctx.ellipse(-radius * 0.24, -radius * 0.18, radius * 0.22, radius * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#ffe6d6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, radius * 0.92);
      ctx.lineTo(0, radius * 2.2);
      ctx.stroke();

      ctx.fillStyle = "#ffdf9f";
      ctx.fillRect(-radius * 0.24, radius * 1.95, radius * 0.48, radius * 0.32);
      ctx.restore();
    }

    drawDrone(x, y, width, height, phase) {
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(phase) * 0.08);

      ctx.fillStyle = "#44566b";
      this.drawRoundedRect(-width * 0.46, -height * 0.5, width * 0.92, height, 6);
      ctx.fill();

      ctx.fillStyle = "#b7f2ff";
      ctx.fillRect(-width * 0.18, -height * 0.18, width * 0.36, height * 0.36);

      ctx.strokeStyle = "#2c3f54";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-width * 0.78, -height * 0.48);
      ctx.lineTo(width * 0.78, -height * 0.48);
      ctx.moveTo(-width * 0.78, height * 0.48);
      ctx.lineTo(width * 0.78, height * 0.48);
      ctx.stroke();

      ctx.strokeStyle = "#e8fbff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-width * 0.88, -height * 0.48);
      ctx.lineTo(-width * 0.52, -height * 0.8);
      ctx.moveTo(width * 0.88, -height * 0.48);
      ctx.lineTo(width * 0.52, -height * 0.8);
      ctx.moveTo(-width * 0.88, height * 0.48);
      ctx.lineTo(-width * 0.52, height * 0.8);
      ctx.moveTo(width * 0.88, height * 0.48);
      ctx.lineTo(width * 0.52, height * 0.8);
      ctx.stroke();
      ctx.restore();
    }

    drawTrail(theme) {
      if (!this.featureFlags.effectsEnabled) {
        return;
      }

      const ctx = this.ctx;
      for (const particle of this.trail) {
        ctx.save();
        ctx.globalAlpha = Math.max(0.1, particle.life);
        ctx.fillStyle = theme.trail;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * particle.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    drawPlane(theme) {
      const ctx = this.ctx;
      const { x, y, radius, rotation } = this.plane;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      const engineGlow = ctx.createRadialGradient(-radius * 1.1, 0, 0, -radius * 1.1, 0, radius);
      engineGlow.addColorStop(0, "rgba(255, 188, 108, 0.92)");
      engineGlow.addColorStop(1, "rgba(255, 188, 108, 0)");
      ctx.fillStyle = engineGlow;
      ctx.beginPath();
      ctx.arc(-radius * 1.05, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      if (this.activeEffects.shield > 0 || this.invulnerableTimer > 0) {
        const shieldPulse = this.featureFlags.effectsEnabled
          ? 1 + Math.sin((this.elapsed + this.plane.bob) * 8) * 0.08
          : 1;
        const alpha = this.invulnerableTimer > 0 ? 0.98 : 0.86;
        ctx.strokeStyle = `rgba(123, 231, 255, ${alpha})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.55 * shieldPulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (this.drawPlaneSprite(radius)) {
        ctx.restore();
        return;
      }

      const bodyGradient = ctx.createLinearGradient(-radius * 1.2, 0, radius * 1.2, 0);
      bodyGradient.addColorStop(0, "#ff6a2d");
      bodyGradient.addColorStop(0.45, theme.planeBody);
      bodyGradient.addColorStop(1, "#ffb56c");
      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.18, radius * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      const wingGradient = ctx.createLinearGradient(-radius * 0.4, -radius, radius, radius);
      wingGradient.addColorStop(0, "#ffffff");
      wingGradient.addColorStop(1, theme.planeWing);
      ctx.fillStyle = wingGradient;
      ctx.beginPath();
      ctx.moveTo(-radius * 0.3, -radius * 0.05);
      ctx.lineTo(radius * 0.65, -radius * 0.9);
      ctx.lineTo(radius * 0.25, 0);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-radius * 0.2, radius * 0.08);
      ctx.lineTo(radius * 0.5, radius * 0.9);
      ctx.lineTo(radius * 0.12, radius * 0.18);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = theme.planeAccent;
      ctx.beginPath();
      ctx.moveTo(-radius * 0.95, -radius * 0.12);
      ctx.lineTo(-radius * 1.22, -radius * 0.72);
      ctx.lineTo(-radius * 0.46, -radius * 0.26);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.arc(radius * 0.25, -radius * 0.15, radius * 0.23, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(radius * 0.82, -radius * 0.46);
      ctx.lineTo(radius * 0.82, radius * 0.46);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 212, 169, 0.92)";
      ctx.beginPath();
      ctx.ellipse(-radius * 1.05, 0, radius * 0.24, radius * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    drawPlaneSprite(radius) {
      const planeImage = this.themeAssets.plane;
      if (!planeImage?.complete || !planeImage.naturalWidth || !planeImage.naturalHeight) {
        return false;
      }

      const sourceFrame = this.themeAssets.planeFrame || {
        x: 0,
        y: 0,
        width: planeImage.naturalWidth,
        height: planeImage.naturalHeight
      };
      const drawWidth = radius * 4.9;
      const drawHeight = drawWidth * (sourceFrame.height / sourceFrame.width);

      this.ctx.drawImage(
        planeImage,
        sourceFrame.x,
        sourceFrame.y,
        sourceFrame.width,
        sourceFrame.height,
        -drawWidth * 0.58,
        -drawHeight * 0.54,
        drawWidth,
        drawHeight
      );

      return true;
    }

    drawParticles() {
      if (!this.featureFlags.effectsEnabled) {
        return;
      }

      const ctx = this.ctx;
      for (const particle of this.particles) {
        ctx.save();
        ctx.globalAlpha = clamp(particle.life / 0.4, 0.06, 0.58);
        if (particle.ring) {
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    drawVeils(theme) {
      if (!this.featureFlags.obstaclesEnabled) {
        return;
      }

      for (const obstacle of this.obstacles) {
        for (const veil of obstacle.veils) {
          this.ctx.save();
          this.ctx.translate(obstacle.x + veil.offsetX, veil.y + veil.offsetY);
          this.ctx.globalAlpha = veil.alpha;
          this.ctx.fillStyle = theme.cloud;
          this.drawCloudShape(veil.width, veil.height);
          this.ctx.restore();
        }
      }
    }

    drawAtmosphere() {
      const ctx = this.ctx;
      const vignette = ctx.createLinearGradient(0, 0, 0, this.height);
      vignette.addColorStop(0, "rgba(255,255,255,0.12)");
      vignette.addColorStop(0.3, "rgba(255,255,255,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.08)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.fillStyle = "rgba(255, 159, 87, 0.08)";
      ctx.fillRect(0, this.height * 0.6, this.width, this.height * 0.4);

      if (this.activeEffects.slow > 0) {
        ctx.fillStyle = "rgba(143, 182, 255, 0.08)";
        ctx.fillRect(0, 0, this.width, this.height);
      }
    }

    drawReadyPrompt() {
      const i18n = window.TurboWingsI18n;
      const headline = i18n?.t("game.tapToFly") || "Tap to Fly";
      const hint =
        i18n?.t("game.instructions") ||
        "Tap, click or press Space to boost upward and drift through the skyline.";
      const panelWidth = Math.min(this.width * 0.82, 460);
      const panelHeight = Math.min(128, this.height * 0.24);
      const x = (this.width - panelWidth) * 0.5;
      const y = this.height * 0.18;

      this.ctx.save();
      this.ctx.fillStyle = "rgba(8, 18, 37, 0.18)";
      this.drawRoundedRect(x, y, panelWidth, panelHeight, 20);
      this.ctx.fill();

      this.ctx.strokeStyle = "rgba(255,255,255,0.18)";
      this.ctx.lineWidth = 1;
      this.drawRoundedRect(x, y, panelWidth, panelHeight, 20);
      this.ctx.stroke();

      this.ctx.fillStyle = "#ffffff";
      this.ctx.textAlign = "center";
      this.ctx.font = `800 ${clamp(this.width * 0.04, 24, 36)}px "Trebuchet MS", sans-serif`;
      this.ctx.fillText(headline, this.width * 0.5, y + 42);

      this.ctx.fillStyle = "rgba(255,255,255,0.78)";
      this.ctx.font = `600 ${clamp(this.width * 0.022, 13, 16)}px "Trebuchet MS", sans-serif`;
      this.wrapText(hint, this.width * 0.5, y + 72, panelWidth - 48, 20);
      this.ctx.restore();
    }

    wrapText(text, x, y, maxWidth, lineHeight) {
      const words = String(text).split(/\s+/);
      let line = "";
      let lineY = y;

      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        if (this.ctx.measureText(testLine).width > maxWidth && line) {
          this.ctx.fillText(line, x, lineY);
          line = word;
          lineY += lineHeight;
        } else {
          line = testLine;
        }
      }

      if (line) {
        this.ctx.fillText(line, x, lineY);
      }
    }

    drawRoundedRect(x, y, width, height, radius) {
      const ctx = this.ctx;
      const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
      ctx.beginPath();
      ctx.moveTo(x + safeRadius, y);
      ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
      ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
      ctx.arcTo(x, y + height, x, y, safeRadius);
      ctx.arcTo(x, y, x + width, y, safeRadius);
      ctx.closePath();
    }
  }

  return {
    BEST_SCORE_KEY,
    DEFAULT_DIFFICULTY_ID,
    DIFFICULTY_DEFINITIONS,
    TurboWingsGame,
    getDifficultyById,
    getDifficultyDefinitions
  };
})();
