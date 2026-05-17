window.TurboWingsScoreCard = (() => {
  const CARD_WIDTH = 640;
  const CARD_HEIGHT = 360;
  const GAME_URL = "https://insight-x-lab-technologies.github.io/TurboWings/";

  function formatDate(ts) {
    const d = new Date(ts || Date.now());
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  }

  function drawCard(ctx, data) {
    const { playerName, score, difficultyLabel, flightLevel, timestamp, isDaily } = data;
    const W = CARD_WIDTH;
    const H = CARD_HEIGHT;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0d1837");
    bg.addColorStop(1, "#060c18");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Accent glow top-right
    const glow = ctx.createRadialGradient(W * 0.85, H * 0.1, 0, W * 0.85, H * 0.1, W * 0.4);
    glow.addColorStop(0, "rgba(255, 155, 96, 0.24)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Border
    ctx.strokeStyle = "rgba(255, 155, 96, 0.35)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    // Top bar
    ctx.fillStyle = "rgba(255, 155, 96, 0.12)";
    ctx.fillRect(0, 0, W, 56);

    // Logo text
    ctx.font = "bold 22px 'Trebuchet MS', sans-serif";
    ctx.fillStyle = "#ff9b60";
    ctx.textAlign = "left";
    ctx.fillText("TURBO WINGS", 28, 36);

    // Daily badge
    if (isDaily) {
      ctx.font = "bold 11px 'Trebuchet MS', sans-serif";
      ctx.fillStyle = "#0d1837";
      const badgeW = 100;
      const badgeH = 22;
      const bx = W - 28 - badgeW;
      const by = 17;
      ctx.fillStyle = "#ff9b60";
      ctx.beginPath();
      ctx.roundRect(bx, by, badgeW, badgeH, 4);
      ctx.fill();
      ctx.fillStyle = "#0d1837";
      ctx.textAlign = "center";
      ctx.fillText("DAILY CHALLENGE", bx + badgeW / 2, by + 15);
    }

    // Score section
    ctx.textAlign = "center";
    ctx.font = "bold 96px 'Trebuchet MS', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(255, 155, 96, 0.5)";
    ctx.shadowBlur = 32;
    ctx.fillText(String(score), W / 2, 200);
    ctx.shadowBlur = 0;

    ctx.font = "15px 'Trebuchet MS', sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText("SCORE", W / 2, 225);

    // Divider
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(28, 248);
    ctx.lineTo(W - 28, 248);
    ctx.stroke();

    // Stats row
    const stats = [
      { label: "PILOT", value: playerName || "Player 1" },
      { label: "DIFFICULTY", value: difficultyLabel || "Normal" },
      { label: "FL REACHED", value: `FL ${flightLevel || 1}` }
    ];

    const colW = (W - 56) / stats.length;
    stats.forEach((stat, i) => {
      const cx = 28 + colW * i + colW / 2;
      ctx.font = "bold 15px 'Trebuchet MS', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(stat.value.toUpperCase().slice(0, 16), cx, 282);
      ctx.font = "11px 'Trebuchet MS', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillText(stat.label, cx, 300);
    });

    // Footer
    ctx.font = "11px 'Trebuchet MS', sans-serif";
    ctx.fillStyle = "rgba(255, 155, 96, 0.6)";
    ctx.textAlign = "center";
    ctx.fillText(GAME_URL, W / 2, H - 16);

    // Date (right)
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillText(formatDate(timestamp), W - 28, H - 16);
  }

  function generate(data) {
    const canvas = document.createElement("canvas");
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const ctx = canvas.getContext("2d");
    drawCard(ctx, data);
    return canvas;
  }

  async function share(data, shareText) {
    const canvas = generate(data);
    const dataUrl = canvas.toDataURL("image/png");

    if (navigator.share && navigator.canShare) {
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], "turbowings-score.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Turbo Wings",
            text: shareText || `I scored ${data.score} in Turbo Wings! ${GAME_URL}`,
            files: [file]
          });
          return { method: "share" };
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          // Fall through to download
        } else {
          return { method: "aborted" };
        }
      }
    }

    // Fallback: download
    const link = document.createElement("a");
    link.download = "turbowings-score.png";
    link.href = dataUrl;
    link.click();
    return { method: "download" };
  }

  return { generate, share };
})();
