window.TurboWingsApplication = (() => {
  const { getLanguage, getLanguageOptions, initI18n, setLanguage, subscribe, t, format } =
    window.TurboWingsI18n;
  const { TurboWingsGame, getDifficultyById, getDifficultyDefinitions, BEST_SCORE_KEY } =
    window.TurboWingsGameplay;
  const { TurboWingsAudioManager } = window.TurboWingsAudio;
  const { DEFAULT_THEME, applyTheme, getActiveThemeId, getTheme, getThemeList } =
    window.TurboWingsThemes;
  const Storage = window.TurboWingsStorage;
  const { applyRunToStats, ensureStats } = window.TurboWingsProgression;
  const Missions = window.TurboWingsMissions;
  const Achievements = window.TurboWingsAchievements;

  const DEFAULT_TUNING = {
    breeze: { speedPercent: 88, gapPercent: 120 },
    normal: { speedPercent: 100, gapPercent: 100 },
    storm: { speedPercent: 110, gapPercent: 92 },
    turbo: { speedPercent: 122, gapPercent: 82 },
    legend: { speedPercent: 135, gapPercent: 74 }
  };

  const DEFAULT_SETTINGS = {
    musicEnabled: true,
    sfxEnabled: true,
    gameplayAudioEnabled: true,
    obstaclesEnabled: true,
    powerUpsEnabled: true,
    coinsEnabled: true,
    effectsEnabled: true,
    tuning: DEFAULT_TUNING
  };

  const FEATURED_ACHIEVEMENT_IDS = ["first-flight", "urban-pilot", "sky-ace", "sky-master"];
  const DONATION_URLS = {
    kofi: "https://ko-fi.com/insightxlabgamestudio",
    coffee: "https://buymeacoffee.com/insight.x.lab.game.studio"
  };
  const ACHIEVEMENT_CATEGORIES = [
    {
      id: "all",
      labelKey: "achievements.allAchievementsCategory",
      iconClass: "achievements-category-icon-all"
    },
    {
      id: "first-flight",
      labelKey: "achievements.categoryFirstFlight",
      iconClass: "achievements-category-icon-first-flight"
    },
    {
      id: "skill-mastery",
      labelKey: "achievements.categorySkillMastery",
      iconClass: "achievements-category-icon-skill-mastery"
    },
    {
      id: "flight-challenges",
      labelKey: "achievements.categoryFlightChallenges",
      iconClass: "achievements-category-icon-flight-challenges"
    },
    {
      id: "collection",
      labelKey: "achievements.categoryCollection",
      iconClass: "achievements-category-icon-collection"
    },
    {
      id: "hidden",
      labelKey: "achievements.categoryHidden",
      iconClass: "achievements-category-icon-hidden"
    }
  ];

  const Aircraft = window.TurboWingsAircraft;
  const Online = window.TurboWingsOnline;
  const Daily = window.TurboWingsDaily;
  const ScoreCard = window.TurboWingsScoreCard;

  class TurboWingsApp {
    constructor() {
      this.difficulties = getDifficultyDefinitions();
      this.missionTemplates = Missions.getMissionTemplates();
      this.achievementTemplates = Achievements.getAchievementTemplates();
      this.achievementMap = Object.fromEntries(
        this.achievementTemplates.map((achievement) => [achievement.id, achievement])
      );
      this.notificationTimers = new Map();

      this.state = {
        screen: "home",
        settings: this.cloneDefaultSettings(),
        leaderboard: [],
        selectedAchievementCategory: "all",
        unlocks: {
          turbo: false,
          legend: false
        },
        lastSetup: null,
        currentRun: null,
        latestResult: null,
        runCoins: 0,
        totalCoins: 0,
        activeEffects: [],
        flightLevel: 1,
        currentProfile: null,
        notifications: [],
        selectedAircraftId: Aircraft.DEFAULT_AIRCRAFT_ID,
        ownedAircraft: ["classic"],
        onlinePlayer: null,
        countryInfo: null,
        leaderboardTab: "local",
        isDaily: false,
        shopReturnScreen: "home"
      };

      this.elements = {
        screens: Array.from(document.querySelectorAll("[data-screen]")),
        openSetupButton: document.getElementById("openSetupButton"),
        openLeaderboardButton: document.getElementById("openLeaderboardButton"),
        openSettingsButton: document.getElementById("openSettingsButton"),
        openAdvancedSettingsButton: document.getElementById("openAdvancedSettingsButton"),
        openAchievementsButton: document.getElementById("openAchievementsButton"),
        backFromSetupButton: document.getElementById("backFromSetupButton"),
        backFromSettingsButton: document.getElementById("backFromSettingsButton"),
        backFromAdvancedSettingsButton: document.getElementById("backFromAdvancedSettingsButton"),
        backFromLeaderboardButton: document.getElementById("backFromLeaderboardButton"),
        backFromAchievementsButton: document.getElementById("backFromAchievementsButton"),
        startFlightButton: document.getElementById("startFlightButton"),
        restartButton: document.getElementById("restartButton"),
        changeSetupButton: document.getElementById("changeSetupButton"),
        leaveGameButton: document.getElementById("leaveGameButton"),
        gameOverHomeButton: document.getElementById("gameOverHomeButton"),
        pauseButton: document.getElementById("pauseButton"),
        pauseHomeButton: document.getElementById("pauseHomeButton"),
        resumeButton: document.getElementById("resumeButton"),
        languageSelect: document.getElementById("languageSelect"),
        themeSelect: document.getElementById("themeSelect"),
        musicToggle: document.getElementById("musicToggle"),
        sfxToggle: document.getElementById("sfxToggle"),
        gameplayAudioToggle: document.getElementById("gameplayAudioToggle"),
        obstaclesToggle: document.getElementById("obstaclesToggle"),
        powerUpsToggle: document.getElementById("powerUpsToggle"),
        coinsToggle: document.getElementById("coinsToggle"),
        effectsToggle: document.getElementById("effectsToggle"),
        difficultySettingsList: document.getElementById("difficultySettingsList"),
        settingsDifficultySettingsList: document.getElementById("settingsDifficultySettingsList"),
        resetDifficultySettingsButton: document.getElementById("resetDifficultySettingsButton"),
        settingsResetDifficultySettingsButton: document.getElementById(
          "settingsResetDifficultySettingsButton"
        ),
        difficultyList: document.getElementById("difficultyList"),
        playerNameInput: document.getElementById("playerNameInput"),
        setupSummaryValue: document.getElementById("setupSummaryValue"),
        setupBriefPilotValue: document.getElementById("setupBriefPilotValue"),
        setupBriefShipValue: document.getElementById("setupBriefShipValue"),
        setupBriefDifficultyValue: document.getElementById("setupBriefDifficultyValue"),
        setupReadinessValue: document.getElementById("setupReadinessValue"),
        setupReadinessMeter: document.getElementById("setupReadinessMeter"),
        setupStatusText: document.getElementById("setupStatusText"),
        leaderboardList: document.getElementById("leaderboardList"),
        leaderboardPodium: document.getElementById("leaderboardPodium"),
        leaderboardToSetupButton: document.getElementById("leaderboardToSetupButton"),
        leaderboardToAchievementsButton: document.getElementById(
          "leaderboardToAchievementsButton"
        ),
        leaderboardToSettingsButton: document.getElementById("leaderboardToSettingsButton"),
        homeTopPilotName: document.getElementById("homeTopPilotName"),
        homePlayerLevelValue: document.getElementById("homePlayerLevelValue"),
        homeThemeValue: document.getElementById("homeThemeValue"),
        homeDifficultyValue: document.getElementById("homeDifficultyValue"),
        homeMusicStatusValue: document.getElementById("homeMusicStatusValue"),
        homeSfxStatusValue: document.getElementById("homeSfxStatusValue"),
        homeTopCoinsValue: document.getElementById("homeTopCoinsValue"),
        homeProfileName: document.getElementById("homeProfileName"),
        homeProfileMeta: document.getElementById("homeProfileMeta"),
        homeBestScoreValue: document.getElementById("homeBestScoreValue"),
        homeTotalCoinsValue: document.getElementById("homeTotalCoinsValue"),
        homeHighestFlightValue: document.getElementById("homeHighestFlightValue"),
        homeRunsValue: document.getElementById("homeRunsValue"),
        homeTopPilotValue: document.getElementById("homeTopPilotValue"),
        homeUnlockedValue: document.getElementById("homeUnlockedValue"),
        homeMissionsList: document.getElementById("homeMissionsList"),
        homeRecentAchievementsList: document.getElementById("homeRecentAchievementsList"),
        homeShareFooter: document.getElementById("homeShareFooter"),
        installDeviceButton: document.getElementById("installDeviceButton"),
        displayModeSelect: document.getElementById("displayModeSelect"),
        collisionDebugSelect: document.getElementById("collisionDebugSelect"),
        achievementsList: document.getElementById("achievementsList"),
        achievementsFeaturedList: document.getElementById("achievementsFeaturedList"),
        achievementsCategoryList: document.getElementById("achievementsCategoryList"),
        achievementsUnlockedValue: document.getElementById("achievementsUnlockedValue"),
        achievementsTotalValue: document.getElementById("achievementsTotalValue"),
        achievementsRewardedCoinsValue: document.getElementById("achievementsRewardedCoinsValue"),
        achievementsMasteryValue: document.getElementById("achievementsMasteryValue"),
        achievementsMasteryMeta: document.getElementById("achievementsMasteryMeta"),
        achievementsMasteryBar: document.getElementById("achievementsMasteryBar"),
        scoreValue: document.getElementById("scoreValue"),
        coinsValue: document.getElementById("coinsValue"),
        flightLevelValue: document.getElementById("flightLevelValue"),
        runMetaValue: document.getElementById("runMetaValue"),
        finalScoreValue: document.getElementById("finalScoreValue"),
        finalCoinsValue: document.getElementById("finalCoinsValue"),
        bestScoreValue: document.getElementById("bestScoreValue"),
        lbBestRouteValue: document.getElementById("lbBestRouteValue"),
        gameOverTotalCoinsValue: document.getElementById("gameOverTotalCoinsValue"),
        gameOverTimeValue: document.getElementById("gameOverTimeValue"),
        gameOverFlightLevelValue: document.getElementById("gameOverFlightLevelValue"),
        gameOverPowerUpsValue: document.getElementById("gameOverPowerUpsValue"),
        gameOverObstaclesValue: document.getElementById("gameOverObstaclesValue"),
        gameOverMissionsCountValue: document.getElementById("gameOverMissionsCountValue"),
        gameOverAchievementsCountValue: document.getElementById("gameOverAchievementsCountValue"),
        gameOverMissionsList: document.getElementById("gameOverMissionsList"),
        gameOverAchievementsList: document.getElementById("gameOverAchievementsList"),
        gameOverMeta: document.getElementById("gameOverMeta"),
        backFromDonateButton: document.getElementById("backFromDonateButton"),
        backFromCreditsButton: document.getElementById("backFromCreditsButton"),
        donationKoFiButton: document.getElementById("donationKoFiButton"),
        donationCoffeeButton: document.getElementById("donationCoffeeButton"),
        unlockNotice: document.getElementById("unlockNotice"),
        activeEffectsList: document.getElementById("activeEffectsList"),
        startOverlay: document.getElementById("startOverlay"),
        pauseOverlay: document.getElementById("pauseOverlay"),
        gameOverOverlay: document.getElementById("gameOverOverlay"),
        notifications: document.getElementById("notificationStack"),
        canvas: document.getElementById("gameCanvas"),
        openShopButton: document.getElementById("openShopButton"),
        backFromShopButton: document.getElementById("backFromShopButton"),
        changeAircraftButton: document.getElementById("changeAircraftButton"),
        shopAircraftGrid: document.getElementById("shopAircraftGrid"),
        setupFeatureName: document.getElementById("setupFeatureName"),
        setupFeatureClass: document.getElementById("setupFeatureClass"),
        setupFeatureJet: document.getElementById("setupFeatureJet"),
        setupFeatureSpeedBar: document.getElementById("setupFeatureSpeedBar"),
        setupFeatureHandlingBar: document.getElementById("setupFeatureHandlingBar"),
        setupFeatureDurabilityBar: document.getElementById("setupFeatureDurabilityBar"),
        shopCoinBalance: document.getElementById("shopCoinBalance"),
        openDailyButton: document.getElementById("openDailyButton"),
        shareScoreCardButton: document.getElementById("shareScoreCardButton"),
        onlineStatusChip: document.getElementById("onlineStatusChip"),
        onlineStatusLabel: document.getElementById("onlineStatusLabel"),
        homeOnlineIcon: document.getElementById("homeOnlineIcon"),
        lbTabLocal: document.getElementById("lbTabLocal"),
        lbTabGlobal: document.getElementById("lbTabGlobal"),
        lbTabDaily: document.getElementById("lbTabDaily"),
        lbCountryFilter: document.getElementById("lbCountryFilter"),
        lbCountryFilterLabel: document.getElementById("lbCountryFilterLabel"),
        leaderboardLoading: document.getElementById("leaderboardLoading"),
        hudDailyBadge: document.getElementById("hudDailyBadge")
      };

      this.elements.difficultySettingsLists = [
        this.elements.difficultySettingsList,
        this.elements.settingsDifficultySettingsList
      ].filter(Boolean);
      this.elements.resetDifficultySettingsButtons = [
        this.elements.resetDifficultySettingsButton,
        this.elements.settingsResetDifficultySettingsButton
      ].filter(Boolean);
      this.deferredInstallPrompt = null;
    }

    cloneDefaultSettings() {
      return {
        musicEnabled: DEFAULT_SETTINGS.musicEnabled,
        sfxEnabled: DEFAULT_SETTINGS.sfxEnabled,
        gameplayAudioEnabled: DEFAULT_SETTINGS.gameplayAudioEnabled,
        obstaclesEnabled: DEFAULT_SETTINGS.obstaclesEnabled,
        powerUpsEnabled: DEFAULT_SETTINGS.powerUpsEnabled,
        coinsEnabled: DEFAULT_SETTINGS.coinsEnabled,
        effectsEnabled: DEFAULT_SETTINGS.effectsEnabled,
        tuning: this.difficulties.reduce((accumulator, difficulty) => {
          accumulator[difficulty.id] = { ...DEFAULT_TUNING[difficulty.id] };
          return accumulator;
        }, {})
      };
    }

    init() {
      const savedLanguage = Storage.loadLanguage();
      const activeLanguage = initI18n(savedLanguage);
      const savedTheme = Storage.loadTheme(DEFAULT_THEME);
      applyTheme(savedTheme);

      this.state.settings = this.loadSettings();
      this.state.leaderboard = Storage.loadLeaderboard();
      this.state.unlocks = Storage.loadUnlocks();
      this.state.lastSetup = this.loadLastSetup();
      this.state.totalCoins = Storage.loadTotalCoins();
      this.state.ownedAircraft = Storage.loadOwnedAircraft();
      this.state.selectedAircraftId = Storage.loadSelectedAircraft();
      this.loadProfile(this.state.lastSetup.playerName);
      this.syncBestScoreStorage();

      document.documentElement.lang = activeLanguage;
      this.audio = new TurboWingsAudioManager({
        getTheme: () => getTheme(getActiveThemeId()),
        getPreferences: () => ({
          musicEnabled: this.state.settings.musicEnabled,
          sfxEnabled: this.state.settings.sfxEnabled,
          gameplayAudioEnabled: this.state.settings.gameplayAudioEnabled
        })
      });

      this.game = new TurboWingsGame({
        canvas: this.elements.canvas,
        getTheme: () => {
          const theme = getTheme(getActiveThemeId());
          const ac = Aircraft.getAircraftById(this.state.selectedAircraftId);
          if (ac && ac.id !== Aircraft.DEFAULT_AIRCRAFT_ID) {
            return {
              ...theme,
              assets: { ...theme.assets, gameplayJet: ac.imageSrc }
            };
          }
          return theme;
        },
        onScoreChange: (score) => this.updateScore(score),
        onCoinsChange: (coins) => this.updateRunCoins(coins),
        onEffectsChange: (effects) => this.updateActiveEffects(effects),
        onFlightLevelChange: (flightLevel) => this.updateFlightLevel(flightLevel),
        onBestScoreChange: (score) => this.updateBestScore(score),
        onPhaseChange: (phase) => this.handleGamePhaseChange(phase),
        onGameOver: (result) => this.finishRun(result),
        playSound: (name, detail) => this.audio.playGameplaySfx(name, detail)
      });

      this.bindEvents();
      this.bindInstallPromptEvents();
      this.restoreDisplayMode();
      this.restoreCollisionDebug();
      subscribe(() => {
        document.documentElement.lang = getLanguage();
        if (this.state.lastSetup?.usedDefaultName) {
          this.state.lastSetup.playerName = this.getDefaultPlayerName();
          Storage.saveLastSetup(this.state.lastSetup);
          this.loadProfile(this.state.lastSetup.playerName);
        }
        this.refreshUi();
      });

      this.refreshUi();
      this.showScreen("home", { playNavigation: false });
      this.applyQueryOverrides();
      Online.setOnlineMode(true);
      this.initOnline();
    }

    applyQueryOverrides() {
      if (typeof window === "undefined") {
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const displayMode = params.get("displayMode");
      const screen = params.get("screen");
      const mock = params.get("mock");

      if (displayMode && ["auto", "desktop", "tablet", "mobile"].includes(displayMode)) {
        this.applyDisplayMode(displayMode);
      }

      if (screen) {
        this.showScreen(screen, { playNavigation: false });
      }

      if (mock === "gameover") {
        this.showScreen("game", { playNavigation: false });
        this.renderGameOverSummary({
          score: 21,
          coinsCollected: 4,
          totalCoins: 457,
          timeSurvived: 9,
          flightLevelReached: 1,
          powerUpsCollected: 0,
          obstaclesPassed: 38,
          missionsCompleted: [{ titleKey: "mission.score20.title" }],
          achievementsUnlocked: [{ titleKey: "achievement.firstFlight.title" }],
          playerName: "Flavio",
          difficultyId: "storm",
          timestamp: Date.now()
        });
        this.hideGameOverlays();
        this.elements.gameOverOverlay.classList.remove("hidden");
      }
    }

    loadSettings() {
      const storedSettings = Storage.loadSettings();
      const defaults = this.cloneDefaultSettings();

      const tuning = this.difficulties.reduce((accumulator, difficulty) => {
        const storedDifficulty = storedSettings?.tuning?.[difficulty.id] || {};
        accumulator[difficulty.id] = {
          speedPercent: this.clampValue(
            storedDifficulty.speedPercent,
            70,
            150,
            defaults.tuning[difficulty.id].speedPercent
          ),
          gapPercent: this.clampValue(
            storedDifficulty.gapPercent,
            70,
            140,
            defaults.tuning[difficulty.id].gapPercent
          )
        };
        return accumulator;
      }, {});

      return {
        musicEnabled:
          typeof storedSettings.musicEnabled === "boolean"
            ? storedSettings.musicEnabled
            : defaults.musicEnabled,
        sfxEnabled:
          typeof storedSettings.sfxEnabled === "boolean"
            ? storedSettings.sfxEnabled
            : defaults.sfxEnabled,
        gameplayAudioEnabled:
          typeof storedSettings.gameplayAudioEnabled === "boolean"
            ? storedSettings.gameplayAudioEnabled
            : defaults.gameplayAudioEnabled,
        obstaclesEnabled:
          typeof storedSettings.obstaclesEnabled === "boolean"
            ? storedSettings.obstaclesEnabled
            : defaults.obstaclesEnabled,
        powerUpsEnabled:
          typeof storedSettings.powerUpsEnabled === "boolean"
            ? storedSettings.powerUpsEnabled
            : defaults.powerUpsEnabled,
        coinsEnabled:
          typeof storedSettings.coinsEnabled === "boolean"
            ? storedSettings.coinsEnabled
            : defaults.coinsEnabled,
        effectsEnabled:
          typeof storedSettings.effectsEnabled === "boolean"
            ? storedSettings.effectsEnabled
            : defaults.effectsEnabled,
        tuning
      };
    }

    loadLastSetup() {
      return Storage.loadLastSetup({
        playerName: this.getDefaultPlayerName(),
        difficultyId: "normal",
        usedDefaultName: true
      });
    }

    loadProfile(playerName) {
      const profile = Storage.getPlayerProfile(playerName);
      profile.stats = ensureStats(profile.stats);
      profile.missions = Missions.ensureActiveMissions(profile.missions);
      profile.achievements = Achievements.ensureAchievementState(profile.achievements);
      profile.recentAchievements = Array.isArray(profile.recentAchievements)
        ? profile.recentAchievements
        : [];
      this.state.currentProfile = Storage.savePlayerProfile(profile);
      return this.state.currentProfile;
    }

    saveSettings() {
      Storage.saveSettings(this.state.settings);
    }

    saveLeaderboard() {
      Storage.saveLeaderboard(this.state.leaderboard);
    }

    saveUnlocks() {
      Storage.saveUnlocks(this.state.unlocks);
    }

    saveTotalCoins() {
      Storage.saveTotalCoins(this.state.totalCoins);
    }

    saveCurrentProfile() {
      if (!this.state.currentProfile) {
        return null;
      }
      this.state.currentProfile = Storage.savePlayerProfile(this.state.currentProfile);
      return this.state.currentProfile;
    }

    syncBestScoreStorage() {
      const leaderboardBest = this.state.leaderboard[0]?.score || 0;
      const currentBest =
        Number.parseInt(window.localStorage.getItem(BEST_SCORE_KEY) || "0", 10) || 0;
      if (leaderboardBest > currentBest) {
        window.localStorage.setItem(BEST_SCORE_KEY, String(leaderboardBest));
      }
    }

    bindEvents() {
      this.elements.openSetupButton.addEventListener("click", () => {
        this.handleInteraction();
        this.openSetup();
      });

      this.elements.openLeaderboardButton.addEventListener("click", () => {
        this.handleInteraction();
        this.showScreen("leaderboard");
      });

      this.elements.openSettingsButton.addEventListener("click", () => {
        this.handleInteraction();
        this.showScreen("settings");
      });

      this.elements.openAdvancedSettingsButton.addEventListener("click", () => {
        this.handleInteraction();
        this.showScreen("advanced-settings");
      });

      this.elements.openAchievementsButton.addEventListener("click", () => {
        this.handleInteraction();
        this.showScreen("achievements");
      });

      this.elements.installDeviceButton?.addEventListener("click", async () => {
        this.handleInteraction({ playNavigation: false });
        await this.promptInstall();
      });

      this.elements.homeShareFooter?.addEventListener("click", async (event) => {
        const shareButton = event.target.closest("[data-share-target]");
        if (shareButton) {
          this.handleInteraction({ playNavigation: false });
          await this.handleShareAction(shareButton.dataset.shareTarget);
          return;
        }

        const screenButton = event.target.closest("[data-open-screen]");
        if (!screenButton) {
          return;
        }

        this.handleInteraction();
        this.showScreen(screenButton.dataset.openScreen);
      });

      this.elements.backFromSetupButton.addEventListener("click", () => {
        this.handleInteraction();
        this.showScreen("home");
      });

      this.elements.backFromSettingsButton.addEventListener("click", () => {
        this.handleInteraction();
        this.showScreen("home");
      });

      this.elements.backFromAdvancedSettingsButton.addEventListener("click", () => {
        this.handleInteraction();
        this.showScreen("settings");
      });

      this.elements.backFromLeaderboardButton.addEventListener("click", () => {
        this.handleInteraction();
        this.showScreen("home");
      });

      this.elements.backFromAchievementsButton.addEventListener("click", () => {
        this.handleInteraction();
        this.showScreen("home");
      });

      this.elements.backFromDonateButton?.addEventListener("click", () => {
        this.handleInteraction();
        this.showScreen("home");
      });

      this.elements.backFromCreditsButton?.addEventListener("click", () => {
        this.handleInteraction();
        this.showScreen("home");
      });

      this.elements.leaderboardToSetupButton?.addEventListener("click", () => {
        this.handleInteraction();
        this.showScreen("setup");
      });

      this.elements.leaderboardToAchievementsButton?.addEventListener("click", () => {
        this.handleInteraction();
        this.showScreen("achievements");
      });

      this.elements.leaderboardToSettingsButton?.addEventListener("click", () => {
        this.handleInteraction();
        this.showScreen("settings");
      });

      this.elements.donationKoFiButton?.addEventListener("click", () => {
        this.handleInteraction();
        this.openExternalUrl(DONATION_URLS.kofi);
      });

      this.elements.donationCoffeeButton?.addEventListener("click", () => {
        this.handleInteraction();
        this.openExternalUrl(DONATION_URLS.coffee);
      });

      this.elements.startFlightButton.addEventListener("click", () => {
        this.handleInteraction();
        this.startGameFromSetup();
      });

      this.elements.restartButton.addEventListener("click", () => {
        this.handleInteraction();
        this.startGameWithLastSetup();
      });

      this.elements.changeSetupButton.addEventListener("click", () => {
        this.handleInteraction();
        this.openSetup();
      });

      this.elements.leaveGameButton.addEventListener("click", () => {
        this.handleInteraction();
        this.leaveGame("home");
      });

      this.elements.gameOverHomeButton.addEventListener("click", () => {
        this.handleInteraction();
        this.leaveGame("home");
      });

      this.elements.pauseButton.addEventListener("click", () => {
        this.handleInteraction({ playNavigation: false });
        this.game.togglePause();
      });

      this.elements.resumeButton.addEventListener("click", () => {
        this.handleInteraction({ playNavigation: false });
        this.game.togglePause(false);
      });

      this.elements.pauseHomeButton.addEventListener("click", () => {
        this.handleInteraction();
        this.leaveGame("home");
      });

      this.elements.languageSelect.addEventListener("change", (event) => {
        this.handleInteraction({ playButton: false, playNavigation: false });
        const language = setLanguage(event.target.value);
        Storage.saveLanguage(language);
      });

      this.elements.themeSelect.addEventListener("change", (event) => {
        this.handleInteraction({ playButton: false, playNavigation: false });
        const themeId = applyTheme(event.target.value);
        Storage.saveTheme(themeId);
        this.game.setTheme(themeId);
        this.audio.refreshTheme();
        this.refreshUi();
      });

      this.elements.displayModeSelect?.addEventListener("change", (event) => {
        this.applyDisplayMode(event.target.value);
      });

      window.addEventListener("resize", () => {
        this.syncAutoDisplayMode();
      });

      window.visualViewport?.addEventListener("resize", () => {
        this.syncAutoDisplayMode();
      });

      this.elements.collisionDebugSelect?.addEventListener("change", (event) => {
        this.applyCollisionDebug(event.target.value === "on");
      });

      this.elements.musicToggle.addEventListener("change", () => {
        this.handleInteraction({ playNavigation: false });
        this.state.settings.musicEnabled = this.elements.musicToggle.checked;
        this.saveSettings();
        this.syncAudioForCurrentScreen();
      });

      this.elements.sfxToggle.addEventListener("change", () => {
        const previous = this.state.settings.sfxEnabled;
        this.state.settings.sfxEnabled = this.elements.sfxToggle.checked;
        this.saveSettings();
        if (previous || this.state.settings.sfxEnabled) {
          this.handleInteraction({ playNavigation: false });
        }
      });

      this.elements.gameplayAudioToggle.addEventListener("change", () => {
        this.state.settings.gameplayAudioEnabled = this.elements.gameplayAudioToggle.checked;
        this.saveSettings();
        if (this.state.settings.gameplayAudioEnabled) {
          this.audio.unlock();
        }
      });

      this.bindBooleanSettingToggle("powerUpsToggle", "powerUpsEnabled");
      this.bindBooleanSettingToggle("coinsToggle", "coinsEnabled");
      this.bindBooleanSettingToggle("effectsToggle", "effectsEnabled");

      this.elements.playerNameInput.addEventListener("input", (event) => {
        const value = String(event.target.value || "").slice(0, 24);
        const fallbackName = this.getDefaultPlayerName();
        this.state.lastSetup = {
          ...this.state.lastSetup,
          playerName: value || fallbackName,
          usedDefaultName: !value.trim()
        };
        this.updateSetupSummary();
      });

      this.elements.playerNameInput.addEventListener("blur", () => {
        const normalized = this.normalizePlayerName(
          this.elements.playerNameInput.value,
          this.getDefaultPlayerName()
        );
        this.state.lastSetup = {
          ...this.state.lastSetup,
          playerName: normalized,
          usedDefaultName: normalized === this.getDefaultPlayerName()
        };
        this.elements.playerNameInput.value = normalized;
        Storage.saveLastSetup(this.state.lastSetup);
        this.loadProfile(normalized);
        this.refreshUi();
      });

      this.elements.difficultyList.addEventListener("change", (event) => {
        const input = event.target.closest("input[name='difficulty']");
        if (!input) {
          return;
        }

        this.handleInteraction({ playNavigation: false });
        this.state.lastSetup = {
          ...this.state.lastSetup,
          difficultyId: this.resolveDifficultySelection(input.value)
        };
        Storage.saveLastSetup(this.state.lastSetup);
        this.updateSetupSummary();
      });

      this.elements.difficultyList.addEventListener("click", (event) => {
        if (event.target.closest(".difficulty-card")) {
          this.handleInteraction({ playNavigation: false });
        }
      });

      this.elements.difficultySettingsLists.forEach((container) => {
        container.addEventListener("input", (event) => {
          const input = event.target.closest("input[type='range']");
          if (!input) {
            return;
          }

          const difficultyId = input.dataset.difficultyId;
          const property = input.dataset.setting;
          this.state.settings.tuning[difficultyId][property] = Number(input.value);
          this.saveSettings();
          this.updateRangeOutputs();
        });
      });

      this.elements.resetDifficultySettingsButtons.forEach((button) => {
        button.addEventListener("click", () => {
          this.handleInteraction();
          this.restoreDefaultDifficultySettings();
        });
      });

      this.elements.homeMissionsList.addEventListener("click", (event) => {
        const button = event.target.closest("[data-claim-mission]");
        if (!button) {
          return;
        }

        this.handleInteraction({ playNavigation: false });
        this.claimMissionReward(button.dataset.claimMission);
      });

      this.elements.achievementsCategoryList?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-achievement-category]");
        if (!button) {
          return;
        }

        const categoryId = button.dataset.achievementCategory;
        if (
          !ACHIEVEMENT_CATEGORIES.some((category) => category.id === categoryId) ||
          this.state.selectedAchievementCategory === categoryId
        ) {
          return;
        }

        this.handleInteraction({ playNavigation: false });
        this.state.selectedAchievementCategory = categoryId;
        this.renderAchievementsScreen();
      });

      // Shop
      this.elements.openShopButton?.addEventListener("click", () => {
        this.handleInteraction();
        this.state.shopReturnScreen = "home";
        this.showScreen("shop");
      });

      this.elements.backFromShopButton?.addEventListener("click", () => {
        this.handleInteraction();
        const returnTo = this.state.shopReturnScreen || "home";
        this.state.shopReturnScreen = "home";
        if (returnTo === "setup") {
          this.showScreen("setup");
          this.updateSetupSummary();
        } else {
          this.showScreen("home");
        }
      });

      this.elements.changeAircraftButton?.addEventListener("click", () => {
        this.handleInteraction();
        this.state.shopReturnScreen = "setup";
        this.showScreen("shop");
      });

      // Daily Challenge
      this.elements.openDailyButton?.addEventListener("click", () => {
        this.handleInteraction();
        this.startDailyChallenge();
      });

      // Score Card Share
      this.elements.shareScoreCardButton?.addEventListener("click", () => {
        this.handleInteraction({ playNavigation: false });
        this.shareScoreCard();
      });

      // Leaderboard tabs
      this.elements.lbTabLocal?.addEventListener("click", () => {
        this.switchLeaderboardTab("local");
      });
      this.elements.lbTabGlobal?.addEventListener("click", () => {
        this.switchLeaderboardTab("global");
      });
      this.elements.lbTabDaily?.addEventListener("click", () => {
        this.switchLeaderboardTab("daily");
      });

      this.elements.lbCountryFilter?.addEventListener("change", () => {
        this.loadLeaderboardTab(this.state.leaderboardTab);
      });
    }

    bindInstallPromptEvents() {
      if (typeof window === "undefined") {
        return;
      }

      const handleInstallabilityChange = () => {
        this.updateInstallButtonVisibility();
      };

      window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        this.deferredInstallPrompt = event;
        handleInstallabilityChange();
      });

      window.addEventListener("appinstalled", () => {
        this.deferredInstallPrompt = null;
        handleInstallabilityChange();
      });

      window.matchMedia?.("(display-mode: standalone)")?.addEventListener?.(
        "change",
        handleInstallabilityChange
      );

      handleInstallabilityChange();
    }

    handleInteraction({ playButton = true, playNavigation = false } = {}) {
      this.audio.unlock();
      if (playButton) {
        this.audio.playButton();
      }
      if (playNavigation) {
        this.audio.playNavigation();
      }
    }

    bindBooleanSettingToggle(elementKey, settingKey) {
      const element = this.elements[elementKey];
      if (!element) {
        return;
      }

      element.addEventListener("change", () => {
        this.state.settings[settingKey] = element.checked;
        this.saveSettings();
      });
    }

    isInstalledPwa() {
      return (
        window.matchMedia?.("(display-mode: standalone)")?.matches ||
        window.navigator.standalone === true
      );
    }

    updateInstallButtonVisibility() {
      if (!this.elements.installDeviceButton) {
        return;
      }

      this.elements.installDeviceButton.hidden =
        !this.deferredInstallPrompt || this.isInstalledPwa();
    }

    async promptInstall() {
      if (!this.deferredInstallPrompt || this.isInstalledPwa()) {
        this.updateInstallButtonVisibility();
        return;
      }

      const promptEvent = this.deferredInstallPrompt;
      try {
        await promptEvent.prompt();
        await promptEvent.userChoice?.catch(() => null);
      } finally {
        this.deferredInstallPrompt = null;
        this.updateInstallButtonVisibility();
      }
    }

    restoreDisplayMode() {
      this.applyDisplayMode("auto");
    }

    getViewportMetrics() {
      const visualViewport = window.visualViewport;
      const viewportWidth = Math.round(
        visualViewport?.width || window.innerWidth || document.documentElement.clientWidth || 0
      );
      const viewportHeight = Math.round(
        visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || 0
      );

      return {
        width: viewportWidth,
        height: viewportHeight,
        shortSide: Math.min(viewportWidth, viewportHeight),
        longSide: Math.max(viewportWidth, viewportHeight)
      };
    }

    detectAutoDisplayMode() {
      const { width, height, shortSide, longSide } = this.getViewportMetrics();
      const userAgent = navigator.userAgent || "";
      const platform = navigator.platform || "";
      const maxTouchPoints = Number(navigator.maxTouchPoints || 0);
      const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
      const hoverNone = window.matchMedia?.("(hover: none)")?.matches ?? false;
      const canHover = window.matchMedia?.("(hover: hover)")?.matches ?? false;
      const isTouchDevice = coarsePointer || hoverNone || maxTouchPoints > 0;
      const isIpad =
        /\biPad\b/i.test(userAgent) || (platform === "MacIntel" && maxTouchPoints > 1);
      const isIphone = /\b(iPhone|iPod)\b/i.test(userAgent);
      const isAndroid = /Android/i.test(userAgent);
      const isTabletUa =
        isIpad ||
        /Tablet|PlayBook|Silk/i.test(userAgent) ||
        (isAndroid && !/Mobile/i.test(userAgent));
      const isPhoneUa = isIphone || (isAndroid && /Mobile/i.test(userAgent));
      const isDesktopLike = canHover && !isTouchDevice;
      const prefersDesktopLayout = canHover && width >= 960 && !isPhoneUa && !isTabletUa;

      if (isPhoneUa) {
        return "mobile";
      }

      if (isTabletUa) {
        return "tablet";
      }

      if (prefersDesktopLayout) {
        return "desktop";
      }

      if (isDesktopLike && shortSide >= 900) {
        return "desktop";
      }

      if (shortSide <= 520 || width <= 760 || height <= 520) {
        return "mobile";
      }

      if (isTouchDevice) {
        if (shortSide >= 700 || longSide >= 920) {
          return "tablet";
        }
        return "mobile";
      }

      if (width >= 1180 || shortSide >= 820) {
        return "desktop";
      }

      return "tablet";
    }

    syncAutoDisplayMode() {
      const activePreference =
        this.elements.displayModeSelect?.value ||
        document.body.dataset.displayModePreference ||
        "auto";
      if (activePreference !== "auto") {
        return;
      }

      document.body.dataset.displayMode = this.detectAutoDisplayMode();
      document.body.dataset.displayModePreference = "auto";
    }

    applyDisplayMode(mode) {
      const displayMode = ["auto", "tablet", "mobile", "desktop"].includes(mode) ? mode : "auto";
      if (this.elements.displayModeSelect) {
        this.elements.displayModeSelect.value = displayMode;
      }
      document.body.dataset.displayModePreference = displayMode;
      document.body.dataset.displayMode =
        displayMode === "auto" ? this.detectAutoDisplayMode() : displayMode;
      window.localStorage.setItem("turboWingsDisplayMode", displayMode);
    }

    restoreCollisionDebug() {
      const enabled = window.localStorage.getItem("turboWingsCollisionDebug") === "on";
      this.applyCollisionDebug(enabled);
    }

    applyCollisionDebug(enabled) {
      const isEnabled = !!enabled;
      if (this.elements.collisionDebugSelect) {
        this.elements.collisionDebugSelect.value = isEnabled ? "on" : "off";
      }
      document.body.dataset.collisionDebug = isEnabled ? "on" : "off";
      window.localStorage.setItem("turboWingsCollisionDebug", isEnabled ? "on" : "off");
      this.game?.setCollisionDebug(isEnabled);
    }

    refreshUi() {
      this.buildSettingsOptions();
      this.renderTranslations();
      this.renderDifficultyCards();
      this.renderDifficultySettings();
      this.renderLeaderboard();
      this.renderHomeDashboard();
      this.renderAchievementsScreen();
      this.renderGameOverSummary(this.state.latestResult);
      this.renderNotifications();
      this.updateSetupForm();
      this.updateSetupSummary();
      this.updateBestScore(this.getBestScoreValue());
      this.updateGameMeta();
      this.updateRunCoins(this.state.runCoins || 0);
      this.updateFlightLevel(this.state.flightLevel || 1);
      this.updateActiveEffects(this.state.activeEffects || []);
      this.syncAudioForCurrentScreen();
      this.updateDailyButton();
    }

    renderTranslations() {
      document.querySelectorAll("[data-i18n]").forEach((element) => {
        element.textContent = t(element.dataset.i18n);
      });

      this.elements.playerNameInput.placeholder = t("setup.playerPlaceholder");
      this.elements.pauseButton.textContent = this.game?.paused ? t("game.resume") : t("game.pause");
    }

    buildSettingsOptions() {
      this.elements.languageSelect.innerHTML = getLanguageOptions()
        .map((option) => `<option value="${option.value}">${option.label}</option>`)
        .join("");
      this.elements.languageSelect.value = getLanguage();

      this.elements.themeSelect.innerHTML = getThemeList()
        .map((theme) => `<option value="${theme.id}">${t(theme.labelKey)}</option>`)
        .join("");
      this.elements.themeSelect.value = getActiveThemeId();

      this.elements.musicToggle.checked = this.state.settings.musicEnabled;
      this.elements.sfxToggle.checked = this.state.settings.sfxEnabled;
      this.elements.gameplayAudioToggle.checked = this.state.settings.gameplayAudioEnabled;
      if (this.elements.obstaclesToggle) {
        this.elements.obstaclesToggle.checked = this.state.settings.obstaclesEnabled;
      }
      this.elements.powerUpsToggle.checked = this.state.settings.powerUpsEnabled;
      this.elements.coinsToggle.checked = this.state.settings.coinsEnabled;
      this.elements.effectsToggle.checked = this.state.settings.effectsEnabled;
    }

    renderDifficultyCards() {
      const selectedDifficulty = this.resolveDifficultySelection(this.state.lastSetup?.difficultyId);
      this.elements.difficultyList.innerHTML = this.difficulties
        .map((difficulty) => {
          const unlocked = this.isDifficultyUnlocked(difficulty.id);
          const checked = selectedDifficulty === difficulty.id ? "checked" : "";
          const disabled = unlocked ? "" : "disabled";
          const status = unlocked ? t("setup.unlocked") : t("setup.locked");
          const requirementText = unlocked
            ? t("setup.startReady")
            : this.getUnlockRequirementText(difficulty);

          return `
            <label class="difficulty-card ${unlocked ? "" : "locked"}" data-difficulty-id="${difficulty.id}">
              <input type="radio" name="difficulty" value="${difficulty.id}" ${checked} ${disabled} />
              <div class="difficulty-card-head">
                <span class="difficulty-visual" aria-hidden="true"></span>
                <strong>${this.getDisplayDifficultyLabel(difficulty)}</strong>
              </div>
              <span class="difficulty-badge">${status}</span>
              <p>${t(difficulty.descriptionKey)}</p>
              <small>${requirementText}</small>
            </label>
          `;
        })
        .join("");
    }

    getDisplayDifficultyLabel(difficulty) {
      const label = typeof difficulty === "string" ? difficulty : t(difficulty.labelKey);
      return String(label).replace(/^\d+\s*-\s*/, "");
    }

    renderDifficultySettings() {
      const markup = this.difficulties
        .map((difficulty) => {
          const tuning = this.state.settings.tuning[difficulty.id];
          return `
            <article class="tuning-card" data-difficulty-id="${difficulty.id}">
              <div class="tuning-head">
                <div class="tuning-head-copy">
                  <span class="difficulty-visual" aria-hidden="true"></span>
                  <strong>${this.getDisplayDifficultyLabel(difficulty)}</strong>
                </div>
              </div>

              <label class="range-row">
                <span>${t("settings.levelSpeed")}</span>
                <input
                  type="range"
                  min="70"
                  max="150"
                  step="1"
                  value="${tuning.speedPercent}"
                  data-difficulty-id="${difficulty.id}"
                  data-setting="speedPercent"
                />
                <output data-output-key="${difficulty.id}-speedPercent">${tuning.speedPercent}%</output>
              </label>

              <label class="range-row">
                <span>${t("settings.obstacleGap")}</span>
                <input
                  type="range"
                  min="70"
                  max="140"
                  step="1"
                  value="${tuning.gapPercent}"
                  data-difficulty-id="${difficulty.id}"
                  data-setting="gapPercent"
                />
                <output data-output-key="${difficulty.id}-gapPercent">${tuning.gapPercent}%</output>
              </label>
            </article>
          `;
        })
        .join("");

      this.elements.difficultySettingsLists.forEach((container) => {
        container.innerHTML = markup;
      });
      this.updateRangeOutputs();
    }

    updateRangeOutputs() {
      this.elements.difficultySettingsLists.forEach((container) => {
        container.querySelectorAll("input[type='range']").forEach((input) => {
          const output = container.querySelector(
            `[data-output-key="${input.dataset.difficultyId}-${input.dataset.setting}"]`
          );
          if (output) {
            output.textContent = `${input.value}%`;
          }
        });
      });
    }

    restoreDefaultDifficultySettings() {
      this.state.settings.tuning = this.difficulties.reduce((accumulator, difficulty) => {
        accumulator[difficulty.id] = { ...DEFAULT_TUNING[difficulty.id] };
        return accumulator;
      }, {});
      this.saveSettings();
      this.renderDifficultySettings();
      this.enqueueNotification({
        type: "info",
        title: t("notify.settingsResetTitle"),
        message: t("notify.settingsResetMessage")
      });
    }

    renderLeaderboard() {
      if (!this.state.leaderboard.length) {
        if (this.elements.leaderboardPodium) {
          this.elements.leaderboardPodium.innerHTML = "";
        }
        this.elements.leaderboardList.innerHTML = `<div class="leaderboard-empty">${t(
          "leaderboard.empty"
        )}</div>`;
      } else {
        const podiumEntries = this.state.leaderboard.slice(0, 3);
        const tableEntries = this.state.leaderboard.slice(3, 11);

        if (this.elements.leaderboardPodium) {
          const podiumOrder = [1, 0, 2];
          this.elements.leaderboardPodium.innerHTML = podiumOrder
            .map((orderIndex) => {
              const entry = podiumEntries[orderIndex];
              if (!entry) {
                return "";
              }

              const difficulty = getDifficultyById(entry.difficultyId);
              return `
                <article class="leaderboard-podium-card leaderboard-podium-card-rank-${orderIndex + 1}">
                  <span class="leaderboard-podium-rank">#${orderIndex + 1}</span>
                  <div class="leaderboard-podium-emblem" aria-hidden="true"></div>
                  <strong>${this.escapeHtml(entry.playerName)}</strong>
                  <span class="leaderboard-podium-score">${entry.score}</span>
                  <span class="leaderboard-podium-difficulty">${t(difficulty.labelKey)}</span>
                </article>
              `;
            })
            .join("");
        }

        const groupedEntries = [tableEntries.slice(0, 4), tableEntries.slice(4, 8)].filter(
          (group) => group.length
        );

        this.elements.leaderboardList.innerHTML = groupedEntries
          .map(
            (group) => `
              <div class="leaderboard-list-column">
                ${group
                  .map((entry, index) => {
                    const difficulty = getDifficultyById(entry.difficultyId);
                    const rank = tableEntries.indexOf(entry) + 4;
                    return `
                      <article class="leaderboard-row leaderboard-row-compact">
                        <span class="leaderboard-rank">#${rank}</span>
                        <strong>${this.escapeHtml(entry.playerName)}</strong>
                        <span>${entry.score}</span>
                        <span class="leaderboard-difficulty-chip leaderboard-difficulty-${difficulty.id}">${t(
                          difficulty.labelKey
                        )}</span>
                        <span>${this.formatDate(entry.timestamp)}</span>
                      </article>
                    `;
                  })
                  .join("")}
              </div>
            `
          )
          .join("");
      }

      const lbTopScore = document.getElementById("lbTopScoreValue");
      const lbTopPilot = document.getElementById("lbTopPilotValue");
      const lbTotalEntries = document.getElementById("lbTotalEntriesValue");
      const lbBestRoute = this.elements.lbBestRouteValue;
      const best = this.state.leaderboard[0];
      const bestRoute = this.getMostFrequentDifficultyId(this.state.leaderboard);
      if (lbTopScore) lbTopScore.textContent = best ? String(best.score) : "—";
      if (lbTopPilot) lbTopPilot.textContent = best ? this.escapeHtml(best.playerName) : "—";
      if (lbTotalEntries) lbTotalEntries.textContent = String(this.state.leaderboard.length);
      if (lbBestRoute) {
        lbBestRoute.textContent = bestRoute ? t(getDifficultyById(bestRoute).labelKey) : "—";
      }
    }

    renderHomeDashboard() {
      const profile = this.state.currentProfile || this.loadProfile(this.getDefaultPlayerName());
      const stats = ensureStats(profile.stats);
      const recentAchievements = (profile.recentAchievements || []).slice(0, 3);
      const bestEntry = this.state.leaderboard[0];
      const activeTheme = getTheme(getActiveThemeId());
      const selectedDifficulty = getDifficultyById(
        this.resolveDifficultySelection(this.state.lastSetup?.difficultyId)
      );
      const playerLevel = format("game.flightLevelValue", {
        level: Math.max(1, stats.highestFlightLevel || 1)
      });

      this.elements.homeTopPilotName.textContent = profile.playerName;
      this.elements.homePlayerLevelValue.textContent = playerLevel;
      this.elements.homeThemeValue.textContent = t(activeTheme?.labelKey || "theme.default");
      this.elements.homeDifficultyValue.textContent = t(selectedDifficulty.labelKey);
      this.elements.homeMusicStatusValue.textContent = t(
        this.state.settings.musicEnabled ? "ui.on" : "ui.off"
      );
      this.elements.homeSfxStatusValue.textContent = t(
        this.state.settings.sfxEnabled ? "ui.on" : "ui.off"
      );
      this.elements.homeTopCoinsValue.textContent = String(this.state.totalCoins);
      this.elements.homeProfileName.textContent = profile.playerName;
      this.elements.homeProfileMeta.textContent = format("home.profileMeta", {
        survival: this.formatDuration(stats.longestSurvivalTime),
        shields: stats.totalShieldSaves
      });
      this.elements.homeBestScoreValue.textContent = String(this.getBestScoreValue());
      this.elements.homeTotalCoinsValue.textContent = String(this.state.totalCoins);
      this.elements.homeHighestFlightValue.textContent = format("game.flightLevelValue", {
        level: stats.highestFlightLevel
      });
      this.elements.homeRunsValue.textContent = String(stats.totalRuns);
      this.elements.homeTopPilotValue.textContent = bestEntry
        ? bestEntry.playerName
        : t("home.noPilot");
      this.elements.homeUnlockedValue.textContent = `${this.getUnlockedCount()} / ${this.difficulties.length}`;

      this.elements.homeMissionsList.innerHTML = profile.missions.length
        ? profile.missions.map((mission) => this.renderMissionCard(mission)).join("")
        : `<div class="empty-state">${t("home.noMissions")}</div>`;

      this.elements.homeRecentAchievementsList.innerHTML = recentAchievements.length
        ? recentAchievements.map((entry) => this.renderRecentAchievement(entry)).join("")
        : `<div class="empty-state">${t("home.noRecentAchievements")}</div>`;
    }

    renderMissionCard(mission) {
      const progressRatio = Math.min(1, mission.progress / mission.objective);
      const statusLabel =
        mission.status === "completed"
          ? t("missions.completed")
          : mission.status === "claimed"
          ? t("missions.claimed")
          : t("missions.active");
      const progressText = format("missions.progress", {
        progress: Math.floor(mission.progress),
        objective: mission.objective
      });

      return `
        <article class="mission-card mission-card-${mission.status}">
          <div class="mission-head">
            <span class="mini-label">${statusLabel}</span>
            <strong>${t(mission.titleKey)}</strong>
          </div>
          <p class="helper-text">${t(mission.descriptionKey)}</p>
          <div class="mission-progress">
            <div class="mission-progress-bar">
              <span style="width:${progressRatio * 100}%"></span>
            </div>
            <span class="mission-progress-text">${progressText}</span>
          </div>
          <div class="mission-foot">
            <span class="mission-reward">${format("missions.reward", { coins: mission.reward })}</span>
            ${
              mission.status === "completed"
                ? `<button class="button button-primary button-compact" type="button" data-claim-mission="${mission.id}">${t(
                    "missions.claim"
                  )}</button>`
                : `<button class="button button-secondary button-compact" type="button" disabled>${t(
                    mission.status === "claimed" ? "missions.claimed" : "missions.claim"
                  )}</button>`
            }
          </div>
        </article>
      `;
    }

    renderRecentAchievement(entry) {
      const achievement = this.achievementMap[entry.id];
      if (!achievement) {
        return "";
      }

      return `
        <article class="achievement-mini-card">
          <strong>${this.getAchievementTitle(achievement)}</strong>
          <p class="helper-text">${this.getAchievementDescription(achievement)}</p>
          <span class="achievement-mini-date">${this.formatDate(entry.unlockedAt)}</span>
        </article>
      `;
    }

    getAchievementText(achievement, field) {
      const directValue = achievement?.[field];
      if (directValue && typeof directValue === "object") {
        return (
          directValue[getLanguage()] ||
          directValue["pt-BR"] ||
          directValue["en-US"] ||
          Object.values(directValue)[0] ||
          ""
        );
      }

      if (typeof directValue === "string" && directValue) {
        return directValue;
      }

      const key = achievement?.[`${field}Key`];
      return key ? t(key) : "";
    }

    getAchievementTitle(achievement) {
      return this.getAchievementText(achievement, "title");
    }

    getAchievementDescription(achievement) {
      return this.getAchievementText(achievement, "description");
    }

    getAchievementProgress(achievement, stats, unlocked) {
      if (unlocked) {
        return {
          current: achievement.targetValue || 1,
          target: achievement.targetValue || 1,
          ratio: 1
        };
      }

      if (!achievement.statKey || !achievement.targetValue) {
        return {
          current: 0,
          target: achievement.targetValue || 1,
          ratio: 0
        };
      }

      const current = Math.min(
        Number(stats?.[achievement.statKey] || 0),
        Number(achievement.targetValue || 1)
      );
      const target = Number(achievement.targetValue || 1);

      return {
        current,
        target,
        ratio: target > 0 ? current / target : 0
      };
    }

    renderAchievementTile(achievement, achievementEntry, stats, { featured = false } = {}) {
      const unlocked = !!achievementEntry?.unlocked;
      const unlockedAt = achievementEntry?.unlockedAt;
      const progress = this.getAchievementProgress(achievement, stats, unlocked);
      const ratioPercent = Math.max(0, Math.min(100, progress.ratio * 100));
      const badgeText = unlocked ? t("achievements.unlocked") : t("achievements.locked");
      const rewardValue = Math.max(0, achievement.reward || 0);
      const cardClass = featured ? "achievement-showcase-card" : "achievement-library-card";

      return `
        <article class="achievement-card ${cardClass} ${unlocked ? "unlocked" : "locked"}">
          <div class="achievement-card-top">
            <span class="achievement-emblem achievement-emblem-${achievement.categoryId}" aria-hidden="true"></span>
            <span class="achievement-status-pill ${unlocked ? "is-unlocked" : ""}">${badgeText}</span>
          </div>
          <div class="achievement-card-copy">
            <strong>${this.getAchievementTitle(achievement)}</strong>
            <p class="helper-text">${this.getAchievementDescription(achievement)}</p>
          </div>
          <div class="achievement-reward-row">
            <strong>${rewardValue}</strong>
            <span class="achievement-reward-coin" aria-hidden="true"></span>
          </div>
          ${
            unlocked
              ? `
                <div class="achievement-locked-meta achievement-locked-meta-unlocked">
                  <span>${t("achievements.unlocked")}</span>
                  <span>${
                    unlockedAt
                      ? this.formatDate(unlockedAt)
                      : t("achievements.notUnlockedYet")
                  }</span>
                </div>
              `
              : `
                <div class="achievement-progress-bar">
                  <span style="width:${ratioPercent}%"></span>
                </div>
                <div class="achievement-locked-meta">
                  <span>${t("achievements.notUnlockedYet")}</span>
                  <span>${Math.round(progress.current)} / ${Math.round(progress.target)}</span>
                </div>
              `
          }
        </article>
      `;
    }

    renderAchievementsScreen() {
      const profile = this.state.currentProfile || this.loadProfile(this.getDefaultPlayerName());
      const achievementState = profile.achievements || {};
      const stats = ensureStats(profile.stats);
      const selectedCategoryId = ACHIEVEMENT_CATEGORIES.some(
        (category) => category.id === this.state.selectedAchievementCategory
      )
        ? this.state.selectedAchievementCategory
        : "all";
      const unlockedCount = this.achievementTemplates.filter(
        (achievement) => achievementState[achievement.id]?.unlocked
      ).length;
      const rewardTotal = this.achievementTemplates.reduce((total, achievement) => {
        return achievementState[achievement.id]?.unlocked ? total + (achievement.reward || 0) : total;
      }, 0);
      const totalAchievements = this.achievementTemplates.length;
      const masteryPercent = totalAchievements
        ? Math.round((unlockedCount / totalAchievements) * 100)
        : 0;
      const featuredSet = new Set(FEATURED_ACHIEVEMENT_IDS);
      const matchesSelectedCategory = (achievement) =>
        selectedCategoryId === "all" || achievement.categoryId === selectedCategoryId;
      const featuredAchievements = this.achievementTemplates.filter(
        (achievement) => featuredSet.has(achievement.id) && matchesSelectedCategory(achievement)
      );
      const libraryAchievements = this.achievementTemplates.filter(
        (achievement) => !featuredSet.has(achievement.id) && matchesSelectedCategory(achievement)
      );

      this.elements.achievementsUnlockedValue.textContent = `${unlockedCount} / ${totalAchievements}`;
      if (this.elements.achievementsTotalValue) {
        this.elements.achievementsTotalValue.textContent = String(totalAchievements);
      }
      this.elements.achievementsRewardedCoinsValue.textContent = String(rewardTotal);
      if (this.elements.achievementsMasteryValue) {
        this.elements.achievementsMasteryValue.textContent = `${masteryPercent}%`;
      }
      if (this.elements.achievementsMasteryMeta) {
        this.elements.achievementsMasteryMeta.textContent = format("achievements.masterySummary", {
          unlocked: unlockedCount,
          total: totalAchievements
        });
      }
      if (this.elements.achievementsMasteryBar) {
        this.elements.achievementsMasteryBar.style.width = `${masteryPercent}%`;
      }

      if (this.elements.achievementsCategoryList) {
        this.elements.achievementsCategoryList.innerHTML = ACHIEVEMENT_CATEGORIES.map((category) => {
          const categoryAchievements =
            category.id === "all"
              ? this.achievementTemplates
              : this.achievementTemplates.filter(
                  (achievement) => achievement.categoryId === category.id
                );
          const categoryUnlocked = categoryAchievements.filter(
            (achievement) => achievementState[achievement.id]?.unlocked
          ).length;

          return `
            <button
              class="achievements-category-item ${
                category.id === selectedCategoryId ? "is-active" : ""
              }"
              type="button"
              data-achievement-category="${category.id}"
            >
              <span class="achievements-category-icon ${category.iconClass}" aria-hidden="true"></span>
              <div class="achievements-category-copy">
                <strong>${t(category.labelKey)}</strong>
                <span>${categoryUnlocked} / ${categoryAchievements.length}</span>
              </div>
            </button>
          `;
        }).join("");
      }

      if (this.elements.achievementsFeaturedList) {
        const featuredSection = this.elements.achievementsFeaturedList.closest(
          ".achievements-featured-section"
        );
        if (featuredSection) {
          featuredSection.hidden =
            selectedCategoryId !== "all" && featuredAchievements.length === 0;
        }
        this.elements.achievementsFeaturedList.innerHTML = featuredAchievements
          .map((achievement) =>
            this.renderAchievementTile(achievement, achievementState[achievement.id], stats, {
              featured: true
            })
          )
          .join("");
      }

      const librarySection = this.elements.achievementsList?.closest(".achievements-library-section");
      if (librarySection) {
        librarySection.hidden = selectedCategoryId !== "all" && libraryAchievements.length === 0;
      }

      this.elements.achievementsList.innerHTML = libraryAchievements
        .map((achievement) =>
          this.renderAchievementTile(achievement, achievementState[achievement.id], stats)
        )
        .join("");
    }

    renderGameOverSummary(result) {
      if (!result) {
        this.elements.finalScoreValue.textContent = "0";
        this.elements.finalCoinsValue.textContent = "0";
        this.elements.bestScoreValue.textContent = String(this.getBestScoreValue());
        this.elements.gameOverTotalCoinsValue.textContent = String(this.state.totalCoins);
        this.elements.gameOverTimeValue.textContent = this.formatDuration(0);
        this.elements.gameOverFlightLevelValue.textContent = format("game.flightLevelValue", {
          level: 1
        });
        this.elements.gameOverPowerUpsValue.textContent = "0";
        this.elements.gameOverObstaclesValue.textContent = "0";
        if (this.elements.gameOverMissionsCountValue) {
          this.elements.gameOverMissionsCountValue.textContent = "0";
        }
        if (this.elements.gameOverAchievementsCountValue) {
          this.elements.gameOverAchievementsCountValue.textContent = "0";
        }
        this.elements.gameOverMissionsList.innerHTML = "";
        this.elements.gameOverAchievementsList.innerHTML = "";
        return;
      }

      this.elements.finalScoreValue.textContent = String(result.score);
      this.elements.finalCoinsValue.textContent = String(result.coinsCollected || 0);
      this.elements.bestScoreValue.textContent = String(this.getBestScoreValue());
      this.elements.gameOverTotalCoinsValue.textContent = String(result.totalCoins || this.state.totalCoins);
      this.elements.gameOverTimeValue.textContent = this.formatDuration(result.timeSurvived || 0);
      this.elements.gameOverFlightLevelValue.textContent = format("game.flightLevelValue", {
        level: result.flightLevelReached || 1
      });
      this.elements.gameOverPowerUpsValue.textContent = String(result.powerUpsCollected || 0);
      this.elements.gameOverObstaclesValue.textContent = String(result.obstaclesPassed || 0);
      if (this.elements.gameOverMissionsCountValue) {
        this.elements.gameOverMissionsCountValue.textContent = String(
          result.missionsCompleted?.length || 0
        );
      }
      if (this.elements.gameOverAchievementsCountValue) {
        this.elements.gameOverAchievementsCountValue.textContent = String(
          result.achievementsUnlocked?.length || 0
        );
      }
      this.elements.gameOverMeta.textContent = format("game.resultMeta", {
        player: result.playerName,
        difficulty: t(getDifficultyById(result.difficultyId).labelKey),
        date: this.formatDate(result.timestamp)
      });

      if (result.unlockedDifficultyId) {
        this.elements.unlockNotice.textContent = format("game.unlockNotice", {
          difficulty: t(getDifficultyById(result.unlockedDifficultyId).labelKey)
        });
        this.elements.unlockNotice.classList.remove("hidden");
      } else {
        this.elements.unlockNotice.classList.add("hidden");
      }

      this.elements.gameOverMissionsList.innerHTML = result.missionsCompleted?.length
        ? result.missionsCompleted
            .map((mission) => `<span class="summary-badge">${t(mission.titleKey)}</span>`)
            .join("")
        : `<span class="summary-empty">${t("game.noMissionsCompleted")}</span>`;

      this.elements.gameOverAchievementsList.innerHTML = result.achievementsUnlocked?.length
        ? result.achievementsUnlocked
            .map(
              (achievement) =>
                `<span class="summary-badge">${this.getAchievementTitle(achievement)}</span>`
            )
            .join("")
        : `<span class="summary-empty">${t("game.noAchievementsUnlocked")}</span>`;
    }

    renderNotifications() {
      this.elements.notifications.innerHTML = this.state.notifications
        .map(
          (notification) => `
            <article class="notification-card notification-${notification.type}">
              <strong>${this.escapeHtml(notification.title)}</strong>
              <p>${this.escapeHtml(notification.message)}</p>
            </article>
          `
        )
        .join("");
    }

    enqueueNotification(notification) {
      const item = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        type: notification.type || "info",
        title: notification.title,
        message: notification.message
      };
      this.state.notifications = [item, ...this.state.notifications].slice(0, 4);
      this.renderNotifications();

      const timerId = window.setTimeout(() => {
        this.state.notifications = this.state.notifications.filter(
          (currentItem) => currentItem.id !== item.id
        );
        this.notificationTimers.delete(item.id);
        this.renderNotifications();
      }, 3400);

      this.notificationTimers.set(item.id, timerId);
    }

    updateSetupForm() {
      this.elements.playerNameInput.value =
        this.state.lastSetup?.playerName || this.getDefaultPlayerName();
      this.elements.playerNameInput.placeholder = t("setup.playerPlaceholder");
    }

    updateSetupSummary() {
      const selectedDifficulty = this.getSelectedDifficultyId();
      const difficulty = getDifficultyById(selectedDifficulty);
      const playerName = this.normalizePlayerName(
        this.elements.playerNameInput.value || this.state.lastSetup?.playerName,
        this.getDefaultPlayerName()
      );

      this.elements.setupSummaryValue.textContent = format("setup.selectedSummary", {
        player: playerName,
        difficulty: this.getDisplayDifficultyLabel(difficulty)
      });

      const unlocked = this.isDifficultyUnlocked(selectedDifficulty);
      const statusText = unlocked ? t("setup.startReady") : this.getUnlockRequirementText(difficulty);
      this.elements.setupStatusText.textContent = statusText;
      if (this.elements.setupBriefPilotValue) {
        this.elements.setupBriefPilotValue.textContent = playerName;
      }
      const selectedAc = Aircraft.getAircraftById(this.state.selectedAircraftId);
      if (this.elements.setupBriefShipValue) {
        this.elements.setupBriefShipValue.textContent = selectedAc ? t(selectedAc.nameKey) : "Turbo Hawk X7";
      }
      if (selectedAc) {
        if (this.elements.setupFeatureName) {
          this.elements.setupFeatureName.textContent = t(selectedAc.nameKey);
        }
        if (this.elements.setupFeatureClass) {
          this.elements.setupFeatureClass.textContent = t(selectedAc.classKey);
        }
        if (this.elements.setupFeatureJet) {
          this.elements.setupFeatureJet.src = selectedAc.imageSrc;
        }
        if (this.elements.setupFeatureSpeedBar) {
          this.elements.setupFeatureSpeedBar.style.width = `${selectedAc.speed}%`;
        }
        if (this.elements.setupFeatureHandlingBar) {
          this.elements.setupFeatureHandlingBar.style.width = `${selectedAc.handling}%`;
        }
        if (this.elements.setupFeatureDurabilityBar) {
          this.elements.setupFeatureDurabilityBar.style.width = `${selectedAc.durability}%`;
        }
      }
      if (this.elements.setupBriefDifficultyValue) {
        this.elements.setupBriefDifficultyValue.textContent =
          this.getDisplayDifficultyLabel(difficulty);
      }
      if (this.elements.setupReadinessValue) {
        this.elements.setupReadinessValue.textContent = unlocked
          ? t("setup.readyForTakeoff")
          : this.getUnlockRequirementText(difficulty);
      }
      if (this.elements.setupReadinessMeter) {
        Array.from(this.elements.setupReadinessMeter.children).forEach((item, index) => {
          item.classList.toggle("is-active", index < difficulty.level);
          item.classList.toggle("is-locked", !unlocked && index >= difficulty.level - 1);
        });
      }
      this.elements.startFlightButton.disabled = !unlocked;
    }

    updateScore(score) {
      this.elements.scoreValue.textContent = String(score);
    }

    updateRunCoins(coins) {
      this.state.runCoins = coins;
      this.elements.coinsValue.textContent = String(coins);
    }

    updateFlightLevel(flightLevel) {
      this.state.flightLevel = flightLevel;
      this.elements.flightLevelValue.textContent = format("game.flightLevelValue", {
        level: flightLevel
      });
    }

    updateActiveEffects(effects) {
      this.state.activeEffects = effects;
      if (!effects.length) {
        this.elements.activeEffectsList.innerHTML = "";
        return;
      }

      this.elements.activeEffectsList.innerHTML = effects
        .map((effect) => {
          const name = t(`powerup.${effect.type}`);
          const time = effect.remaining.toFixed(1);
          return `<span class="effect-badge effect-badge-${effect.type}">${format(
            "powerup.timer",
            { name, time }
          )}</span>`;
        })
        .join("");
    }

    updateBestScore(score) {
      const formattedScore = String(score);
      this.elements.homeBestScoreValue.textContent = formattedScore;
      this.elements.bestScoreValue.textContent = formattedScore;
    }

    updateGameMeta() {
      const runConfig = this.state.currentRun || this.state.lastSetup;
      if (!runConfig) {
        this.elements.runMetaValue.textContent = format("setup.selectedSummary", {
          player: this.getDefaultPlayerName(),
          difficulty: t(getDifficultyById("normal").labelKey)
        });
        return;
      }

      this.elements.runMetaValue.textContent = format("setup.selectedSummary", {
        player: runConfig.playerName,
        difficulty: t(getDifficultyById(runConfig.difficultyId).labelKey)
      });
    }

    getBestScoreValue() {
      return Math.max(this.game?.getBestScore?.() || 0, this.state.leaderboard[0]?.score || 0);
    }

    getDefaultPlayerName() {
      return t("setup.defaultPlayerName");
    }

    getSelectedDifficultyId() {
      const selectedInput = this.elements.difficultyList.querySelector(
        "input[name='difficulty']:checked"
      );
      return this.resolveDifficultySelection(
        selectedInput?.value || this.state.lastSetup?.difficultyId
      );
    }

    resolveDifficultySelection(difficultyId) {
      const requested = this.difficulties.find((difficulty) => difficulty.id === difficultyId);
      if (!requested) {
        return this.getHighestUnlockedDifficultyId() || "normal";
      }
      if (this.isDifficultyUnlocked(requested.id)) {
        return requested.id;
      }
      return this.getHighestUnlockedDifficultyId() || "normal";
    }

    getHighestUnlockedDifficultyId() {
      const unlocked = this.difficulties.filter((difficulty) =>
        this.isDifficultyUnlocked(difficulty.id)
      );
      return unlocked[unlocked.length - 1]?.id || "normal";
    }

    isDifficultyUnlocked(difficultyId) {
      if (difficultyId === "breeze" || difficultyId === "normal" || difficultyId === "storm") {
        return true;
      }
      if (difficultyId === "turbo") {
        return this.state.unlocks.turbo;
      }
      if (difficultyId === "legend") {
        return this.state.unlocks.legend;
      }
      return false;
    }

    getUnlockedCount() {
      return this.difficulties.filter((difficulty) => this.isDifficultyUnlocked(difficulty.id))
        .length;
    }

    getUnlockRequirementText(difficulty) {
      if (!difficulty.unlockRequirement) {
        return t("setup.startReady");
      }
      const sourceDifficulty = getDifficultyById(difficulty.unlockRequirement.difficultyId);
      return format("setup.lockedHint", {
        score: difficulty.unlockRequirement.score,
        difficulty: t(sourceDifficulty.labelKey)
      });
    }

    getMostFrequentDifficultyId(entries) {
      if (!entries?.length) {
        return null;
      }

      const counts = entries.reduce((accumulator, entry) => {
        accumulator[entry.difficultyId] = (accumulator[entry.difficultyId] || 0) + 1;
        return accumulator;
      }, {});

      return Object.entries(counts).sort((left, right) => right[1] - left[1])[0]?.[0] || null;
    }

    normalizePlayerName(value, fallback = null) {
      return Storage.normalizePlayerName(value, fallback || this.getDefaultPlayerName());
    }

    clampValue(rawValue, min, max, fallback) {
      const numericValue = Number(rawValue);
      if (!Number.isFinite(numericValue)) {
        return fallback;
      }
      return Math.min(max, Math.max(min, Math.round(numericValue)));
    }

    escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }

    formatDate(timestamp) {
      try {
        return new Intl.DateTimeFormat(getLanguage(), {
          dateStyle: "short",
          timeStyle: "short"
        }).format(new Date(timestamp));
      } catch (error) {
        return new Date(timestamp).toLocaleString();
      }
    }

    formatDuration(seconds) {
      const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
      const minutes = Math.floor(totalSeconds / 60);
      const remainder = totalSeconds % 60;
      return `${minutes}:${String(remainder).padStart(2, "0")}`;
    }

    openSetup() {
      this.state.lastSetup = {
        ...this.state.lastSetup,
        difficultyId: this.resolveDifficultySelection(this.state.lastSetup?.difficultyId)
      };
      Storage.saveLastSetup(this.state.lastSetup);
      this.renderDifficultyCards();
      this.updateSetupForm();
      this.updateSetupSummary();
      this.showScreen("setup");
    }

    startGameFromSetup() {
      const difficultyId = this.getSelectedDifficultyId();
      if (!this.isDifficultyUnlocked(difficultyId)) {
        this.updateSetupSummary();
        return;
      }

      const defaultName = this.getDefaultPlayerName();
      const playerName = this.normalizePlayerName(this.elements.playerNameInput.value, defaultName);
      this.state.lastSetup = {
        playerName,
        difficultyId,
        usedDefaultName: playerName === defaultName
      };
      Storage.saveLastSetup(this.state.lastSetup);
      this.loadProfile(playerName);
      this.startRun(this.state.lastSetup);
    }

    startGameWithLastSetup() {
      const setup = {
        ...this.state.lastSetup,
        difficultyId: this.resolveDifficultySelection(this.state.lastSetup?.difficultyId),
        playerName: this.normalizePlayerName(
          this.state.lastSetup?.playerName,
          this.getDefaultPlayerName()
        )
      };
      this.loadProfile(setup.playerName);
      this.startRun(setup);
    }

    startRun(setup) {
      const isDaily = !!setup.isDaily;
      this.state.isDaily = isDaily;
      this.state.currentRun = {
        playerName: setup.playerName,
        difficultyId: setup.difficultyId,
        themeId: getActiveThemeId(),
        startedAt: Date.now(),
        isDaily
      };
      this.state.latestResult = null;
      this.state.runCoins = 0;
      this.state.flightLevel = 1;
      this.hideGameOverlays();
      this.elements.scoreValue.textContent = "0";
      this.elements.coinsValue.textContent = "0";
      this.updateFlightLevel(1);
      this.elements.finalScoreValue.textContent = "0";
      this.elements.finalCoinsValue.textContent = "0";
      this.updateActiveEffects([]);
      this.updateGameMeta();
      if (this.elements.hudDailyBadge) {
        this.elements.hudDailyBadge.classList.toggle("hidden", !isDaily);
      }
      this.showScreen("game");
      this.game.enter({
        difficultyId: setup.difficultyId,
        tuning: this.state.settings.tuning[setup.difficultyId],
        themeId: getActiveThemeId(),
        features: {
          obstaclesEnabled: this.state.settings.obstaclesEnabled,
          powerUpsEnabled: this.state.settings.powerUpsEnabled,
          coinsEnabled: this.state.settings.coinsEnabled,
          effectsEnabled: this.state.settings.effectsEnabled
        },
        rng: isDaily ? Daily.getDailyRng() : null
      });
    }

    leaveGame(targetScreen = "home") {
      this.game.stop();
      this.game.reset();
      this.state.currentRun = null;
      this.updateFlightLevel(1);
      this.updateActiveEffects([]);
      this.showScreen(targetScreen);
      if (targetScreen === "setup") {
        this.openSetup();
      }
    }

    showScreen(screenName, { playNavigation = true } = {}) {
      this.state.screen = screenName;
      this.elements.screens.forEach((screen) => {
        const active = screen.dataset.screen === screenName;
        screen.hidden = !active;
        screen.classList.toggle("active", active);
      });

      if (screenName !== "game") {
        this.game?.stop();
        this.hideGameOverlays();
      }

      if (screenName === "leaderboard") {
        this.renderLeaderboardTabs();
        this.loadLeaderboardTab(this.state.leaderboardTab);
      }

      if (screenName === "shop") {
        this.renderShopScreen();
      }

      if (playNavigation) {
        this.audio.playNavigation();
      }

      this.syncAudioForCurrentScreen();
    }

    syncAudioForCurrentScreen() {
      if (!this.state.settings.musicEnabled) {
        this.audio.stopMusic();
        return;
      }

      if (this.state.screen === "game") {
        this.audio.startGameplayMusic();
      } else {
        this.audio.startMenuMusic();
      }
    }

    getShareUrl() {
      const url = new URL(window.location.href);
      url.search = "";
      url.hash = "";
      return url.toString();
    }

    getSharePayload() {
      return {
        title: t("app.title"),
        text: t("share.message"),
        url: this.getShareUrl()
      };
    }

    getShareText() {
      const payload = this.getSharePayload();
      return `${payload.text} ${payload.url}`.trim();
    }

    openExternalUrl(url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }

    openShareWindow(url) {
      this.openExternalUrl(url);
    }

    tryOpenAppScheme(url) {
      return new Promise((resolve) => {
        let settled = false;
        const iframe = document.createElement("iframe");
        iframe.setAttribute("aria-hidden", "true");
        iframe.tabIndex = -1;
        iframe.style.position = "fixed";
        iframe.style.width = "1px";
        iframe.style.height = "1px";
        iframe.style.opacity = "0";
        iframe.style.pointerEvents = "none";

        const finalize = (opened) => {
          if (settled) {
            return;
          }
          settled = true;
          window.clearTimeout(timerId);
          window.removeEventListener("blur", handleBlur);
          document.removeEventListener("visibilitychange", handleVisibilityChange);
          iframe.remove();
          resolve(opened);
        };

        const handleBlur = () => {
          window.setTimeout(() => {
            if (document.hidden || !document.hasFocus()) {
              finalize(true);
            }
          }, 160);
        };

        const handleVisibilityChange = () => {
          if (document.hidden) {
            finalize(true);
          }
        };

        const timerId = window.setTimeout(() => {
          finalize(document.hidden || !document.hasFocus());
        }, 900);

        window.addEventListener("blur", handleBlur);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.body.append(iframe);
        iframe.src = url;
      });
    }

    async tryOpenAppSchemes(urls) {
      for (const url of urls) {
        const opened = await this.tryOpenAppScheme(url);
        if (opened) {
          return true;
        }
      }
      return false;
    }

    async copyTextToClipboard(value) {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }

      const helper = document.createElement("textarea");
      helper.value = value;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      helper.style.pointerEvents = "none";
      document.body.append(helper);
      helper.select();

      let copied = false;
      try {
        copied = document.execCommand("copy");
      } finally {
        helper.remove();
      }

      return copied;
    }

    async shareWithNativeSheet() {
      if (!navigator.share) {
        return false;
      }

      try {
        await navigator.share(this.getSharePayload());
        return true;
      } catch (error) {
        return false;
      }
    }

    async handleShareAction(target) {
      const shareUrl = this.getShareUrl();
      const shareText = this.getShareText();

      if (target === "instagram") {
        const opened = await this.tryOpenAppSchemes([
          `instagram://share?text=${encodeURIComponent(shareText)}`,
          `instagram://app`
        ]);

        if (opened) {
          return;
        }

        const nativeShared = await this.shareWithNativeSheet();
        if (nativeShared) {
          return;
        }

        const copied = await this.copyTextToClipboard(shareText);
        this.openExternalUrl("https://www.instagram.com/");
        this.enqueueNotification({
          type: copied ? "success" : "info",
          title: t("share.copyTitle"),
          message: format("share.pasteMessage", {
            network: t("share.instagram")
          })
        });
        return;
      }

      if (target === "tiktok") {
        const opened = await this.tryOpenAppSchemes([
          `tiktok://share?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          `snssdk1233://share?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(
            shareUrl
          )}`
        ]);

        if (opened) {
          return;
        }

        const nativeShared = await this.shareWithNativeSheet();
        if (nativeShared) {
          return;
        }

        const copied = await this.copyTextToClipboard(shareText);
        this.openExternalUrl("https://www.tiktok.com/");
        this.enqueueNotification({
          type: copied ? "success" : "info",
          title: t("share.copyTitle"),
          message: format("share.pasteMessage", {
            network: t("share.tiktok")
          })
        });
        return;
      }

      if (target === "copy") {
        const copied = await this.copyTextToClipboard(shareText);
        this.enqueueNotification({
          type: copied ? "success" : "info",
          title: t("share.copyTitle"),
          message: copied ? t("share.copyMessage") : shareUrl
        });
        return;
      }

      if (target === "whatsapp") {
        this.openShareWindow(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
        return;
      }

      if (target === "facebook") {
        this.openShareWindow(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl
          )}&quote=${encodeURIComponent(t("share.message"))}`
        );
        return;
      }

      if (target === "x") {
        this.openShareWindow(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
        );
        return;
      }
    }

    handleGamePhaseChange(phase) {
      this.hideGameOverlays();
      if (phase === "ready") {
        this.elements.startOverlay.classList.add("hidden");
        this.elements.pauseButton.textContent = t("game.pause");
        return;
      }
      if (phase === "paused") {
        this.elements.pauseOverlay.classList.remove("hidden");
        this.elements.pauseButton.textContent = t("game.resume");
        return;
      }
      if (phase === "playing") {
        this.elements.pauseButton.textContent = t("game.pause");
        return;
      }
      if (phase === "gameover") {
        this.elements.gameOverOverlay.classList.remove("hidden");
        this.elements.pauseButton.textContent = t("game.pause");
      }
    }

    finishRun(result) {
      const playerName = this.state.currentRun?.playerName || this.getDefaultPlayerName();
      const profile = this.loadProfile(playerName);
      const statsBefore = ensureStats(profile.stats);
      const run = {
        ...result,
        playerName,
        difficultyId: result.difficultyId,
        timestamp: Date.now(),
        themeId: this.state.currentRun?.themeId || getActiveThemeId(),
        isDaily: !!this.state.currentRun?.isDaily
      };

      const unlockedDifficultyId = this.processUnlocks(run);
      this.state.leaderboard = [...this.state.leaderboard, run]
        .sort((entryA, entryB) => {
          if (entryB.score !== entryA.score) {
            return entryB.score - entryA.score;
          }
          return entryA.timestamp - entryB.timestamp;
        })
        .slice(0, 11);
      this.saveLeaderboard();

      const progressionResult = applyRunToStats(statsBefore, run);
      profile.stats = progressionResult.stats;

      const missionResult = Missions.evaluateMissions(profile.missions, run);
      profile.missions = missionResult.missions;

      const achievementResult = Achievements.evaluateAchievements(
        profile.achievements,
        run,
        profile.stats
      );
      profile.achievements = achievementResult.achievements;
      profile.recentAchievements = Achievements.appendRecentAchievements(
        profile.recentAchievements,
        achievementResult.unlockedNow,
        4
      );

      this.state.totalCoins += (run.coinsCollected || 0) + achievementResult.rewardTotal;
      this.saveTotalCoins();
      this.state.currentProfile = profile;
      this.saveCurrentProfile();

      this.syncBestScoreStorage();
      this.updateBestScore(this.getBestScoreValue());

      this.state.latestResult = {
        ...run,
        bestScore: result.bestScore,
        totalCoins: this.state.totalCoins,
        unlockedDifficultyId,
        missionsCompleted: missionResult.completedNow,
        achievementsUnlocked: achievementResult.unlockedNow
      };

      if (run.wasNewBestScore) {
        this.enqueueNotification({
          type: "record",
          title: t("notify.newRecordTitle"),
          message: format("notify.newRecordMessage", { score: run.score })
        });
      }

      missionResult.completedNow.forEach((mission) => {
        this.enqueueNotification({
          type: "mission",
          title: t("notify.missionCompletedTitle"),
          message: t(mission.titleKey)
        });
      });

      achievementResult.unlockedNow.forEach((achievement) => {
        this.enqueueNotification({
          type: "achievement",
          title: t("notify.achievementUnlockedTitle"),
          message: this.getAchievementTitle(achievement)
        });
      });

      if (achievementResult.rewardTotal > 0) {
        this.enqueueNotification({
          type: "coins",
          title: t("notify.coinsAddedTitle"),
          message: format("notify.coinsAddedMessage", { coins: achievementResult.rewardTotal })
        });
      }

      this.refreshUi();
      this.showGameOver(this.state.latestResult);

      if (run.isDaily) {
        Daily.recordDailyPlay(run.score, run.coinsCollected || 0);
        this.updateDailyButton();
      }
      void this.submitRunOnline(run);
    }

    processUnlocks(run) {
      let unlockedDifficultyId = null;

      if (run.difficultyId === "storm" && run.score >= 100 && !this.state.unlocks.turbo) {
        this.state.unlocks.turbo = true;
        unlockedDifficultyId = "turbo";
      }

      if (run.difficultyId === "turbo" && run.score >= 100 && !this.state.unlocks.legend) {
        this.state.unlocks.legend = true;
        unlockedDifficultyId = "legend";
      }

      if (unlockedDifficultyId) {
        this.saveUnlocks();
      }

      return unlockedDifficultyId;
    }

    claimMissionReward(missionId) {
      const profile = this.state.currentProfile || this.loadProfile(this.getDefaultPlayerName());
      const result = Missions.claimMission(profile.missions, missionId);
      if (!result.reward || !result.claimedMission) {
        return;
      }

      profile.missions = result.missions;
      this.state.currentProfile = profile;
      this.saveCurrentProfile();
      this.state.totalCoins += result.reward;
      this.saveTotalCoins();

      this.enqueueNotification({
        type: "mission",
        title: t("notify.missionClaimedTitle"),
        message: t(result.claimedMission.titleKey)
      });
      this.enqueueNotification({
        type: "coins",
        title: t("notify.coinsAddedTitle"),
        message: format("notify.coinsAddedMessage", { coins: result.reward })
      });

      if (this.state.latestResult) {
        this.state.latestResult.totalCoins = this.state.totalCoins;
      }

      this.refreshUi();
    }

    // ===== AIRCRAFT SHOP =====

    renderShopScreen() {
      const grid = this.elements.shopAircraftGrid;
      if (!grid) {
        return;
      }
      if (this.elements.shopCoinBalance) {
        this.elements.shopCoinBalance.textContent = this.state.totalCoins.toLocaleString();
      }
      grid.innerHTML = "";
      const catalog = Aircraft.getCatalog();
      catalog.forEach((ac) => {
        const owned = this.state.ownedAircraft.includes(ac.id);
        const equipped = this.state.selectedAircraftId === ac.id;
        const canAfford = this.state.totalCoins >= ac.price;
        const card = document.createElement("article");
        card.className = `shop-card${equipped ? " is-equipped" : ""}`;

        const badge = equipped
          ? `<span class="shop-card-badge is-equipped-badge">${t("shop.equippedBadge")}</span>`
          : owned
          ? `<span class="shop-card-badge">${t("shop.ownedBadge")}</span>`
          : "";

        const imgHtml = `<img src="${ac.imageSrc}" alt="${t(ac.nameKey)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><span class="shop-card-art-placeholder" style="display:none"></span>`;

        const actionHtml = equipped
          ? `<button class="button button-secondary" disabled>${t("shop.equippedBadge")}</button>`
          : owned
          ? `<button class="button button-primary" data-equip="${ac.id}">${t("shop.equipButton")}</button>`
          : `<button class="button button-primary" data-buy="${ac.id}" ${canAfford ? "" : "disabled"}>
               ${canAfford ? format("shop.buyButton", { price: ac.price.toLocaleString() }) : t("shop.notEnoughCoins")}
             </button>`;

        card.innerHTML = `
          ${badge}
          <div class="shop-card-art">${imgHtml}</div>
          <div class="shop-card-name">${t(ac.nameKey)}</div>
          <div class="shop-card-class">${t("shop.classLabel")}: ${t(ac.classKey)}</div>
          <div class="shop-card-bars">
            <div class="shop-card-bar">
              <span>${t("shop.statSpeed")}</span>
              <div class="shop-card-bar-track"><div class="shop-card-bar-fill" style="width:${ac.speed}%"></div></div>
            </div>
            <div class="shop-card-bar">
              <span>${t("shop.statHandling")}</span>
              <div class="shop-card-bar-track"><div class="shop-card-bar-fill" style="width:${ac.handling}%"></div></div>
            </div>
          </div>
          <div class="shop-card-action">${actionHtml}</div>
        `;

        card.addEventListener("click", (e) => {
          const buyBtn = e.target.closest("[data-buy]");
          const equipBtn = e.target.closest("[data-equip]");
          if (buyBtn) {
            this.buyAircraft(buyBtn.dataset.buy);
          } else if (equipBtn) {
            this.equipAircraft(equipBtn.dataset.equip);
          }
        });

        grid.appendChild(card);
      });
    }

    buyAircraft(id) {
      const ac = Aircraft.getAircraftById(id);
      if (!ac || this.state.ownedAircraft.includes(id)) {
        return;
      }
      if (this.state.totalCoins < ac.price) {
        this.enqueueNotification({
          type: "warning",
          title: t("shop.notEnoughCoins"),
          message: format("shop.buyButton", { price: ac.price.toLocaleString() })
        });
        return;
      }
      this.state.totalCoins -= ac.price;
      this.state.ownedAircraft = [...this.state.ownedAircraft, id];
      Storage.saveTotalCoins(this.state.totalCoins);
      Storage.saveOwnedAircraft(this.state.ownedAircraft);
      this.equipAircraft(id);
      this.enqueueNotification({
        type: "coins",
        title: t("notify.purchaseSuccess").replace("{name}", t(ac.nameKey)),
        message: format("notify.equipSuccess", { name: t(ac.nameKey) })
      });
    }

    equipAircraft(id) {
      const ac = Aircraft.getAircraftById(id);
      if (!ac || !this.state.ownedAircraft.includes(id)) {
        return;
      }
      this.state.selectedAircraftId = id;
      Storage.saveSelectedAircraft(id);
      this.renderShopScreen();
      this.enqueueNotification({
        type: "achievement",
        title: format("notify.equipSuccess", { name: t(ac.nameKey) }),
        message: ""
      });
      this.refreshUi();
    }

    // ===== ONLINE =====

    async initOnline() {
      if (!Online.isOnlineModeEnabled()) {
        this.updateOnlineStatus("offline");
        return;
      }
      this.updateOnlineStatus("connecting");
      const country = await Online.detectCountry();
      this.state.countryInfo = country;
      const playerName = this.state.lastSetup?.playerName;
      if (playerName) {
        const result = await Online.ensurePlayer(playerName, country);
        if (result?.player) {
          this.state.onlinePlayer = result.player;
          this.updateOnlineStatus("online");
        } else {
          this.updateOnlineStatus("offline");
        }
      } else {
        this.updateOnlineStatus("online");
      }
    }

    async submitRunOnline(run) {
      if (!Online.isOnlineModeEnabled() || !run || (!run.isDaily && (run.score || 0) <= 0)) {
        return;
      }

      const country = this.state.countryInfo || (await Online.detectCountry());
      this.state.countryInfo = country;
      const result = this.state.onlinePlayer
        ? { player: this.state.onlinePlayer }
        : await Online.ensurePlayer(run.playerName, country);

      if (!result?.player) {
        this.updateOnlineStatus("offline");
        return;
      }

      this.state.onlinePlayer = result.player;
      this.updateOnlineStatus("online");
      if (run.isDaily) {
        await Online.submitDailyScore(result.player.id, run.playerName, run, country);
        return;
      }

      await Online.submitScore(result.player.id, run.playerName, run, country);
    }

    updateOnlineStatus(state) {
      const chip = this.elements.onlineStatusChip;
      const label = this.elements.onlineStatusLabel;
      if (chip && label) {
        chip.classList.remove("is-online", "is-offline", "is-connecting");
        if (state === "online") {
          chip.classList.add("is-online");
          label.textContent = t("online.connected");
        } else if (state === "connecting") {
          label.textContent = t("online.connecting");
        } else {
          chip.classList.add("is-offline");
          label.textContent = t("online.offline");
        }
      }
      const icon = this.elements.homeOnlineIcon;
      if (icon) {
        icon.src = state === "online"
          ? "./assets/images/v1_default_game_icon_OnLine.png"
          : "./assets/images/v1_default_game_icon_OffLine.png";
      }
    }

    // ===== LEADERBOARD TABS =====

    renderLeaderboardTabs() {
      const isOnline = Online.isOnlineModeEnabled();
      if (this.elements.lbTabGlobal) {
        this.elements.lbTabGlobal.disabled = !isOnline;
      }
      if (this.elements.lbTabDaily) {
        this.elements.lbTabDaily.disabled = !isOnline;
      }
      if (this.elements.lbCountryFilterLabel) {
        this.elements.lbCountryFilterLabel.hidden =
          this.state.leaderboardTab !== "global" || !isOnline;
      }
      [this.elements.lbTabLocal, this.elements.lbTabGlobal, this.elements.lbTabDaily].forEach(
        (btn) => {
          if (btn) {
            btn.classList.toggle("is-active", btn.dataset.lbTab === this.state.leaderboardTab);
          }
        }
      );
    }

    switchLeaderboardTab(tab) {
      this.state.leaderboardTab = tab;
      this.renderLeaderboardTabs();
      this.loadLeaderboardTab(tab);
    }

    async loadLeaderboardTab(tab) {
      if (tab === "local") {
        this.renderLocalLeaderboardHead();
        this.renderLeaderboard();
        if (this.elements.leaderboardLoading) {
          this.elements.leaderboardLoading.classList.add("hidden");
        }
        return;
      }

      if (!Online.isOnlineModeEnabled()) {
        return;
      }

      if (this.elements.leaderboardLoading) {
        this.elements.leaderboardLoading.classList.remove("hidden");
        this.elements.leaderboardLoading.textContent = t("leaderboard.globalLoading");
      }
      const lbList = this.elements.leaderboardList;
      if (lbList) {
        lbList.innerHTML = "";
      }

      if (tab === "global") {
        const countryCode =
          this.elements.lbCountryFilter?.checked && this.state.countryInfo?.code
            ? this.state.countryInfo.code
            : null;
        const rows = await Online.fetchGlobalLeaderboard(countryCode);
        if (this.elements.leaderboardLoading) {
          this.elements.leaderboardLoading.classList.add("hidden");
        }
        this.renderGlobalLeaderboardHead();
        this.renderGlobalLeaderboardRows(rows);
        this.renderLeaderboardSummaryFromRows(rows);
        this.renderLeaderboardPodiumFromRows(rows);
      } else if (tab === "daily") {
        const rows = await Online.fetchDailyLeaderboard();
        if (this.elements.leaderboardLoading) {
          this.elements.leaderboardLoading.classList.add("hidden");
        }
        this.renderDailyLeaderboardHead();
        this.renderDailyLeaderboardRows(rows);
        this.renderLeaderboardSummaryFromRows(rows);
        this.renderLeaderboardPodiumFromRows(rows);
      }
    }

    renderLocalLeaderboardHead() {
      const head = document.getElementById("leaderboardHead");
      if (!head) {
        return;
      }
      head.innerHTML = `
        <span data-i18n="leaderboard.rank">${t("leaderboard.rank")}</span>
        <span data-i18n="leaderboard.player">${t("leaderboard.player")}</span>
        <span data-i18n="leaderboard.score">${t("leaderboard.score")}</span>
        <span data-i18n="leaderboard.difficulty">${t("leaderboard.difficulty")}</span>
        <span data-i18n="leaderboard.date">${t("leaderboard.date")}</span>
      `;
    }

    renderGlobalLeaderboardHead() {
      const head = document.getElementById("leaderboardHead");
      if (!head) {
        return;
      }
      head.innerHTML = `
        <span>${t("leaderboard.rank")}</span>
        <span>${t("leaderboard.player")}</span>
        <span>${t("leaderboard.score")}</span>
        <span>${t("leaderboard.difficulty")}</span>
        <span>${t("leaderboard.country")}</span>
      `;
    }

    renderDailyLeaderboardHead() {
      const head = document.getElementById("leaderboardHead");
      if (!head) {
        return;
      }
      head.innerHTML = `
        <span>${t("leaderboard.rank")}</span>
        <span>${t("leaderboard.player")}</span>
        <span>${t("leaderboard.score")}</span>
        <span>${t("leaderboard.country")}</span>
        <span>${t("leaderboard.date")}</span>
      `;
    }

    renderGlobalLeaderboardRows(rows) {
      this.renderRemoteLeaderboardRows(rows, "leaderboard.globalEmpty", "global");
    }

    renderDailyLeaderboardRows(rows) {
      this.renderRemoteLeaderboardRows(rows, "leaderboard.dailyEmpty", "daily");
    }

    normalizeRemoteLeaderboardRows(rows, mode = "global") {
      return (rows || []).slice(0, 11).map((row) => ({
        playerName: row.player_name || "—",
        score: Number.isFinite(Number(row.score)) ? Math.max(0, Math.round(Number(row.score))) : 0,
        difficultyId: row.difficulty_id || "normal",
        timestamp: row.played_at ? new Date(row.played_at).getTime() : Date.now(),
        meta:
          mode === "global"
            ? row.country_code || "—"
            : row.played_at
              ? new Date(row.played_at).toLocaleDateString()
              : "—"
      }));
    }

    renderRemoteLeaderboardRows(rows, emptyKey, mode = "global") {
      const lbList = this.elements.leaderboardList;
      if (!lbList) {
        return;
      }
      const entries = this.normalizeRemoteLeaderboardRows(rows, mode);
      if (!entries.length) {
        lbList.innerHTML = `<p class="leaderboard-empty-message">${t(emptyKey)}</p>`;
        return;
      }

      const tableEntries = entries.slice(3, 11);
      const groupedEntries = [tableEntries.slice(0, 4), tableEntries.slice(4, 8)].filter(
        (group) => group.length
      );

      lbList.innerHTML = groupedEntries
        .map(
          (group) => `
            <div class="leaderboard-list-column">
              ${group
                .map((entry) => {
                  const difficulty = getDifficultyById(entry.difficultyId);
                  const rank = tableEntries.indexOf(entry) + 4;
                  return `
                    <article class="leaderboard-row leaderboard-row-compact">
                      <span class="leaderboard-rank">#${rank}</span>
                      <strong>${this.escapeHtml(entry.playerName)}</strong>
                      <span>${entry.score}</span>
                      <span class="leaderboard-difficulty-chip leaderboard-difficulty-${difficulty.id}">${t(
                        difficulty.labelKey
                      )}</span>
                      <span>${this.escapeHtml(entry.meta)}</span>
                    </article>
                  `;
                })
                .join("")}
            </div>
          `
        )
        .join("");
    }

    renderLeaderboardSummaryFromRows(rows) {
      const top = rows?.[0];
      if (this.elements.lbTopScoreValue) {
        this.elements.lbTopScoreValue.textContent = top?.score ?? "—";
      }
      if (this.elements.lbTopPilotValue) {
        this.elements.lbTopPilotValue.textContent = top?.player_name ?? "—";
      }
      if (this.elements.lbTotalEntriesValue) {
        this.elements.lbTotalEntriesValue.textContent = rows?.length ?? "—";
      }
      if (this.elements.lbBestRouteValue) {
        this.elements.lbBestRouteValue.textContent = top?.difficulty_id ?? "—";
      }
    }

    renderLeaderboardPodiumFromRows(rows) {
      const podium = this.elements.leaderboardPodium;
      if (!podium) {
        return;
      }
      const top3 = this.normalizeRemoteLeaderboardRows(rows).slice(0, 3);
      if (top3.length === 0) {
        podium.innerHTML = "";
        return;
      }
      const order = [1, 0, 2];
      podium.innerHTML = order
        .map((orderIndex) => {
          const entry = top3[orderIndex];
          if (!entry) {
            return "";
          }

          const difficulty = getDifficultyById(entry.difficultyId);
          return `
            <article class="leaderboard-podium-card leaderboard-podium-card-rank-${orderIndex + 1}">
              <span class="leaderboard-podium-rank">#${orderIndex + 1}</span>
              <div class="leaderboard-podium-emblem" aria-hidden="true"></div>
              <strong>${this.escapeHtml(entry.playerName)}</strong>
              <span class="leaderboard-podium-score">${entry.score}</span>
              <span class="leaderboard-podium-difficulty">${t(difficulty.labelKey)}</span>
            </article>
          `;
        })
        .join("");
    }

    // ===== SCORE CARD =====

    async shareScoreCard() {
      const result = this.state.latestResult;
      if (!result) {
        return;
      }
      const difficultyDef = this.difficulties.find((d) => d.id === result.difficultyId);
      const diffLabel = difficultyDef ? t(difficultyDef.labelKey) : result.difficultyId || "Normal";
      const shareText = format("scorecard.shareText", {
        score: result.score,
        difficulty: diffLabel
      });
      const method = await ScoreCard.share(
        {
          playerName: result.playerName,
          score: result.score,
          difficultyLabel: diffLabel,
          flightLevel: result.flightLevelReached,
          timestamp: result.timestamp,
          isDaily: !!result.isDaily
        },
        shareText
      );
      if (method?.method === "download") {
        this.enqueueNotification({
          type: "achievement",
          title: t("scorecard.shareButton"),
          message: t("scorecard.downloaded")
        });
      }
    }

    // ===== DAILY CHALLENGE =====

    startDailyChallenge() {
      const defaultDifficulty = "normal";
      const playerName = this.normalizePlayerName(
        this.state.lastSetup?.playerName,
        this.getDefaultPlayerName()
      );
      const setup = {
        playerName,
        difficultyId: defaultDifficulty,
        isDaily: true
      };
      this.state.lastSetup = {
        ...this.state.lastSetup,
        playerName,
        difficultyId: defaultDifficulty
      };
      Storage.saveLastSetup(this.state.lastSetup);
      this.loadProfile(playerName);
      this.startRun(setup);
    }

    updateDailyButton() {
      const btn = this.elements.openDailyButton;
      if (!btn) {
        return;
      }
      const played = Daily.hasPlayedToday();
      btn.classList.toggle("already-played", played);
      if (played) {
        const best = Daily.getTodayBestScore();
        btn.textContent = format("daily.yourBest", { score: best ?? 0 });
      } else {
        btn.textContent = t("daily.button");
      }
    }

    showGameOver(result) {
      this.renderGameOverSummary(result);
      this.hideGameOverlays();
      this.elements.gameOverOverlay.classList.remove("hidden");
    }

    hideGameOverlays() {
      this.elements.startOverlay.classList.add("hidden");
      this.elements.pauseOverlay.classList.add("hidden");
      this.elements.gameOverOverlay.classList.add("hidden");
    }
  }

  function boot() {
    const app = new TurboWingsApp();
    app.init();
    if (typeof window !== "undefined") {
      window.__turboWingsApp = app;
    }
  }

  return { boot };
})();
