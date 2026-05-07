window.TurboWingsProgression = (() => {
  const DEFAULT_STATS = {
    totalRuns: 0,
    totalCoinsCollected: 0,
    totalPowerUpsCollected: 0,
    totalObstaclesPassed: 0,
    highScore: 0,
    longestSurvivalTime: 0,
    highestFlightLevel: 1,
    totalTimePlayed: 0,
    totalCollisions: 0,
    totalShieldSaves: 0,
    totalMagnetCoins: 0
  };

  function clampNumber(value, fallback = 0) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? Math.max(0, numericValue) : fallback;
  }

  function ensureStats(rawStats) {
    return {
      totalRuns: Math.round(clampNumber(rawStats?.totalRuns)),
      totalCoinsCollected: Math.round(clampNumber(rawStats?.totalCoinsCollected)),
      totalPowerUpsCollected: Math.round(clampNumber(rawStats?.totalPowerUpsCollected)),
      totalObstaclesPassed: Math.round(clampNumber(rawStats?.totalObstaclesPassed)),
      highScore: Math.round(clampNumber(rawStats?.highScore)),
      longestSurvivalTime: clampNumber(rawStats?.longestSurvivalTime),
      highestFlightLevel: Math.max(1, Math.round(clampNumber(rawStats?.highestFlightLevel, 1))),
      totalTimePlayed: clampNumber(rawStats?.totalTimePlayed),
      totalCollisions: Math.round(clampNumber(rawStats?.totalCollisions)),
      totalShieldSaves: Math.round(clampNumber(rawStats?.totalShieldSaves)),
      totalMagnetCoins: Math.round(clampNumber(rawStats?.totalMagnetCoins))
    };
  }

  function createDefaultStats() {
    return { ...DEFAULT_STATS };
  }

  function applyRunToStats(rawStats, runSummary) {
    const previousStats = ensureStats(rawStats);
    const nextStats = ensureStats(previousStats);

    nextStats.totalRuns += 1;
    nextStats.totalCoinsCollected += Math.round(clampNumber(runSummary.coinsCollected));
    nextStats.totalPowerUpsCollected += Math.round(clampNumber(runSummary.powerUpsCollected));
    nextStats.totalObstaclesPassed += Math.round(clampNumber(runSummary.obstaclesPassed));
    nextStats.highScore = Math.max(nextStats.highScore, Math.round(clampNumber(runSummary.score)));
    nextStats.longestSurvivalTime = Math.max(
      nextStats.longestSurvivalTime,
      clampNumber(runSummary.timeSurvived)
    );
    nextStats.highestFlightLevel = Math.max(
      nextStats.highestFlightLevel,
      Math.round(clampNumber(runSummary.flightLevelReached, 1))
    );
    nextStats.totalTimePlayed += clampNumber(runSummary.timeSurvived);
    nextStats.totalCollisions += Math.max(1, Math.round(clampNumber(runSummary.totalCollisions, 1)));
    nextStats.totalShieldSaves += Math.round(clampNumber(runSummary.shieldSaves));
    nextStats.totalMagnetCoins += Math.round(clampNumber(runSummary.coinsCollectedWithMagnet));

    return {
      stats: nextStats,
      highlights: {
        wasNewLongestRun: nextStats.longestSurvivalTime > previousStats.longestSurvivalTime,
        wasNewHighestFlightLevel: nextStats.highestFlightLevel > previousStats.highestFlightLevel
      }
    };
  }

  return {
    DEFAULT_STATS,
    applyRunToStats,
    createDefaultStats,
    ensureStats
  };
})();
