window.TurboWingsAchievements = (() => {
  const ACHIEVEMENT_TEMPLATES = [
    {
      id: "first-flight",
      titleKey: "achievement.firstFlight.title",
      descriptionKey: "achievement.firstFlight.description",
      reward: 20
    },
    {
      id: "urban-pilot",
      titleKey: "achievement.urbanPilot.title",
      descriptionKey: "achievement.urbanPilot.description",
      reward: 30
    },
    {
      id: "sky-ace",
      titleKey: "achievement.skyAce.title",
      descriptionKey: "achievement.skyAce.description",
      reward: 45
    },
    {
      id: "sky-master",
      titleKey: "achievement.skyMaster.title",
      descriptionKey: "achievement.skyMaster.description",
      reward: 80
    },
    {
      id: "coin-hunter",
      titleKey: "achievement.coinHunter.title",
      descriptionKey: "achievement.coinHunter.description",
      reward: 35
    },
    {
      id: "magnetic",
      titleKey: "achievement.magnetic.title",
      descriptionKey: "achievement.magnetic.description",
      reward: 40
    },
    {
      id: "perfect-shield",
      titleKey: "achievement.perfectShield.title",
      descriptionKey: "achievement.perfectShield.description",
      reward: 60
    },
    {
      id: "survivor",
      titleKey: "achievement.survivor.title",
      descriptionKey: "achievement.survivor.description",
      reward: 55
    },
    {
      id: "night-explorer",
      titleKey: "achievement.nightExplorer.title",
      descriptionKey: "achievement.nightExplorer.description",
      reward: 30
    },
    {
      id: "persistent",
      titleKey: "achievement.persistent.title",
      descriptionKey: "achievement.persistent.description",
      reward: 75
    }
  ];

  const TEMPLATE_MAP = Object.fromEntries(
    ACHIEVEMENT_TEMPLATES.map((achievement) => [achievement.id, achievement])
  );

  function getAchievementTemplates() {
    return ACHIEVEMENT_TEMPLATES.map((achievement) => ({ ...achievement }));
  }

  function ensureAchievementState(rawState) {
    if (!rawState || typeof rawState !== "object") {
      return {};
    }

    const state = {};
    Object.keys(rawState).forEach((key) => {
      if (!TEMPLATE_MAP[key]) {
        return;
      }

      state[key] = {
        unlocked: !!rawState[key]?.unlocked,
        unlockedAt: Number.isFinite(Number(rawState[key]?.unlockedAt))
          ? Number(rawState[key].unlockedAt)
          : null
      };
    });

    return state;
  }

  function isUnlocked(state, achievementId) {
    return !!state[achievementId]?.unlocked;
  }

  function checkCondition(achievementId, runSummary, statsAfter) {
    switch (achievementId) {
      case "first-flight":
        return statsAfter.totalRuns >= 1;
      case "urban-pilot":
        return runSummary.score >= 25 || statsAfter.highScore >= 25;
      case "sky-ace":
        return runSummary.score >= 50 || statsAfter.highScore >= 50;
      case "sky-master":
        return runSummary.score >= 100 || statsAfter.highScore >= 100;
      case "coin-hunter":
        return statsAfter.totalCoinsCollected >= 100;
      case "magnetic":
        return statsAfter.totalMagnetCoins >= 25;
      case "perfect-shield":
        return statsAfter.totalShieldSaves >= 10;
      case "survivor":
        return runSummary.timeSurvived >= 90 || statsAfter.longestSurvivalTime >= 90;
      case "night-explorer":
        return runSummary.themeUsed === "city-night";
      case "persistent":
        return statsAfter.totalRuns >= 25;
      default:
        return false;
    }
  }

  function evaluateAchievements(rawState, runSummary, statsAfter) {
    const state = ensureAchievementState(rawState);
    const unlockedNow = [];

    for (const achievement of ACHIEVEMENT_TEMPLATES) {
      if (isUnlocked(state, achievement.id)) {
        continue;
      }

      if (!checkCondition(achievement.id, runSummary, statsAfter)) {
        continue;
      }

      const unlockedAt = Date.now();
      state[achievement.id] = {
        unlocked: true,
        unlockedAt
      };
      unlockedNow.push({
        ...achievement,
        unlockedAt
      });
    }

    return {
      achievements: state,
      unlockedNow,
      rewardTotal: unlockedNow.reduce(
        (total, achievement) => total + Math.max(0, achievement.reward || 0),
        0
      )
    };
  }

  function appendRecentAchievements(existingRecent, unlockedNow, limit = 4) {
    const currentRecent = Array.isArray(existingRecent) ? existingRecent.slice() : [];
    const merged = [...unlockedNow, ...currentRecent]
      .map((entry) => ({
        id: entry.id,
        unlockedAt: Number.isFinite(Number(entry.unlockedAt)) ? Number(entry.unlockedAt) : Date.now()
      }))
      .filter(
        (entry, index, array) => array.findIndex((item) => item.id === entry.id) === index
      )
      .sort((entryA, entryB) => entryB.unlockedAt - entryA.unlockedAt);

    return merged.slice(0, limit);
  }

  return {
    appendRecentAchievements,
    ensureAchievementState,
    evaluateAchievements,
    getAchievementTemplates
  };
})();
