window.TurboWingsDaily = (() => {
  const DAILY_PLAYED_KEY = "turbo-wings-daily-played";

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function dateToSeed(dateStr) {
    let hash = 5381;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) + hash + dateStr.charCodeAt(i)) | 0;
    }
    return hash >>> 0;
  }

  function getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  function getDailyRng() {
    const seed = dateToSeed(getTodayString());
    return mulberry32(seed);
  }

  function getTodayPlayedRecord() {
    try {
      const raw = window.localStorage.getItem(DAILY_PLAYED_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function hasPlayedToday() {
    const record = getTodayPlayedRecord();
    if (!record) {
      return false;
    }
    return record.date === getTodayString();
  }

  function recordDailyPlay(score, coinsCollected) {
    const existing = getTodayPlayedRecord();
    const today = getTodayString();
    const currentBest = existing?.date === today ? (existing.score || 0) : 0;
    window.localStorage.setItem(
      DAILY_PLAYED_KEY,
      JSON.stringify({
        date: today,
        score: Math.max(score, currentBest),
        coinsCollected
      })
    );
  }

  function getTodayBestScore() {
    const record = getTodayPlayedRecord();
    if (!record || record.date !== getTodayString()) {
      return null;
    }
    return record.score;
  }

  return {
    getDailyRng,
    getTodayString,
    hasPlayedToday,
    getTodayBestScore,
    recordDailyPlay
  };
})();
