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
        notifications: []
      };

      this.elements = {
        screens: Array.from(document.querySelectorAll("[data-screen]")),
        openSetupButton: document.getElementById("openSetupButton"),
        openLeaderboardButton: document.getElementById("openLeaderboardButton"),
        openSettingsButton: document.getElementById("openSettingsButton"),
        openAdvancedSettingsButton: document.getElementById("openAdvancedSettingsButton"),
        openAchievementsButton: document.getElementById("openAchievementsButton"),
        openAchievementsPanelButton: document.getElementById("openAchievementsPanelButton"),
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
        resetDifficultySettingsButton: document.getElementById("resetDifficultySettingsButton"),
        difficultyList: document.getElementById("difficultyList"),
        playerNameInput: document.getElementById("playerNameInput"),
        setupSummaryValue: document.getElementById("setupSummaryValue"),
        setupStatusText: document.getElementById("setupStatusText"),
        leaderboardList: document.getElementById("leaderboardList"),
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
        achievementsList: document.getElementById("achievementsList"),
        achievementsUnlockedValue: document.getElementById("achievementsUnlockedValue"),
        achievementsRewardedCoinsValue: document.getElementById("achievementsRewardedCoinsValue"),
        scoreValue: document.getElementById("scoreValue"),
        coinsValue: document.getElementById("coinsValue"),
        flightLevelValue: document.getElementById("flightLevelValue"),
        runMetaValue: document.getElementById("runMetaValue"),
        finalScoreValue: document.getElementById("finalScoreValue"),
        finalCoinsValue: document.getElementById("finalCoinsValue"),
        bestScoreValue: document.getElementById("bestScoreValue"),
        gameOverTotalCoinsValue: document.getElementById("gameOverTotalCoinsValue"),
        gameOverTimeValue: document.getElementById("gameOverTimeValue"),
        gameOverFlightLevelValue: document.getElementById("gameOverFlightLevelValue"),
        gameOverPowerUpsValue: document.getElementById("gameOverPowerUpsValue"),
        gameOverObstaclesValue: document.getElementById("gameOverObstaclesValue"),
        gameOverMissionsList: document.getElementById("gameOverMissionsList"),
        gameOverAchievementsList: document.getElementById("gameOverAchievementsList"),
        gameOverMeta: document.getElementById("gameOverMeta"),
        unlockNotice: document.getElementById("unlockNotice"),
        activeEffectsList: document.getElementById("activeEffectsList"),
        startOverlay: document.getElementById("startOverlay"),
        pauseOverlay: document.getElementById("pauseOverlay"),
        gameOverOverlay: document.getElementById("gameOverOverlay"),
        notifications: document.getElementById("notificationStack"),
        canvas: document.getElementById("gameCanvas")
      };
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
        getTheme: () => getTheme(getActiveThemeId()),
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

      this.elements.openAchievementsPanelButton.addEventListener("click", () => {
        this.handleInteraction();
        this.showScreen("achievements");
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

      this.bindBooleanSettingToggle("obstaclesToggle", "obstaclesEnabled");
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

      this.elements.difficultySettingsList.addEventListener("input", (event) => {
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

      this.elements.resetDifficultySettingsButton.addEventListener("click", () => {
        this.handleInteraction();
        this.restoreDefaultDifficultySettings();
      });

      this.elements.homeMissionsList.addEventListener("click", (event) => {
        const button = event.target.closest("[data-claim-mission]");
        if (!button) {
          return;
        }

        this.handleInteraction({ playNavigation: false });
        this.claimMissionReward(button.dataset.claimMission);
      });
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
      this.elements[elementKey].addEventListener("change", () => {
        this.state.settings[settingKey] = this.elements[elementKey].checked;
        this.saveSettings();
      });
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
      this.elements.obstaclesToggle.checked = this.state.settings.obstaclesEnabled;
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
              <span class="difficulty-badge">${status}</span>
              <strong>${t(difficulty.labelKey)}</strong>
              <p>${t(difficulty.descriptionKey)}</p>
              <small>${requirementText}</small>
            </label>
          `;
        })
        .join("");
    }

    renderDifficultySettings() {
      this.elements.difficultySettingsList.innerHTML = this.difficulties
        .map((difficulty) => {
          const tuning = this.state.settings.tuning[difficulty.id];
          return `
            <article class="tuning-card">
              <div class="tuning-head">
                <strong>${t(difficulty.labelKey)}</strong>
                <span class="mini-label">Lv. ${difficulty.level}</span>
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

      this.updateRangeOutputs();
    }

    updateRangeOutputs() {
      this.elements.difficultySettingsList
        .querySelectorAll("input[type='range']")
        .forEach((input) => {
          const output = this.elements.difficultySettingsList.querySelector(
            `[data-output-key="${input.dataset.difficultyId}-${input.dataset.setting}"]`
          );
          if (output) {
            output.textContent = `${input.value}%`;
          }
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
        this.elements.leaderboardList.innerHTML = `<div class="leaderboard-empty">${t(
          "leaderboard.empty"
        )}</div>`;
        return;
      }

      this.elements.leaderboardList.innerHTML = this.state.leaderboard
        .map((entry, index) => {
          const difficulty = getDifficultyById(entry.difficultyId);
          return `
            <article class="leaderboard-row">
              <span class="leaderboard-rank">#${index + 1}</span>
              <strong>${this.escapeHtml(entry.playerName)}</strong>
              <span>${entry.score}</span>
              <span>${t(difficulty.labelKey)}</span>
              <span>${this.formatDate(entry.timestamp)}</span>
            </article>
          `;
        })
        .join("");
    }

    renderHomeDashboard() {
      const profile = this.state.currentProfile || this.loadProfile(this.getDefaultPlayerName());
      const stats = ensureStats(profile.stats);
      const recentAchievements = profile.recentAchievements || [];
      const bestEntry = this.state.leaderboard[0];

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
        mission.status === "completed" ? t("missions.completed") : t("missions.active");
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
                : ""
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
          <strong>${t(achievement.titleKey)}</strong>
          <p class="helper-text">${t(achievement.descriptionKey)}</p>
          <span class="mini-label">${this.formatDate(entry.unlockedAt)}</span>
        </article>
      `;
    }

    renderAchievementsScreen() {
      const profile = this.state.currentProfile || this.loadProfile(this.getDefaultPlayerName());
      const achievementState = profile.achievements || {};
      const unlockedCount = this.achievementTemplates.filter(
        (achievement) => achievementState[achievement.id]?.unlocked
      ).length;
      const rewardTotal = this.achievementTemplates.reduce((total, achievement) => {
        return achievementState[achievement.id]?.unlocked ? total + (achievement.reward || 0) : total;
      }, 0);

      this.elements.achievementsUnlockedValue.textContent = `${unlockedCount} / ${this.achievementTemplates.length}`;
      this.elements.achievementsRewardedCoinsValue.textContent = String(rewardTotal);

      this.elements.achievementsList.innerHTML = this.achievementTemplates
        .map((achievement) => {
          const unlocked = achievementState[achievement.id]?.unlocked;
          const unlockedAt = achievementState[achievement.id]?.unlockedAt;
          return `
            <article class="achievement-card ${unlocked ? "unlocked" : "locked"}">
              <div class="achievement-head">
                <strong>${t(achievement.titleKey)}</strong>
                <span class="mini-label">${
                  unlocked ? t("achievements.unlocked") : t("achievements.locked")
                }</span>
              </div>
              <p class="helper-text">${t(achievement.descriptionKey)}</p>
              <div class="achievement-foot">
                <span>${format("achievements.reward", { coins: achievement.reward || 0 })}</span>
                <span>${
                  unlockedAt
                    ? format("achievements.unlockedAt", { date: this.formatDate(unlockedAt) })
                    : t("achievements.notUnlockedYet")
                }</span>
              </div>
            </article>
          `;
        })
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
            .map((achievement) => `<span class="summary-badge">${t(achievement.titleKey)}</span>`)
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
        difficulty: t(difficulty.labelKey)
      });

      const unlocked = this.isDifficultyUnlocked(selectedDifficulty);
      this.elements.setupStatusText.textContent = unlocked
        ? t("setup.startReady")
        : this.getUnlockRequirementText(difficulty);
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
      this.state.currentRun = {
        playerName: setup.playerName,
        difficultyId: setup.difficultyId,
        themeId: getActiveThemeId(),
        startedAt: Date.now()
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
        }
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
        themeId: this.state.currentRun?.themeId || getActiveThemeId()
      };

      const unlockedDifficultyId = this.processUnlocks(run);
      this.state.leaderboard = [...this.state.leaderboard, run]
        .sort((entryA, entryB) => {
          if (entryB.score !== entryA.score) {
            return entryB.score - entryA.score;
          }
          return entryA.timestamp - entryB.timestamp;
        })
        .slice(0, 10);
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
          message: t(achievement.titleKey)
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
  }

  return { boot };
})();
