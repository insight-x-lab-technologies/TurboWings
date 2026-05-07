window.TurboWingsMissions = (() => {
  const MISSION_TEMPLATES = [
    {
      id: "collect-10-coins-run",
      titleKey: "mission.collect10Coins.title",
      descriptionKey: "mission.collect10Coins.description",
      type: "run_coins",
      objective: 10,
      reward: 25,
      scope: "run"
    },
    {
      id: "score-20-run",
      titleKey: "mission.score20.title",
      descriptionKey: "mission.score20.description",
      type: "run_score",
      objective: 20,
      reward: 35,
      scope: "run"
    },
    {
      id: "use-2-powerups-run",
      titleKey: "mission.use2PowerUps.title",
      descriptionKey: "mission.use2PowerUps.description",
      type: "run_powerups",
      objective: 2,
      reward: 30,
      scope: "run"
    },
    {
      id: "play-3-games",
      titleKey: "mission.play3Games.title",
      descriptionKey: "mission.play3Games.description",
      type: "cumulative_runs",
      objective: 3,
      reward: 45,
      scope: "cumulative"
    },
    {
      id: "survive-60-seconds",
      titleKey: "mission.survive60Seconds.title",
      descriptionKey: "mission.survive60Seconds.description",
      type: "run_time",
      objective: 60,
      reward: 50,
      scope: "run"
    },
    {
      id: "reach-flight-level-3",
      titleKey: "mission.reachFlightLevel3.title",
      descriptionKey: "mission.reachFlightLevel3.description",
      type: "run_flight_level",
      objective: 3,
      reward: 30,
      scope: "run"
    },
    {
      id: "pass-15-obstacles",
      titleKey: "mission.pass15Obstacles.title",
      descriptionKey: "mission.pass15Obstacles.description",
      type: "run_obstacles",
      objective: 15,
      reward: 40,
      scope: "run"
    },
    {
      id: "shield-save-1",
      titleKey: "mission.shieldSave.title",
      descriptionKey: "mission.shieldSave.description",
      type: "run_shield_save",
      objective: 1,
      reward: 35,
      scope: "run"
    },
    {
      id: "collect-5-magnet-coins",
      titleKey: "mission.magnetCoins.title",
      descriptionKey: "mission.magnetCoins.description",
      type: "run_magnet_coins",
      objective: 5,
      reward: 45,
      scope: "run"
    },
    {
      id: "play-night-run",
      titleKey: "mission.nightTheme.title",
      descriptionKey: "mission.nightTheme.description",
      type: "run_night_theme",
      objective: 1,
      reward: 30,
      scope: "run"
    }
  ];

  const TEMPLATE_MAP = Object.fromEntries(
    MISSION_TEMPLATES.map((template) => [template.id, template])
  );

  function getMissionTemplates() {
    return MISSION_TEMPLATES.map((template) => ({ ...template }));
  }

  function createMission(template) {
    return {
      id: template.id,
      titleKey: template.titleKey,
      descriptionKey: template.descriptionKey,
      type: template.type,
      objective: template.objective,
      progress: 0,
      reward: template.reward,
      status: "active"
    };
  }

  function ensureMission(rawMission) {
    const template = TEMPLATE_MAP[rawMission?.id];
    if (!template) {
      return null;
    }

    const progress = Number.isFinite(Number(rawMission.progress))
      ? Math.max(0, Number(rawMission.progress))
      : 0;
    const status =
      rawMission.status === "completed" || rawMission.status === "claimed"
        ? rawMission.status
        : "active";

    return {
      ...createMission(template),
      progress: Math.min(template.objective, progress),
      status
    };
  }

  function pickReplacementMission(excludedIds) {
    const available = MISSION_TEMPLATES.filter((template) => !excludedIds.includes(template.id));
    const pool = available.length ? available : MISSION_TEMPLATES;
    const template = pool[Math.floor(Math.random() * pool.length)];
    return createMission(template);
  }

  function ensureActiveMissions(rawMissions) {
    const missions = Array.isArray(rawMissions)
      ? rawMissions.map((mission) => ensureMission(mission)).filter(Boolean)
      : [];
    const uniqueMissions = [];

    for (const mission of missions) {
      if (!uniqueMissions.find((item) => item.id === mission.id)) {
        uniqueMissions.push(mission);
      }
    }

    while (uniqueMissions.length < 3) {
      uniqueMissions.push(
        pickReplacementMission(uniqueMissions.map((mission) => mission.id))
      );
    }

    return uniqueMissions.slice(0, 3);
  }

  function getProgressValue(mission, runSummary) {
    switch (mission.type) {
      case "run_coins":
        return runSummary.coinsCollected;
      case "run_score":
        return runSummary.score;
      case "run_powerups":
        return runSummary.powerUpsCollected;
      case "cumulative_runs":
        return 1;
      case "run_time":
        return runSummary.timeSurvived;
      case "run_flight_level":
        return runSummary.flightLevelReached;
      case "run_obstacles":
        return runSummary.obstaclesPassed;
      case "run_shield_save":
        return runSummary.shieldSaves;
      case "run_magnet_coins":
        return runSummary.coinsCollectedWithMagnet;
      case "run_night_theme":
        return runSummary.themeUsed === "city-night" ? 1 : 0;
      default:
        return 0;
    }
  }

  function evaluateMissions(activeMissions, runSummary) {
    const missions = ensureActiveMissions(activeMissions);
    const completedNow = [];

    const updatedMissions = missions.map((mission) => {
      if (mission.status !== "active") {
        return mission;
      }

      const nextValue = getProgressValue(mission, runSummary);
      const progress =
        mission.type === "cumulative_runs"
          ? Math.min(mission.objective, mission.progress + nextValue)
          : Math.min(mission.objective, nextValue);
      const isCompleted = progress >= mission.objective;
      const updatedMission = {
        ...mission,
        progress,
        status: isCompleted ? "completed" : "active"
      };

      if (isCompleted) {
        completedNow.push(updatedMission);
      }

      return updatedMission;
    });

    return {
      missions: updatedMissions,
      completedNow
    };
  }

  function claimMission(activeMissions, missionId) {
    const missions = ensureActiveMissions(activeMissions);
    const missionIndex = missions.findIndex(
      (mission) => mission.id === missionId && mission.status === "completed"
    );

    if (missionIndex === -1) {
      return {
        missions,
        reward: 0,
        claimedMission: null
      };
    }

    const claimedMission = {
      ...missions[missionIndex],
      status: "claimed"
    };
    const excludedIds = missions
      .filter((_, index) => index !== missionIndex)
      .map((mission) => mission.id);
    const replacementMission = pickReplacementMission(excludedIds);
    const nextMissions = missions.map((mission, index) =>
      index === missionIndex ? replacementMission : mission
    );

    return {
      missions: nextMissions,
      reward: claimedMission.reward,
      claimedMission,
      replacementMission
    };
  }

  return {
    claimMission,
    ensureActiveMissions,
    evaluateMissions,
    getMissionTemplates
  };
})();
