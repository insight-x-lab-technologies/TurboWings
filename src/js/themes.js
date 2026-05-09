window.TurboWingsThemes = (() => {
  const DEFAULT_THEME = "default";
  const ASSET_ROOT = "./assets/images";
  const SONG_ROOT = "./assets/songs";

  const buildObstacleList = () => [`${ASSET_ROOT}/v1_default_game_obstacle_11.png`];

  const DEFAULT_AUDIO = {
    menu: {
      src: `${SONG_ROOT}/v1_default_menu.mp3`,
      volume: 0.22
    },
    gameplay: {
      src: `${SONG_ROOT}/v1_default_gameplay.mp3`,
      volume: 0.24
    },
    button: {
      wave: "square",
      volume: 0.04,
      pattern: [
        [880, 0.04, 0.01],
        [1174.66, 0.06, 0.01]
      ]
    },
    navigation: {
      wave: "triangle",
      volume: 0.035,
      pattern: [
        [659.25, 0.05, 0.01],
        [987.77, 0.08, 0.02]
      ]
    },
    gameplaySfx: {
      flap: {
        wave: "triangle",
        volume: 0.04,
        pattern: [
          [740, 0.03, 0.01],
          [980, 0.06, 0.01]
        ]
      },
      coin: {
        wave: "square",
        volume: 0.03,
        pattern: [
          [1046.5, 0.03, 0.01],
          [1396.91, 0.05, 0.01]
        ]
      },
      powerup: {
        wave: "triangle",
        volume: 0.034,
        pattern: [
          [523.25, 0.04, 0.01],
          [783.99, 0.05, 0.01],
          [1046.5, 0.08, 0.02]
        ]
      },
      shield: {
        wave: "sine",
        volume: 0.036,
        pattern: [
          [392, 0.04, 0.01],
          [587.33, 0.08, 0.01],
          [440, 0.07, 0.01]
        ]
      },
      collision: {
        wave: "sawtooth",
        volume: 0.032,
        pattern: [
          [220, 0.05, 0.01],
          [164.81, 0.08, 0.01],
          [130.81, 0.1, 0.02]
        ]
      },
      gameover: {
        wave: "triangle",
        volume: 0.034,
        pattern: [
          [349.23, 0.08, 0.02],
          [261.63, 0.1, 0.02],
          [196, 0.16, 0.04]
        ]
      },
      pause: {
        wave: "sine",
        volume: 0.03,
        pattern: [
          [392, 0.05, 0.01],
          [329.63, 0.08, 0.01]
        ]
      },
      resume: {
        wave: "sine",
        volume: 0.03,
        pattern: [
          [329.63, 0.05, 0.01],
          [440, 0.08, 0.01]
        ]
      }
    }
  };

  const THEMES = {
    default: {
      id: "default",
      labelKey: "theme.default",
      className: "theme-default",
      assets: {
        backgroundImage: `${ASSET_ROOT}/v1_default_game_bg.png`,
        gameplayJet: `${ASSET_ROOT}/v1_default_gameplay_jet.png`,
        gameplayJetFrame: null,
        obstacles: buildObstacleList(),
        icons: {
          coin: `${ASSET_ROOT}/v1_default_game_icon_coin.png`,
          coinGold: `${ASSET_ROOT}/v1_default_game_icon_coin_gold.png`,
          coinSilver: `${ASSET_ROOT}/v1_default_game_icon_coin_silver.png`,
          home: `${ASSET_ROOT}/v1_default_game_icon_home.png`,
          level1: `${ASSET_ROOT}/v1_default_game_icon_level_1.png`,
          level23: `${ASSET_ROOT}/v1_default_game_icon_level_2-3.png`,
          level4: `${ASSET_ROOT}/v1_default_game_icon_level_4.png`,
          level5: `${ASSET_ROOT}/v1_default_game_icon_level_5.png`,
          pause: `${ASSET_ROOT}/v1_default_game_icon_pause.png`,
          pilot: `${ASSET_ROOT}/v1_default_game_icon_pilot.png`,
          points: `${ASSET_ROOT}/v1_default_game_icon_points.png`,
          powerupMagnet: `${ASSET_ROOT}/v1_default_game_icon_powerup_magnet.png`,
          powerupShield: `${ASSET_ROOT}/v1_default_game_icon_powerup_shield.png`,
          powerupSlow: `${ASSET_ROOT}/v1_default_game_icon_powerup_slowmotion.png`,
          resume: `${ASSET_ROOT}/v1_default_game_icon_resume.png`,
          settings: `${ASSET_ROOT}/v1_default_game_icon_settings.png`,
          stop: `${ASSET_ROOT}/v1_default_game_icon_stop.png`,
          trophy: `${ASSET_ROOT}/v1_default_game_icon_trophy.png`
        }
      },
      gameplay: {
        skyStart: "#102447",
        skyMid: "#2c3f74",
        skyEnd: "#ff9b60",
        sunColor: "rgba(255, 224, 171, 0.9)",
        cloud: "rgba(255, 214, 179, 0.32)",
        cityBack: "#203965",
        cityMid: "#182d54",
        cityFront: "#0f2142",
        window: "rgba(255, 174, 83, 0.9)",
        obstacleMain: "#182744",
        obstacleTop: "#ff8f4e",
        planeBody: "#ff7a38",
        planeWing: "#f5fbff",
        planeAccent: "#12284d",
        trail: "rgba(255, 193, 117, 0.72)",
        haze: "rgba(255, 155, 96, 0.14)"
      },
      audio: DEFAULT_AUDIO
    }
  };

  let activeTheme = DEFAULT_THEME;

  function resolveTheme(themeId) {
    return THEMES[themeId] ? themeId : DEFAULT_THEME;
  }

  function getTheme(themeId = activeTheme) {
    return THEMES[resolveTheme(themeId)];
  }

  function getThemeList() {
    return [THEMES.default];
  }

  function applyTheme(themeId) {
    activeTheme = resolveTheme(themeId);
    const theme = getTheme(activeTheme);

    if (typeof document !== "undefined") {
      document.body.classList.remove(...Object.values(THEMES).map((item) => item.className));
      document.body.classList.add(theme.className);
    }

    return activeTheme;
  }

  function getActiveThemeId() {
    return activeTheme;
  }

  return {
    DEFAULT_THEME,
    THEMES,
    applyTheme,
    getActiveThemeId,
    getTheme,
    getThemeList
  };
})();
