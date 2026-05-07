window.TurboWingsI18n = (() => {
  const DEFAULT_LANGUAGE = "en-US";

  const TRANSLATIONS = {
    "en-US": {
      "app.title": "Turbo Wings",
      "home.eyebrow": "Arcade Flight",
      "home.subtitle":
        "Pick your pilot, chase missions, and master the skyline with one-touch precision.",
      "home.newGame": "New Game",
      "home.settings": "Settings",
      "home.leaderboards": "Leaderboards",
      "home.achievements": "Achievements",
      "home.bestScore": "Best Score",
      "home.totalCoins": "Coin Bank",
      "home.highestFlightLevel": "Highest Flight Level",
      "home.totalRuns": "Total Runs",
      "home.topPilot": "Top Pilot",
      "home.unlockedLevels": "Unlocked Levels",
      "home.controls": "Controls",
      "home.controlsValue": "Tap, click or press Space",
      "home.noPilot": "No flights yet",
      "home.pilotProfile": "Pilot Profile",
      "home.profileMeta": "Best survival {survival} • Shield saves {shields}",
      "home.activeMissions": "Active Missions",
      "home.activeMissionsTitle": "3 Live Objectives",
      "home.activeMissionsHint": "Complete missions, claim rewards, and refresh your route goals.",
      "home.recentAchievements": "Recent Achievements",
      "home.recentAchievementsTitle": "Latest Unlocks",
      "home.recentAchievementsHint": "Permanent milestones for your current pilot.",
      "home.viewAllAchievements": "View All",
      "home.noMissions": "No active missions right now.",
      "home.noRecentAchievements": "No achievements unlocked yet.",
      "setup.eyebrow": "Flight Deck",
      "setup.title": "Prepare a Run",
      "setup.subtitle":
        "Choose the pilot name and difficulty before taking off. Your latest setup stays ready for fast retries.",
      "setup.playerName": "Pilot Name",
      "setup.playerPlaceholder": "Type your pilot name",
      "setup.defaultPlayerName": "Player 1",
      "setup.selectDifficulty": "Difficulty",
      "setup.difficultyHint":
        "The last two challenges unlock only after scoring 100 on the previous high-tier route.",
      "setup.lastLoadout": "Last Loadout",
      "setup.start": "Start Flight",
      "setup.back": "Back",
      "setup.locked": "Locked",
      "setup.unlocked": "Ready",
      "setup.lockedHint": "Reach {score} points on {difficulty} to unlock this route.",
      "setup.selectedSummary": "{player} - {difficulty}",
      "setup.startReady": "Ready for takeoff.",
      "settings.eyebrow": "Control Tower",
      "settings.title": "Settings",
      "settings.subtitle":
        "Tune language, theme, audio, and how each difficulty feels across mobile, tablet, and desktop.",
      "settings.language": "Language",
      "settings.theme": "Theme",
      "settings.music": "Theme Music",
      "settings.musicHint": "Loop a different synth track for menus and gameplay.",
      "settings.sfx": "Button and Navigation Sounds",
      "settings.sfxHint": "Play themed click and menu transition effects.",
      "settings.gameplayAudio": "Gameplay Effects",
      "settings.gameplayAudioHint":
        "Enable flight, coin, power-up, pause, and crash sounds during each run.",
      "settings.obstacles": "Obstacles",
      "settings.obstaclesHint": "Show and enable obstacle collisions during gameplay.",
      "settings.powerUps": "Power-Ups",
      "settings.powerUpsHint": "Allow Shield, Magnet, and Slow Motion spawns.",
      "settings.coins": "Coins",
      "settings.coinsHint": "Allow collectible coin routes during the run.",
      "settings.effects": "Effect Animations",
      "settings.effectsHint": "Toggle pulses, trails, bursts, and other graphic effect motion.",
      "settings.gameplayTuning": "Gameplay Tuning",
      "settings.tuningHint": "Adjust speed and obstacle gap for each difficulty level.",
      "settings.advancedEyebrow": "Fine Tuning",
      "settings.advancedTitle": "Advanced Settings",
      "settings.advancedHint": "Open the detailed difficulty tuning controls.",
      "settings.openAdvanced": "Open Advanced Settings",
      "settings.restoreDefaults": "Restore Default Tuning",
      "settings.levelSpeed": "Speed",
      "settings.obstacleGap": "Obstacle Gap",
      "settings.back": "Back",
      "leaderboard.eyebrow": "Hall of Pilots",
      "leaderboard.title": "Top 10 Flights",
      "leaderboard.subtitle":
        "The best runs store pilot name, score, chosen difficulty, and the exact flight date.",
      "leaderboard.rank": "Rank",
      "leaderboard.player": "Pilot",
      "leaderboard.score": "Score",
      "leaderboard.difficulty": "Difficulty",
      "leaderboard.date": "Date",
      "leaderboard.empty": "No runs recorded yet. Launch a flight and claim the skyline.",
      "leaderboard.back": "Back",
      "achievements.eyebrow": "Pilot Archive",
      "achievements.title": "Achievements",
      "achievements.subtitle":
        "Permanent unlocks track long-term mastery, theme exploration, and aerial milestones.",
      "achievements.back": "Back",
      "achievements.unlocked": "Unlocked",
      "achievements.locked": "Locked",
      "achievements.reward": "{coins} coins",
      "achievements.notUnlockedYet": "Still locked",
      "achievements.unlockedAt": "Unlocked {date}",
      "achievements.unlockedCount": "Unlocked",
      "achievements.totalRewardedCoins": "Rewarded Coins",
      "missions.active": "Active",
      "missions.completed": "Completed",
      "missions.claim": "Claim",
      "missions.reward": "{coins} coins",
      "missions.progress": "{progress}/{objective}",
      "game.score": "Score",
      "game.coins": "Coins",
      "game.flightLevel": "Flight Level",
      "game.flightLevelValue": "FL {level}",
      "game.run": "Run",
      "game.pause": "Pause",
      "game.resume": "Resume",
      "game.home": "Home",
      "game.changeSetup": "Change Setup",
      "game.readyEyebrow": "Ready for Takeoff",
      "game.tapToFly": "Tap to Fly",
      "game.instructions":
        "Tap, click or press Space to boost upward and drift through every tower lane.",
      "game.pauseEyebrow": "Hover Mode",
      "game.paused": "Paused",
      "game.pauseHint": "Catch your breath, then dive back into the skyline.",
      "game.gameOverEyebrow": "Flight Report",
      "game.gameOver": "Game Over",
      "game.finalScore": "Final Score",
      "game.collectedCoins": "Run Coins",
      "game.bestScore": "Best Score",
      "game.totalCoins": "Coin Bank",
      "game.timeSurvived": "Time Survived",
      "game.flightLevelReached": "Flight Level Reached",
      "game.powerUpsCollected": "Power-ups Collected",
      "game.obstaclesPassed": "Obstacles Passed",
      "game.missionsCompleted": "Missions Completed",
      "game.achievementsUnlocked": "Achievements Unlocked",
      "game.noMissionsCompleted": "No missions completed this run.",
      "game.noAchievementsUnlocked": "No achievements unlocked this run.",
      "game.playAgain": "Play Again",
      "game.resultMeta": "{player} - {difficulty} - {date}",
      "game.unlockNotice": "{difficulty} unlocked!",
      "difficulty.breeze": "1 - Breeze",
      "difficulty.normal": "2 - Normal",
      "difficulty.storm": "3 - Storm",
      "difficulty.turbo": "4 - Turbo",
      "difficulty.legend": "5 - Legend",
      "difficulty.breezeDescription": "Wide openings, calmer speed, and extra room to learn the skyline.",
      "difficulty.normalDescription": "The standard Turbo Wings route with balanced speed and pressure.",
      "difficulty.stormDescription": "Faster lanes, tighter gaps, and denser traffic between towers.",
      "difficulty.turboDescription": "Aggressive speed bursts that unlock after mastering Storm.",
      "difficulty.legendDescription": "The fiercest skyline route, earned only by conquering Turbo.",
      "powerup.shield": "Shield",
      "powerup.magnet": "Magnet",
      "powerup.slow": "Slow",
      "powerup.timer": "{name} {time}s",
      "notify.missionCompletedTitle": "Mission Complete",
      "notify.missionClaimedTitle": "Reward Claimed",
      "notify.achievementUnlockedTitle": "Achievement Unlocked",
      "notify.newRecordTitle": "New Record",
      "notify.newRecordMessage": "You reached {score} points.",
      "notify.coinsAddedTitle": "Coins Added",
      "notify.coinsAddedMessage": "+{coins} coins added to your bank.",
      "notify.settingsResetTitle": "Defaults Restored",
      "notify.settingsResetMessage": "Difficulty tuning is back to the original values.",
      "mission.collect10Coins.title": "Shiny Route",
      "mission.collect10Coins.description": "Collect 10 coins in a single run.",
      "mission.score20.title": "Urban Push",
      "mission.score20.description": "Score 20 points in one run.",
      "mission.use2PowerUps.title": "Loaded Flight",
      "mission.use2PowerUps.description": "Collect 2 power-ups in a single run.",
      "mission.play3Games.title": "Keep Flying",
      "mission.play3Games.description": "Play 3 runs.",
      "mission.survive60Seconds.title": "Sky Patroller",
      "mission.survive60Seconds.description": "Survive for 60 seconds in one run.",
      "mission.reachFlightLevel3.title": "Climb Higher",
      "mission.reachFlightLevel3.description": "Reach Flight Level 3.",
      "mission.pass15Obstacles.title": "City Threader",
      "mission.pass15Obstacles.description": "Pass 15 obstacles in one run.",
      "mission.shieldSave.title": "Second Chance",
      "mission.shieldSave.description": "Be saved by Shield 1 time.",
      "mission.magnetCoins.title": "Magnetic Sweep",
      "mission.magnetCoins.description": "Collect 5 coins while Magnet is active.",
      "mission.nightTheme.title": "Night Patrol",
      "mission.nightTheme.description": "Play one run using the night city theme.",
      "achievement.firstFlight.title": "First Flight",
      "achievement.firstFlight.description": "Play your first run.",
      "achievement.urbanPilot.title": "Urban Pilot",
      "achievement.urbanPilot.description": "Reach 25 points in a run.",
      "achievement.skyAce.title": "Sky Ace",
      "achievement.skyAce.description": "Reach 50 points in a run.",
      "achievement.skyMaster.title": "Sky Master",
      "achievement.skyMaster.description": "Reach 100 points in a run.",
      "achievement.coinHunter.title": "Coin Hunter",
      "achievement.coinHunter.description": "Collect 100 coins in total.",
      "achievement.magnetic.title": "Magnetic",
      "achievement.magnetic.description": "Collect 25 coins using Magnet.",
      "achievement.perfectShield.title": "Perfect Shield",
      "achievement.perfectShield.description": "Be saved by Shield 10 times.",
      "achievement.survivor.title": "Survivor",
      "achievement.survivor.description": "Survive for 90 seconds in a run.",
      "achievement.nightExplorer.title": "Night Explorer",
      "achievement.nightExplorer.description": "Play using the night city theme.",
      "achievement.persistent.title": "Persistent",
      "achievement.persistent.description": "Play 25 runs.",
      "language.en-US": "English (US)",
      "language.pt-BR": "Portuguese (Brazil)",
      "theme.cityDay": "Modern City Day",
      "theme.cityNight": "Modern City Night"
    },
    "pt-BR": {
      "app.title": "Turbo Wings",
      "home.eyebrow": "Voo Arcade",
      "home.subtitle":
        "Escolha seu piloto, cumpra missoes e domine o horizonte com precisao de toque unico.",
      "home.newGame": "Novo Jogo",
      "home.settings": "Configuracoes",
      "home.leaderboards": "Ranking",
      "home.achievements": "Conquistas",
      "home.bestScore": "Melhor Pontuacao",
      "home.totalCoins": "Banco de Moedas",
      "home.highestFlightLevel": "Maior Flight Level",
      "home.totalRuns": "Partidas Jogadas",
      "home.topPilot": "Melhor Piloto",
      "home.unlockedLevels": "Niveis Liberados",
      "home.controls": "Controles",
      "home.controlsValue": "Toque, clique ou Espaco",
      "home.noPilot": "Nenhum voo ainda",
      "home.pilotProfile": "Perfil do Piloto",
      "home.profileMeta": "Melhor sobrevivencia {survival} • Escudos {shields}",
      "home.activeMissions": "Missoes Ativas",
      "home.activeMissionsTitle": "3 Objetivos Ativos",
      "home.activeMissionsHint": "Complete missoes, resgate recompensas e renove seus desafios.",
      "home.recentAchievements": "Conquistas Recentes",
      "home.recentAchievementsTitle": "Ultimos Desbloqueios",
      "home.recentAchievementsHint": "Marcos permanentes do piloto atual.",
      "home.viewAllAchievements": "Ver Tudo",
      "home.noMissions": "Nenhuma missao ativa agora.",
      "home.noRecentAchievements": "Nenhuma conquista desbloqueada ainda.",
      "setup.eyebrow": "Cabine de Voo",
      "setup.title": "Preparar Partida",
      "setup.subtitle":
        "Escolha o nome do piloto e a dificuldade antes de decolar. A ultima configuracao fica salva para repetir rapido.",
      "setup.playerName": "Nome do Piloto",
      "setup.playerPlaceholder": "Digite o nome do piloto",
      "setup.defaultPlayerName": "Nome Jogador 1",
      "setup.selectDifficulty": "Dificuldade",
      "setup.difficultyHint":
        "Os dois ultimos desafios liberam apenas ao atingir 100 pontos na rota anterior de alto nivel.",
      "setup.lastLoadout": "Ultima Configuracao",
      "setup.start": "Iniciar Voo",
      "setup.back": "Voltar",
      "setup.locked": "Bloqueado",
      "setup.unlocked": "Pronto",
      "setup.lockedHint": "Faca {score} pontos em {difficulty} para liberar esta rota.",
      "setup.selectedSummary": "{player} - {difficulty}",
      "setup.startReady": "Tudo pronto para decolar.",
      "settings.eyebrow": "Torre de Controle",
      "settings.title": "Configuracoes",
      "settings.subtitle":
        "Ajuste idioma, tema, audio e como cada dificuldade se comporta no mobile, tablet e desktop.",
      "settings.language": "Idioma",
      "settings.theme": "Tema",
      "settings.music": "Musica do Tema",
      "settings.musicHint": "Toca uma trilha synth diferente para menus e gameplay.",
      "settings.sfx": "Sons de Botao e Navegacao",
      "settings.sfxHint": "Toca cliques e transicoes de menu ligados ao tema atual.",
      "settings.gameplayAudio": "Efeitos do Gameplay",
      "settings.gameplayAudioHint":
        "Liga sons de impulso, moedas, power-ups, pausa e colisao durante a partida.",
      "settings.obstacles": "Obstaculos",
      "settings.obstaclesHint": "Exibe e ativa colisoes com obstaculos durante a partida.",
      "settings.powerUps": "Power-Ups",
      "settings.powerUpsHint": "Permite surgimento de Escudo, Ima e Slow Motion.",
      "settings.coins": "Moedas",
      "settings.coinsHint": "Permite rotas de moedas coletaveis durante a partida.",
      "settings.effects": "Animacoes de Efeitos",
      "settings.effectsHint": "Liga ou desliga pulsos, rastros, explosoes e outras animacoes visuais.",
      "settings.gameplayTuning": "Ajuste de Gameplay",
      "settings.tuningHint": "Regule velocidade e espacamento dos obstaculos para cada nivel.",
      "settings.advancedEyebrow": "Ajuste Fino",
      "settings.advancedTitle": "Configuracoes Avancadas",
      "settings.advancedHint": "Abra os controles detalhados de tuning de dificuldade.",
      "settings.openAdvanced": "Abrir Configuracoes Avancadas",
      "settings.restoreDefaults": "Restaurar Ajustes Padrao",
      "settings.levelSpeed": "Velocidade",
      "settings.obstacleGap": "Espacamento",
      "settings.back": "Voltar",
      "leaderboard.eyebrow": "Sala dos Pilotos",
      "leaderboard.title": "Top 10 Voos",
      "leaderboard.subtitle":
        "Os melhores voos salvam nome do piloto, pontuacao, dificuldade escolhida e a data exata da partida.",
      "leaderboard.rank": "Pos.",
      "leaderboard.player": "Piloto",
      "leaderboard.score": "Pontos",
      "leaderboard.difficulty": "Dificuldade",
      "leaderboard.date": "Data",
      "leaderboard.empty": "Nenhum voo registrado ainda. Decole e domine o horizonte.",
      "leaderboard.back": "Voltar",
      "achievements.eyebrow": "Arquivo do Piloto",
      "achievements.title": "Conquistas",
      "achievements.subtitle":
        "Desbloqueios permanentes acompanham seu dominio, exploracao de temas e marcos aereos.",
      "achievements.back": "Voltar",
      "achievements.unlocked": "Liberada",
      "achievements.locked": "Bloqueada",
      "achievements.reward": "{coins} moedas",
      "achievements.notUnlockedYet": "Ainda bloqueada",
      "achievements.unlockedAt": "Liberada em {date}",
      "achievements.unlockedCount": "Liberadas",
      "achievements.totalRewardedCoins": "Moedas de Recompensa",
      "missions.active": "Ativa",
      "missions.completed": "Concluida",
      "missions.claim": "Resgatar",
      "missions.reward": "{coins} moedas",
      "missions.progress": "{progress}/{objective}",
      "game.score": "Pontos",
      "game.coins": "Moedas",
      "game.flightLevel": "Flight Level",
      "game.flightLevelValue": "FL {level}",
      "game.run": "Partida",
      "game.pause": "Pausar",
      "game.resume": "Continuar",
      "game.home": "Inicio",
      "game.changeSetup": "Trocar Setup",
      "game.readyEyebrow": "Pronto para Decolar",
      "game.tapToFly": "Toque para Voar",
      "game.instructions":
        "Toque, clique ou aperte Espaco para subir e cruzar cada corredor entre as torres.",
      "game.pauseEyebrow": "Modo Pairado",
      "game.paused": "Pausado",
      "game.pauseHint": "Respire fundo e volte para o horizonte quando quiser.",
      "game.gameOverEyebrow": "Relatorio de Voo",
      "game.gameOver": "Fim de Jogo",
      "game.finalScore": "Pontuacao Final",
      "game.collectedCoins": "Moedas da Partida",
      "game.bestScore": "Melhor Pontuacao",
      "game.totalCoins": "Banco de Moedas",
      "game.timeSurvived": "Tempo Sobrevivido",
      "game.flightLevelReached": "Flight Level Alcancado",
      "game.powerUpsCollected": "Power-ups Coletados",
      "game.obstaclesPassed": "Obstaculos Ultrapassados",
      "game.missionsCompleted": "Missoes Concluidas",
      "game.achievementsUnlocked": "Conquistas Desbloqueadas",
      "game.noMissionsCompleted": "Nenhuma missao concluida nesta partida.",
      "game.noAchievementsUnlocked": "Nenhuma conquista desbloqueada nesta partida.",
      "game.playAgain": "Jogar Novamente",
      "game.resultMeta": "{player} - {difficulty} - {date}",
      "game.unlockNotice": "{difficulty} liberado!",
      "difficulty.breeze": "1 - Brisa",
      "difficulty.normal": "2 - Normal",
      "difficulty.storm": "3 - Tempestade",
      "difficulty.turbo": "4 - Turbo",
      "difficulty.legend": "5 - Lenda",
      "difficulty.breezeDescription": "Aberturas largas, velocidade mais calma e mais espaco para aprender a rota.",
      "difficulty.normalDescription": "A rota padrao de Turbo Wings, com ritmo equilibrado e pressao na medida.",
      "difficulty.stormDescription": "Corredores mais rapidos, gaps menores e trafego mais denso entre predios.",
      "difficulty.turboDescription": "Picos agressivos de velocidade que liberam apos dominar Tempestade.",
      "difficulty.legendDescription": "A rota mais feroz do horizonte, conquistada apenas apos vencer Turbo.",
      "powerup.shield": "Escudo",
      "powerup.magnet": "Ima",
      "powerup.slow": "Lento",
      "powerup.timer": "{name} {time}s",
      "notify.missionCompletedTitle": "Missao Concluida",
      "notify.missionClaimedTitle": "Recompensa Resgatada",
      "notify.achievementUnlockedTitle": "Conquista Desbloqueada",
      "notify.newRecordTitle": "Novo Recorde",
      "notify.newRecordMessage": "Voce alcancou {score} pontos.",
      "notify.coinsAddedTitle": "Moedas Adicionadas",
      "notify.coinsAddedMessage": "+{coins} moedas adicionadas ao seu banco.",
      "notify.settingsResetTitle": "Padrao Restaurado",
      "notify.settingsResetMessage": "O ajuste das dificuldades voltou aos valores originais.",
      "mission.collect10Coins.title": "Rota Brilhante",
      "mission.collect10Coins.description": "Colete 10 moedas em uma unica partida.",
      "mission.score20.title": "Impulso Urbano",
      "mission.score20.description": "Faca 20 pontos em uma partida.",
      "mission.use2PowerUps.title": "Voo Equipado",
      "mission.use2PowerUps.description": "Colete 2 power-ups em uma unica partida.",
      "mission.play3Games.title": "Continue Voando",
      "mission.play3Games.description": "Jogue 3 partidas.",
      "mission.survive60Seconds.title": "Patrulha Aerea",
      "mission.survive60Seconds.description": "Sobreviva por 60 segundos em uma partida.",
      "mission.reachFlightLevel3.title": "Suba Mais",
      "mission.reachFlightLevel3.description": "Alcance o Flight Level 3.",
      "mission.pass15Obstacles.title": "Corta-Cidade",
      "mission.pass15Obstacles.description": "Ultrapasse 15 obstaculos em uma partida.",
      "mission.shieldSave.title": "Segunda Chance",
      "mission.shieldSave.description": "Seja salvo pelo Escudo 1 vez.",
      "mission.magnetCoins.title": "Varredura Magnetica",
      "mission.magnetCoins.description": "Colete 5 moedas com o Ima ativo.",
      "mission.nightTheme.title": "Patrulha Noturna",
      "mission.nightTheme.description": "Jogue uma partida usando o tema noturno.",
      "achievement.firstFlight.title": "Primeiro Voo",
      "achievement.firstFlight.description": "Jogue sua primeira partida.",
      "achievement.urbanPilot.title": "Piloto Urbano",
      "achievement.urbanPilot.description": "Alcance 25 pontos em uma partida.",
      "achievement.skyAce.title": "As dos Ceus",
      "achievement.skyAce.description": "Alcance 50 pontos em uma partida.",
      "achievement.skyMaster.title": "Mestre dos Ceus",
      "achievement.skyMaster.description": "Alcance 100 pontos em uma partida.",
      "achievement.coinHunter.title": "Cacador de Moedas",
      "achievement.coinHunter.description": "Colete 100 moedas no total.",
      "achievement.magnetic.title": "Magnetico",
      "achievement.magnetic.description": "Colete 25 moedas usando Ima.",
      "achievement.perfectShield.title": "Escudo Perfeito",
      "achievement.perfectShield.description": "Seja salvo pelo Escudo 10 vezes.",
      "achievement.survivor.title": "Sobrevivente",
      "achievement.survivor.description": "Sobreviva por 90 segundos em uma partida.",
      "achievement.nightExplorer.title": "Explorador Noturno",
      "achievement.nightExplorer.description": "Jogue usando o tema noturno da cidade.",
      "achievement.persistent.title": "Persistente",
      "achievement.persistent.description": "Jogue 25 partidas.",
      "language.en-US": "Ingles (EUA)",
      "language.pt-BR": "Portugues (Brasil)",
      "theme.cityDay": "Cidade Moderna de Dia",
      "theme.cityNight": "Cidade Moderna a Noite"
    }
  };

  const SUPPORTED_LANGUAGES = Object.keys(TRANSLATIONS);
  const listeners = new Set();
  let currentLanguage = DEFAULT_LANGUAGE;

  function normalizeLanguage(input) {
    if (!input) {
      return DEFAULT_LANGUAGE;
    }

    const directMatch = SUPPORTED_LANGUAGES.find(
      (language) => language.toLowerCase() === input.toLowerCase()
    );
    if (directMatch) {
      return directMatch;
    }

    const base = input.split("-")[0].toLowerCase();
    const prefixMatch = SUPPORTED_LANGUAGES.find((language) =>
      language.toLowerCase().startsWith(base)
    );
    return prefixMatch || DEFAULT_LANGUAGE;
  }

  function detectLanguage() {
    if (typeof navigator === "undefined") {
      return DEFAULT_LANGUAGE;
    }

    const candidates =
      Array.isArray(navigator.languages) && navigator.languages.length
        ? navigator.languages
        : [navigator.language];

    for (const candidate of candidates) {
      const normalized = normalizeLanguage(candidate);
      if (normalized) {
        return normalized;
      }
    }

    return DEFAULT_LANGUAGE;
  }

  function notify() {
    for (const listener of listeners) {
      listener(currentLanguage);
    }
  }

  function initI18n(preferredLanguage) {
    currentLanguage = normalizeLanguage(preferredLanguage || detectLanguage());
    return currentLanguage;
  }

  function setLanguage(language) {
    currentLanguage = normalizeLanguage(language);
    notify();
    return currentLanguage;
  }

  function getLanguage() {
    return currentLanguage;
  }

  function t(key) {
    const dictionary = TRANSLATIONS[currentLanguage] || TRANSLATIONS[DEFAULT_LANGUAGE];
    return dictionary[key] || TRANSLATIONS[DEFAULT_LANGUAGE][key] || key;
  }

  function format(key, params = {}) {
    let template = t(key);
    for (const [paramKey, value] of Object.entries(params)) {
      template = template.replaceAll(`{${paramKey}}`, String(value));
    }
    return template;
  }

  function getLanguageOptions() {
    return SUPPORTED_LANGUAGES.map((language) => ({
      value: language,
      label: t(`language.${language}`)
    }));
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return {
    DEFAULT_LANGUAGE,
    SUPPORTED_LANGUAGES,
    detectLanguage,
    format,
    getLanguage,
    getLanguageOptions,
    initI18n,
    setLanguage,
    subscribe,
    t
  };
})();
