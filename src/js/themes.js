window.TurboWingsThemes = (() => {
  const DEFAULT_THEME = "city-day";

  const THEMES = {
    "city-day": {
      id: "city-day",
      labelKey: "theme.cityDay",
      className: "theme-city-day",
      gameplay: {
        skyStart: "#6fcbff",
        skyMid: "#99e1ff",
        skyEnd: "#ffe3a8",
        sunColor: "rgba(255, 226, 120, 0.82)",
        cloud: "rgba(255, 255, 255, 0.9)",
        cityBack: "#93bce4",
        cityMid: "#5f8dba",
        cityFront: "#325f8a",
        window: "rgba(255, 233, 167, 0.95)",
        obstacleMain: "#366796",
        obstacleTop: "#5c90c1",
        planeBody: "#ff6b35",
        planeWing: "#f6fbff",
        planeAccent: "#17324e",
        trail: "rgba(255, 255, 255, 0.75)"
      },
      audio: {
        menu: {
          wave: "triangle",
          volume: 0.045,
          pattern: [
            [523.25, 0.18, 0.04],
            [659.25, 0.18, 0.04],
            [783.99, 0.24, 0.06],
            [659.25, 0.14, 0.04],
            [587.33, 0.24, 0.2]
          ]
        },
        gameplay: {
          wave: "sawtooth",
          volume: 0.035,
          pattern: [
            [392, 0.12, 0.02],
            [523.25, 0.12, 0.02],
            [659.25, 0.12, 0.04],
            [523.25, 0.12, 0.02],
            [783.99, 0.16, 0.06],
            [659.25, 0.12, 0.04],
            [587.33, 0.18, 0.18]
          ]
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
      }
    },
    "city-night": {
      id: "city-night",
      labelKey: "theme.cityNight",
      className: "theme-city-night",
      gameplay: {
        skyStart: "#061529",
        skyMid: "#102648",
        skyEnd: "#23446d",
        sunColor: "rgba(220, 235, 255, 0.18)",
        cloud: "rgba(223, 236, 255, 0.28)",
        cityBack: "#1b3152",
        cityMid: "#17304d",
        cityFront: "#11263d",
        window: "rgba(255, 226, 126, 0.88)",
        obstacleMain: "#16304d",
        obstacleTop: "#214365",
        planeBody: "#87f18f",
        planeWing: "#e9f8ff",
        planeAccent: "#79aaff",
        trail: "rgba(155, 217, 255, 0.58)"
      },
      audio: {
        menu: {
          wave: "sine",
          volume: 0.04,
          pattern: [
            [349.23, 0.22, 0.04],
            [440, 0.18, 0.04],
            [523.25, 0.2, 0.06],
            [440, 0.16, 0.04],
            [392, 0.24, 0.2]
          ]
        },
        gameplay: {
          wave: "triangle",
          volume: 0.032,
          pattern: [
            [261.63, 0.12, 0.02],
            [329.63, 0.12, 0.02],
            [392, 0.14, 0.04],
            [329.63, 0.12, 0.02],
            [440, 0.14, 0.06],
            [392, 0.14, 0.04],
            [349.23, 0.18, 0.18]
          ]
        },
        button: {
          wave: "square",
          volume: 0.038,
          pattern: [
            [698.46, 0.05, 0.01],
            [932.33, 0.06, 0.01]
          ]
        },
        navigation: {
          wave: "sine",
          volume: 0.032,
          pattern: [
            [523.25, 0.05, 0.01],
            [783.99, 0.08, 0.02]
          ]
        },
        gameplaySfx: {
          flap: {
            wave: "sine",
            volume: 0.035,
            pattern: [
              [622.25, 0.03, 0.01],
              [830.61, 0.06, 0.01]
            ]
          },
          coin: {
            wave: "triangle",
            volume: 0.03,
            pattern: [
              [987.77, 0.03, 0.01],
              [1318.51, 0.05, 0.01]
            ]
          },
          powerup: {
            wave: "sine",
            volume: 0.032,
            pattern: [
              [440, 0.04, 0.01],
              [659.25, 0.05, 0.01],
              [880, 0.08, 0.02]
            ]
          },
          shield: {
            wave: "triangle",
            volume: 0.035,
            pattern: [
              [329.63, 0.04, 0.01],
              [523.25, 0.08, 0.01],
              [392, 0.08, 0.01]
            ]
          },
          collision: {
            wave: "sawtooth",
            volume: 0.03,
            pattern: [
              [196, 0.05, 0.01],
              [146.83, 0.08, 0.01],
              [110, 0.1, 0.02]
            ]
          },
          gameover: {
            wave: "triangle",
            volume: 0.032,
            pattern: [
              [293.66, 0.08, 0.02],
              [220, 0.1, 0.02],
              [164.81, 0.16, 0.04]
            ]
          },
          pause: {
            wave: "sine",
            volume: 0.028,
            pattern: [
              [329.63, 0.05, 0.01],
              [261.63, 0.08, 0.01]
            ]
          },
          resume: {
            wave: "sine",
            volume: 0.028,
            pattern: [
              [261.63, 0.05, 0.01],
              [392, 0.08, 0.01]
            ]
          }
        }
      }
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
    return Object.values(THEMES);
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
