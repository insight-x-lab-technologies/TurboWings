const CACHE_VERSION = "turbo-wings-v7";
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const APP_SHELL_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.png",
  "./apple-touch-icon.png",
  "./apple-touch-icon-precomposed.png",
  "./css/themes.css",
  "./css/style.css",
  "./js/i18n.js",
  "./js/themes.js",
  "./js/storage.js",
  "./js/aircraft.js",
  "./js/online.js",
  "./js/daily.js",
  "./js/scorecard.js",
  "./js/progression.js",
  "./js/missions.js",
  "./js/achievements.js",
  "./js/gameplay.js",
  "./js/audio.js",
  "./js/application.js",
  "./assets/images/v1_default_logo.png",
  "./assets/images/v1_default_HomeJet.png",
  "./assets/images/v1_default_game_bg.png",
  "./assets/images/v1_default_gameplay_jet.png",
  "./assets/images/v1_default_game_icon_coin.png",
  "./assets/images/v1_default_game_icon_coin_gold.png",
  "./assets/images/v1_default_game_icon_level_1.png",
  "./assets/images/v1_default_game_icon_level_2-3.png",
  "./assets/images/v1_default_game_icon_settings.png",
  "./assets/images/v1_default_game_icon_trophy.png",
  "./assets/images/v1_default_game_icon_points.png",
  "./assets/images/v1_default_game_icon_pilot.png",
  "./assets/images/v1_default_game_icon_home.png",
  "./assets/images/v1_default_game_icon_pause.png",
  "./assets/images/v1_default_game_icon_resume.png",
  "./assets/images/v1_default_game_icon_stop.png",
  "./assets/images/v1_default_game_icon_ShareScore.png",
  "./assets/images/v1_default_game_icon_MissionsCompleted.png",
  "./assets/images/v1_default_game_icon_AchievementsUnlocked.png",
  "./assets/images/v1_default_game_icon_PlayAgain.png",
  "./assets/images/v1_default_game_icon_Hangar.png",
  "./assets/images/v1_default_game_icon_OnLine.png",
  "./assets/images/v1_default_game_icon_OffLine.png",
  "./assets/images/v1_default_game_icon_FinalScore.png",
  "./assets/images/v1_default_game_icon_BestScore.png",
  "./assets/images/v1_default_game_icon_TimeSurvived.png",
  "./assets/images/v1_default_game_icon_CoinBank.png",
  "./assets/images/v1_default_game_icon_ObstaclesPassed.png",
  "./assets/images/v1_default_game_icon_PowerUpsCollected.png",
  "./assets/images/v1_default_game_icon_powerup_shield.png",
  "./assets/images/v1_default_game_icon_powerup_magnet.png",
  "./assets/images/v1_default_game_icon_powerup_slowmotion.png",
  "./assets/images/jets/v1_default_gameplay_jet_PhantomStrike.png",
  "./assets/images/jets/v1_default_gameplay_jet_ViperEdge.png",
  "./assets/images/jets/v1_default_gameplay_jet_StormEagle.png",
  "./assets/images/jets/v1_default_gameplay_jet_MidnightFury.png",
  "./assets/images/jets/v1_default_gameplay_jet_SolarFalcon.png",
  "./assets/images/jets/v1_default_gameplay_jet_NebulaX.png",
  "./assets/images/jets/v1_default_gameplay_jet_ThunderKing.png",
  "./assets/images/v1_default_game_obstacle_1.png",
  "./assets/images/v1_default_game_obstacle_2.png",
  "./assets/images/v1_default_game_obstacle_3.png",
  "./assets/images/v1_default_game_obstacle_4.png",
  "./assets/images/v1_default_game_obstacle_5.png",
  "./assets/images/v1_default_game_obstacle_6.png",
  "./assets/images/v1_default_game_obstacle_7.png",
  "./assets/images/v1_default_game_obstacle_8.png",
  "./assets/images/v1_default_game_obstacle_9.png",
  "./assets/images/v1_default_game_obstacle_10.png",
  "./assets/images/v1_default_game_obstacle_11.png",
  "./assets/songs/v1_default_gameplay.mp3",
  "./assets/songs/v1_default_menu.mp3",
  "./assets/pwa/icon-192.png",
  "./assets/pwa/icon-maskable-192.png",
  "./assets/pwa/icon-512.png",
  "./assets/pwa/icon-maskable-512.png",
  "./assets/pwa/screenshot-gameplay-wide.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_ASSETS)).then(() => {
      self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE) {
            return caches.delete(key);
          }
          return Promise.resolve();
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put("./index.html", responseClone));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match("./index.html");
          return cached || caches.match("./");
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});
