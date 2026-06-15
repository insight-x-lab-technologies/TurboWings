window.TurboWingsOnline = (() => {
  const SUPABASE_URL = "https://pjkpswpmvxtdsoahprcm.supabase.co";
  const SUPABASE_KEY = "sb_publishable_Kcc409KmwqFbstFoL5AV-Q_tyfTYPlr";
  const COUNTRY_API = "https://ipapi.co/json/";
  const GLOBAL_LEADERBOARD_LIMIT = 11;
  const DAILY_LEADERBOARD_LIMIT = 11;

  const ONLINE_MODE_KEY = "turbo-wings-online-mode";
  const COUNTRY_CACHE_KEY = "turbo-wings-country-cache";

  function isOnlineModeEnabled() {
    return window.localStorage.getItem(ONLINE_MODE_KEY) !== "false";
  }

  function setOnlineMode(enabled) {
    window.localStorage.setItem(ONLINE_MODE_KEY, enabled ? "true" : "false");
  }

  function normalizeKey(name) {
    return String(name || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .slice(0, 24);
  }

  function headers(extra = {}) {
    return {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...extra
    };
  }

  async function get(path, params = {}) {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${path}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString(), { headers: headers() });
    if (!res.ok) {
      throw new Error(`GET ${path} failed: ${res.status}`);
    }
    return res.json();
  }

  async function post(path, body) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      method: "POST",
      headers: headers({ Prefer: "return=representation" }),
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      throw new Error(`POST ${path} failed: ${res.status}`);
    }
    return res.json();
  }

  async function detectCountry() {
    try {
      const cached = window.localStorage.getItem(COUNTRY_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
      const res = await fetch(COUNTRY_API);
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      const country = {
        code: data.country_code || null,
        name: data.country_name || null
      };
      window.localStorage.setItem(COUNTRY_CACHE_KEY, JSON.stringify(country));
      return country;
    } catch {
      return null;
    }
  }

  async function findPlayer(username) {
    try {
      const key = normalizeKey(username);
      const rows = await get("players", {
        username_key: `eq.${key}`,
        select: "id,username,country_code,country_name",
        limit: 1
      });
      return rows[0] || null;
    } catch {
      return null;
    }
  }

  async function createPlayer(username, country) {
    try {
      const key = normalizeKey(username);
      const rows = await post("players", {
        username,
        username_key: key,
        country_code: country?.code || null,
        country_name: country?.name || null
      });
      return rows[0] || null;
    } catch {
      return null;
    }
  }

  async function ensurePlayer(username, country) {
    const existing = await findPlayer(username);
    if (existing) {
      return { player: existing, isNew: false };
    }
    const created = await createPlayer(username, country);
    return { player: created, isNew: true };
  }

  async function submitScore(playerId, playerName, scoreData, country) {
    try {
      const rows = await post("global_scores", {
        player_id: playerId,
        player_name: playerName,
        score: scoreData.score,
        difficulty_id: scoreData.difficultyId,
        coins_collected: scoreData.coinsCollected || 0,
        flight_level: scoreData.flightLevelReached || 1,
        duration_seconds: scoreData.timeSurvived || 0,
        country_code: country?.code || null,
        country_name: country?.name || null
      });
      return rows[0] || null;
    } catch {
      return null;
    }
  }

  async function submitDailyScore(playerId, playerName, scoreData, country) {
    try {
      const today = getDailyChallengeDate();
      const rows = await post("daily_scores", {
        player_id: playerId,
        player_name: playerName,
        challenge_date: today,
        score: scoreData.score,
        coins_collected: scoreData.coinsCollected || 0,
        country_code: country?.code || null
      });
      return rows[0] || null;
    } catch {
      return null;
    }
  }

  async function fetchGlobalLeaderboard(countryCode) {
    try {
      const params = {
        select: "player_name,score,difficulty_id,country_code,country_name,played_at",
        order: "score.desc,played_at.asc",
        limit: GLOBAL_LEADERBOARD_LIMIT
      };
      if (countryCode) {
        params["country_code"] = `eq.${countryCode}`;
      }
      return await get("global_scores", params);
    } catch {
      return [];
    }
  }

  async function fetchDailyLeaderboard() {
    try {
      const today = getDailyChallengeDate();
      return await get("daily_scores", {
        select: "player_name,score,country_code,played_at",
        challenge_date: `eq.${today}`,
        order: "score.desc,played_at.asc",
        limit: DAILY_LEADERBOARD_LIMIT
      });
    } catch {
      return [];
    }
  }

  function getDailyChallengeDate() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  return {
    isOnlineModeEnabled,
    setOnlineMode,
    detectCountry,
    findPlayer,
    ensurePlayer,
    submitScore,
    submitDailyScore,
    fetchGlobalLeaderboard,
    fetchDailyLeaderboard,
    getDailyChallengeDate
  };
})();
