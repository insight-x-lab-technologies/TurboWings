window.TurboWingsAchievements = (() => {
  const TIER_SUFFIXES = ["II", "III", "IV", "V", "VI", "VII"];

  function localizedText(enUS, ptBR) {
    return {
      "en-US": enUS,
      "pt-BR": ptBR
    };
  }

  function createTieredAchievements({
    baseAchievement,
    seriesTitle,
    trigger,
    extraTiers,
    descriptionBuilder
  }) {
    const extras = extraTiers.map((tier, index) => ({
      id: `${baseAchievement.id}-${index + 2}`,
      categoryId: baseAchievement.categoryId,
      reward: tier.reward,
      targetValue: tier.targetValue,
      title: localizedText(
        `${seriesTitle["en-US"]} ${TIER_SUFFIXES[index]}`,
        `${seriesTitle["pt-BR"]} ${TIER_SUFFIXES[index]}`
      ),
      description: descriptionBuilder(tier.targetValue),
      ...trigger
    }));

    return [baseAchievement, ...extras];
  }

  const ACHIEVEMENT_TEMPLATES = [
    ...createTieredAchievements({
      baseAchievement: {
        id: "first-flight",
        categoryId: "first-flight",
        statKey: "totalRuns",
        targetValue: 1,
        titleKey: "achievement.firstFlight.title",
        descriptionKey: "achievement.firstFlight.description",
        reward: 20,
        triggerType: "stats-threshold"
      },
      seriesTitle: localizedText("First Flight", "Primeiro Voo"),
      trigger: {
        statKey: "totalRuns",
        triggerType: "stats-threshold"
      },
      extraTiers: [
        { targetValue: 3, reward: 24 },
        { targetValue: 5, reward: 28 },
        { targetValue: 10, reward: 34 },
        { targetValue: 20, reward: 42 },
        { targetValue: 35, reward: 54 },
        { targetValue: 50, reward: 68 }
      ],
      descriptionBuilder: (targetValue) =>
        localizedText(`Play ${targetValue} runs.`, `Jogue ${targetValue} partidas.`)
    }),
    ...createTieredAchievements({
      baseAchievement: {
        id: "urban-pilot",
        categoryId: "first-flight",
        statKey: "highScore",
        targetValue: 25,
        titleKey: "achievement.urbanPilot.title",
        descriptionKey: "achievement.urbanPilot.description",
        reward: 30,
        triggerType: "run-or-stat-threshold",
        runKey: "score"
      },
      seriesTitle: localizedText("Urban Pilot", "Piloto Urbano"),
      trigger: {
        statKey: "highScore",
        triggerType: "run-or-stat-threshold",
        runKey: "score"
      },
      extraTiers: [
        { targetValue: 40, reward: 36 },
        { targetValue: 60, reward: 45 },
        { targetValue: 80, reward: 56 },
        { targetValue: 110, reward: 68 },
        { targetValue: 140, reward: 82 },
        { targetValue: 180, reward: 98 }
      ],
      descriptionBuilder: (targetValue) =>
        localizedText(
          `Reach ${targetValue} points in a run.`,
          `Alcance ${targetValue} pontos em uma partida.`
        )
    }),
    ...createTieredAchievements({
      baseAchievement: {
        id: "sky-ace",
        categoryId: "skill-mastery",
        statKey: "highScore",
        targetValue: 50,
        titleKey: "achievement.skyAce.title",
        descriptionKey: "achievement.skyAce.description",
        reward: 45,
        triggerType: "run-or-stat-threshold",
        runKey: "score"
      },
      seriesTitle: localizedText("Sky Ace", "As dos Ceus"),
      trigger: {
        statKey: "highScore",
        triggerType: "run-or-stat-threshold",
        runKey: "score"
      },
      extraTiers: [
        { targetValue: 70, reward: 52 },
        { targetValue: 90, reward: 61 },
        { targetValue: 120, reward: 72 },
        { targetValue: 150, reward: 84 },
        { targetValue: 190, reward: 98 },
        { targetValue: 230, reward: 114 }
      ],
      descriptionBuilder: (targetValue) =>
        localizedText(
          `Reach ${targetValue} points in a run.`,
          `Alcance ${targetValue} pontos em uma partida.`
        )
    }),
    ...createTieredAchievements({
      baseAchievement: {
        id: "sky-master",
        categoryId: "skill-mastery",
        statKey: "highScore",
        targetValue: 100,
        titleKey: "achievement.skyMaster.title",
        descriptionKey: "achievement.skyMaster.description",
        reward: 80,
        triggerType: "run-or-stat-threshold",
        runKey: "score"
      },
      seriesTitle: localizedText("Sky Master", "Mestre dos Ceus"),
      trigger: {
        statKey: "highScore",
        triggerType: "run-or-stat-threshold",
        runKey: "score"
      },
      extraTiers: [
        { targetValue: 140, reward: 92 },
        { targetValue: 180, reward: 106 },
        { targetValue: 220, reward: 122 },
        { targetValue: 280, reward: 140 },
        { targetValue: 340, reward: 160 },
        { targetValue: 420, reward: 184 }
      ],
      descriptionBuilder: (targetValue) =>
        localizedText(
          `Reach ${targetValue} points in a run.`,
          `Alcance ${targetValue} pontos em uma partida.`
        )
    }),
    ...createTieredAchievements({
      baseAchievement: {
        id: "coin-hunter",
        categoryId: "collection",
        statKey: "totalCoinsCollected",
        targetValue: 100,
        titleKey: "achievement.coinHunter.title",
        descriptionKey: "achievement.coinHunter.description",
        reward: 35,
        triggerType: "stats-threshold"
      },
      seriesTitle: localizedText("Coin Hunter", "Cacador de Moedas"),
      trigger: {
        statKey: "totalCoinsCollected",
        triggerType: "stats-threshold"
      },
      extraTiers: [
        { targetValue: 250, reward: 42 },
        { targetValue: 500, reward: 52 },
        { targetValue: 750, reward: 64 },
        { targetValue: 1000, reward: 78 },
        { targetValue: 1500, reward: 94 },
        { targetValue: 2500, reward: 112 }
      ],
      descriptionBuilder: (targetValue) =>
        localizedText(
          `Collect ${targetValue} coins in total.`,
          `Colete ${targetValue} moedas no total.`
        )
    }),
    ...createTieredAchievements({
      baseAchievement: {
        id: "magnetic",
        categoryId: "collection",
        statKey: "totalMagnetCoins",
        targetValue: 25,
        titleKey: "achievement.magnetic.title",
        descriptionKey: "achievement.magnetic.description",
        reward: 40,
        triggerType: "stats-threshold"
      },
      seriesTitle: localizedText("Magnetic", "Magnetico"),
      trigger: {
        statKey: "totalMagnetCoins",
        triggerType: "stats-threshold"
      },
      extraTiers: [
        { targetValue: 60, reward: 48 },
        { targetValue: 100, reward: 58 },
        { targetValue: 150, reward: 70 },
        { targetValue: 225, reward: 84 },
        { targetValue: 325, reward: 100 },
        { targetValue: 450, reward: 118 }
      ],
      descriptionBuilder: (targetValue) =>
        localizedText(
          `Collect ${targetValue} coins using Magnet.`,
          `Colete ${targetValue} moedas usando Ima.`
        )
    }),
    ...createTieredAchievements({
      baseAchievement: {
        id: "perfect-shield",
        categoryId: "flight-challenges",
        statKey: "totalShieldSaves",
        targetValue: 10,
        titleKey: "achievement.perfectShield.title",
        descriptionKey: "achievement.perfectShield.description",
        reward: 60,
        triggerType: "stats-threshold"
      },
      seriesTitle: localizedText("Perfect Shield", "Escudo Perfeito"),
      trigger: {
        statKey: "totalShieldSaves",
        triggerType: "stats-threshold"
      },
      extraTiers: [
        { targetValue: 25, reward: 70 },
        { targetValue: 50, reward: 82 },
        { targetValue: 75, reward: 96 },
        { targetValue: 100, reward: 112 },
        { targetValue: 150, reward: 130 },
        { targetValue: 200, reward: 150 }
      ],
      descriptionBuilder: (targetValue) =>
        localizedText(
          `Be saved by Shield ${targetValue} times.`,
          `Seja salvo pelo Escudo ${targetValue} vezes.`
        )
    }),
    ...createTieredAchievements({
      baseAchievement: {
        id: "survivor",
        categoryId: "flight-challenges",
        statKey: "longestSurvivalTime",
        targetValue: 90,
        titleKey: "achievement.survivor.title",
        descriptionKey: "achievement.survivor.description",
        reward: 55,
        triggerType: "run-or-stat-threshold",
        runKey: "timeSurvived"
      },
      seriesTitle: localizedText("Survivor", "Sobrevivente"),
      trigger: {
        statKey: "longestSurvivalTime",
        triggerType: "run-or-stat-threshold",
        runKey: "timeSurvived"
      },
      extraTiers: [
        { targetValue: 120, reward: 64 },
        { targetValue: 180, reward: 76 },
        { targetValue: 240, reward: 90 },
        { targetValue: 300, reward: 106 },
        { targetValue: 420, reward: 124 },
        { targetValue: 600, reward: 144 }
      ],
      descriptionBuilder: (targetValue) =>
        localizedText(
          `Survive for ${targetValue} seconds in a run.`,
          `Sobreviva por ${targetValue} segundos em uma partida.`
        )
    }),
    ...createTieredAchievements({
      baseAchievement: {
        id: "night-explorer",
        categoryId: "hidden",
        statKey: "totalDefaultThemeRuns",
        targetValue: 1,
        titleKey: "achievement.nightExplorer.title",
        descriptionKey: "achievement.nightExplorer.description",
        reward: 30,
        triggerType: "theme-default-runs"
      },
      seriesTitle: localizedText("Skyline Explorer", "Explorador Skyline"),
      trigger: {
        statKey: "totalDefaultThemeRuns",
        triggerType: "theme-default-runs"
      },
      extraTiers: [
        { targetValue: 3, reward: 38 },
        { targetValue: 5, reward: 46 },
        { targetValue: 10, reward: 56 },
        { targetValue: 20, reward: 68 },
        { targetValue: 40, reward: 82 },
        { targetValue: 75, reward: 98 }
      ],
      descriptionBuilder: (targetValue) =>
        localizedText(
          `Play ${targetValue} runs using the default skyline theme.`,
          `Jogue ${targetValue} partidas usando o tema default da cidade.`
        )
    }),
    ...createTieredAchievements({
      baseAchievement: {
        id: "persistent",
        categoryId: "skill-mastery",
        statKey: "totalRuns",
        targetValue: 25,
        titleKey: "achievement.persistent.title",
        descriptionKey: "achievement.persistent.description",
        reward: 75,
        triggerType: "stats-threshold"
      },
      seriesTitle: localizedText("Persistent", "Persistente"),
      trigger: {
        statKey: "totalRuns",
        triggerType: "stats-threshold"
      },
      extraTiers: [
        { targetValue: 50, reward: 86 },
        { targetValue: 100, reward: 100 },
        { targetValue: 150, reward: 116 },
        { targetValue: 250, reward: 134 },
        { targetValue: 400, reward: 154 },
        { targetValue: 600, reward: 176 }
      ],
      descriptionBuilder: (targetValue) =>
        localizedText(`Play ${targetValue} runs.`, `Jogue ${targetValue} partidas.`)
    })
  ];

  const TEMPLATE_MAP = Object.fromEntries(
    ACHIEVEMENT_TEMPLATES.map((achievement) => [achievement.id, achievement])
  );

  function getAchievementTemplates() {
    return ACHIEVEMENT_TEMPLATES.map((achievement) => ({
      ...achievement,
      title:
        achievement.title && typeof achievement.title === "object"
          ? { ...achievement.title }
          : achievement.title,
      description:
        achievement.description && typeof achievement.description === "object"
          ? { ...achievement.description }
          : achievement.description
    }));
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

  function readNumericValue(source, key) {
    const value = Number(source?.[key] || 0);
    return Number.isFinite(value) ? value : 0;
  }

  function checkCondition(achievement, runSummary, statsAfter) {
    switch (achievement.triggerType) {
      case "stats-threshold":
        return readNumericValue(statsAfter, achievement.statKey) >= Number(achievement.targetValue || 0);
      case "run-or-stat-threshold":
        return (
          readNumericValue(runSummary, achievement.runKey) >= Number(achievement.targetValue || 0) ||
          readNumericValue(statsAfter, achievement.statKey) >= Number(achievement.targetValue || 0)
        );
      case "theme-default-runs":
        return (
          runSummary.themeUsed === "default" &&
          readNumericValue(statsAfter, achievement.statKey) >= Number(achievement.targetValue || 0)
        );
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

      if (!checkCondition(achievement, runSummary, statsAfter)) {
        continue;
      }

      const unlockedAt = Date.now();
      state[achievement.id] = {
        unlocked: true,
        unlockedAt
      };
      unlockedNow.push({
        ...achievement,
        title:
          achievement.title && typeof achievement.title === "object"
            ? { ...achievement.title }
            : achievement.title,
        description:
          achievement.description && typeof achievement.description === "object"
            ? { ...achievement.description }
            : achievement.description,
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
