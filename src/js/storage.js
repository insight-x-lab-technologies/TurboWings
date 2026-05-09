window.TurboWingsStorage = (() => {
  const KEYS = {
    language: "turbo-wings-language",
    theme: "turbo-wings-theme",
    settings: "turbo-wings-settings",
    lastSetup: "turbo-wings-last-setup",
    leaderboard: "turbo-wings-leaderboard",
    unlocks: "turbo-wings-unlocks",
    totalCoins: "turbo-wings-total-coins",
    profiles: "turbo-wings-player-profiles-v1"
  };

  function loadJson(key, fallback) {
    try {
      const rawValue = window.localStorage.getItem(key);
      return rawValue ? JSON.parse(rawValue) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function normalizePlayerName(value, fallback = "Player 1") {
    const normalized = String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 24);
    return normalized || fallback;
  }

  function normalizePlayerKey(value, fallback = "player-1") {
    return normalizePlayerName(value, fallback).toLowerCase();
  }

  function ensureLeaderboard(rawLeaderboard) {
    if (!Array.isArray(rawLeaderboard)) {
      return [];
    }

    return rawLeaderboard
      .filter((entry) => entry && typeof entry === "object")
      .map((entry) => ({
        playerName: normalizePlayerName(entry.playerName, "Player 1"),
        difficultyId: String(entry.difficultyId || "normal"),
        score: Number.isFinite(Number(entry.score)) ? Math.max(0, Math.round(Number(entry.score))) : 0,
        coinsCollected: Number.isFinite(Number(entry.coinsCollected))
          ? Math.max(0, Math.round(Number(entry.coinsCollected)))
          : 0,
        timestamp: Number.isFinite(Number(entry.timestamp)) ? Number(entry.timestamp) : Date.now(),
        themeId: String(entry.themeId || "default")
      }))
      .sort((entryA, entryB) => {
        if (entryB.score !== entryA.score) {
          return entryB.score - entryA.score;
        }
        return entryA.timestamp - entryB.timestamp;
      })
      .slice(0, 10);
  }

  function ensureUnlocks(rawUnlocks) {
    return {
      turbo: !!rawUnlocks?.turbo,
      legend: !!rawUnlocks?.legend
    };
  }

  function ensureProfile(rawProfile, playerName) {
    const safePlayerName = normalizePlayerName(playerName, "Player 1");
    return {
      playerName: normalizePlayerName(rawProfile?.playerName, safePlayerName),
      stats: rawProfile?.stats && typeof rawProfile.stats === "object" ? rawProfile.stats : {},
      missions: Array.isArray(rawProfile?.missions) ? rawProfile.missions : [],
      achievements:
        rawProfile?.achievements && typeof rawProfile.achievements === "object"
          ? rawProfile.achievements
          : {},
      recentAchievements: Array.isArray(rawProfile?.recentAchievements)
        ? rawProfile.recentAchievements
        : [],
      updatedAt: Number.isFinite(Number(rawProfile?.updatedAt))
        ? Number(rawProfile.updatedAt)
        : Date.now()
    };
  }

  function loadProfilesMap() {
    const rawProfiles = loadJson(KEYS.profiles, {});
    if (!rawProfiles || typeof rawProfiles !== "object" || Array.isArray(rawProfiles)) {
      return {};
    }
    return rawProfiles;
  }

  function saveProfilesMap(profiles) {
    saveJson(KEYS.profiles, profiles);
  }

  function getPlayerProfile(playerName) {
    const profiles = loadProfilesMap();
    const playerKey = normalizePlayerKey(playerName);
    return ensureProfile(profiles[playerKey], playerName);
  }

  function savePlayerProfile(profile) {
    const safeProfile = ensureProfile(profile, profile?.playerName || "Player 1");
    const profiles = loadProfilesMap();
    profiles[normalizePlayerKey(safeProfile.playerName)] = {
      ...safeProfile,
      updatedAt: Date.now()
    };
    saveProfilesMap(profiles);
    return safeProfile;
  }

  function loadLanguage() {
    return window.localStorage.getItem(KEYS.language);
  }

  function saveLanguage(language) {
    window.localStorage.setItem(KEYS.language, String(language));
  }

  function loadTheme(defaultTheme) {
    return window.localStorage.getItem(KEYS.theme) || defaultTheme;
  }

  function saveTheme(themeId) {
    window.localStorage.setItem(KEYS.theme, String(themeId));
  }

  function loadSettings() {
    return loadJson(KEYS.settings, {});
  }

  function saveSettings(settings) {
    saveJson(KEYS.settings, settings);
  }

  function loadLastSetup(defaultSetup) {
    const stored = loadJson(KEYS.lastSetup, null);
    if (!stored || typeof stored !== "object") {
      return defaultSetup;
    }

    const fallbackPlayerName = normalizePlayerName(
      defaultSetup?.playerName || "Player 1",
      "Player 1"
    );

    return {
      playerName: normalizePlayerName(stored.playerName, fallbackPlayerName),
      difficultyId: String(stored.difficultyId || defaultSetup?.difficultyId || "normal"),
      usedDefaultName:
        typeof stored.usedDefaultName === "boolean"
          ? stored.usedDefaultName
          : normalizePlayerName(stored.playerName, fallbackPlayerName) === fallbackPlayerName
    };
  }

  function saveLastSetup(lastSetup) {
    saveJson(KEYS.lastSetup, lastSetup);
  }

  function loadLeaderboard() {
    return ensureLeaderboard(loadJson(KEYS.leaderboard, []));
  }

  function saveLeaderboard(leaderboard) {
    saveJson(KEYS.leaderboard, ensureLeaderboard(leaderboard));
  }

  function loadUnlocks() {
    return ensureUnlocks(loadJson(KEYS.unlocks, {}));
  }

  function saveUnlocks(unlocks) {
    saveJson(KEYS.unlocks, ensureUnlocks(unlocks));
  }

  function loadTotalCoins() {
    const rawValue = window.localStorage.getItem(KEYS.totalCoins);
    const numericValue = Number.parseInt(rawValue || "0", 10);
    return Number.isFinite(numericValue) ? Math.max(0, numericValue) : 0;
  }

  function saveTotalCoins(totalCoins) {
    window.localStorage.setItem(KEYS.totalCoins, String(Math.max(0, Math.round(totalCoins || 0))));
  }

  return {
    KEYS,
    getPlayerProfile,
    loadJson,
    loadLanguage,
    loadLastSetup,
    loadLeaderboard,
    loadSettings,
    loadTheme,
    loadTotalCoins,
    loadUnlocks,
    normalizePlayerKey,
    normalizePlayerName,
    saveJson,
    saveLanguage,
    saveLastSetup,
    saveLeaderboard,
    savePlayerProfile,
    saveProfilesMap,
    saveSettings,
    saveTheme,
    saveTotalCoins,
    saveUnlocks
  };
})();
