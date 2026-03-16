"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { QUOTES, LANGUAGE_CONFIG, CATEGORY_COLORS } from "../lib/quotes";
import { createRecommendationEngine } from "../lib/engine";

// ─── THEMES ───────────────────────────────────────────────────────────────────
const THEMES = {
  aurora: {
    name: "Aurora",
    bg: (catColor) => `linear-gradient(135deg, #0f2027 0%, #203a43 40%, #2c5364 100%)`,
    card: "rgba(255,255,255,0.06)",
    text: "#f3f4f6",
    subtext: "rgba(255,255,255,0.5)",
    border: "rgba(255,255,255,0.1)",
    mode: "dark",
  },
  midnight: {
    name: "Midnight",
    bg: (catColor) => `linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0f0f2d 100%)`,
    card: "rgba(255,255,255,0.04)",
    text: "#e2e8f0",
    subtext: "rgba(255,255,255,0.4)",
    border: "rgba(255,255,255,0.08)",
    mode: "dark",
  },
  sunset: {
    name: "Sunset",
    bg: (catColor) => `linear-gradient(135deg, #1a0a2e 0%, #3d1a54 30%, #d4446a 70%, #f59e0b 100%)`,
    card: "rgba(255,255,255,0.08)",
    text: "#fff",
    subtext: "rgba(255,255,255,0.6)",
    border: "rgba(255,255,255,0.12)",
    mode: "dark",
  },
  parchment: {
    name: "Parchment",
    bg: () => `linear-gradient(135deg, #f5f0e8 0%, #e8dfd3 50%, #ddd3c1 100%)`,
    card: "rgba(120,80,40,0.06)",
    text: "#3d2b1f",
    subtext: "rgba(61,43,31,0.6)",
    border: "rgba(120,80,40,0.12)",
    mode: "light",
  },
  minimal: {
    name: "Minimal",
    bg: () => `linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)`,
    card: "rgba(0,0,0,0.03)",
    text: "#1a1a1a",
    subtext: "rgba(0,0,0,0.45)",
    border: "rgba(0,0,0,0.08)",
    mode: "light",
  },
  forest: {
    name: "Forest",
    bg: () => `linear-gradient(135deg, #0b1a0f 0%, #1a3a2a 40%, #2d5a3d 100%)`,
    card: "rgba(255,255,255,0.06)",
    text: "#d1fae5",
    subtext: "rgba(255,255,255,0.45)",
    border: "rgba(255,255,255,0.1)",
    mode: "dark",
  },
  ocean: {
    name: "Ocean",
    bg: () => `linear-gradient(135deg, #0a1628 0%, #0f3460 40%, #1a5276 100%)`,
    card: "rgba(255,255,255,0.06)",
    text: "#bfdbfe",
    subtext: "rgba(255,255,255,0.45)",
    border: "rgba(255,255,255,0.1)",
    mode: "dark",
  },
  rose: {
    name: "Rose",
    bg: () => `linear-gradient(135deg, #2a0a1a 0%, #4a1a2e 40%, #7a2a4e 100%)`,
    card: "rgba(255,255,255,0.06)",
    text: "#fce7f3",
    subtext: "rgba(255,255,255,0.45)",
    border: "rgba(255,255,255,0.1)",
    mode: "dark",
  },
  categoryThemed: {
    name: "Auto (by language)",
    bg: null, // uses LANGUAGE_CONFIG gradient
    card: "rgba(255,255,255,0.06)",
    text: "#f3f4f6",
    subtext: "rgba(255,255,255,0.5)",
    border: "rgba(255,255,255,0.1)",
    mode: "dark",
  },
};

// ─── INSTA STORY LAYOUTS ──────────────────────────────────────────────────────
const STORY_LAYOUTS = {
  classic: { name: "Classic", icon: "📜" },
  bold: { name: "Bold", icon: "💥" },
  minimal: { name: "Minimal", icon: "✦" },
  gradient: { name: "Gradient", icon: "🌈" },
  dark: { name: "Dark", icon: "🌙" },
  paper: { name: "Paper", icon: "📄" },
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function HeartIcon({ filled }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "#ef4444" : "none"} stroke={filled ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function ThumbsDownIcon({ filled }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "#6b7280" : "none"} stroke={filled ? "#6b7280" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  );
}
function RotateIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}
function PaletteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/>
      <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12" r="0.5" fill="currentColor"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  );
}

// ─── Share / Instagram Story Generator ────────────────────────────────────────
function SharePanel({ quote, language, onClose, theme }) {
  const canvasRef = useRef(null);
  const [selectedLayout, setSelectedLayout] = useState("classic");
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const isDark = theme.mode === "dark";

  const generateStoryImage = useCallback((layout) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    canvas.width = 1080;
    canvas.height = 1920;

    const config = LANGUAGE_CONFIG[language];
    const catColor = CATEGORY_COLORS[quote.category] || "#8b5cf6";
    const fontBase = language === "english" ? "Playfair Display, Georgia, serif" : "Noto Sans Devanagari, sans-serif";
    const text = quote.text;
    const author = quote.author;

    // Background
    if (layout === "classic" || layout === "gradient") {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (layout === "classic") {
        grad.addColorStop(0, "#0f2027"); grad.addColorStop(0.5, "#203a43"); grad.addColorStop(1, "#2c5364");
      } else {
        grad.addColorStop(0, "#1a1a2e"); grad.addColorStop(0.3, catColor + "cc"); grad.addColorStop(1, "#0f0f1a");
      }
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 1080, 1920);
    } else if (layout === "bold") {
      ctx.fillStyle = catColor; ctx.fillRect(0, 0, 1080, 1920);
      ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(0, 0, 1080, 1920);
    } else if (layout === "minimal") {
      ctx.fillStyle = "#fafafa"; ctx.fillRect(0, 0, 1080, 1920);
    } else if (layout === "dark") {
      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, 1080, 1920);
    } else if (layout === "paper") {
      ctx.fillStyle = "#f5f0e8"; ctx.fillRect(0, 0, 1080, 1920);
      ctx.strokeStyle = "rgba(0,0,0,0.05)";
      for (let i = 0; i < 1920; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1080, i); ctx.stroke(); }
    }

    const isLightBg = layout === "minimal" || layout === "paper";
    const textColor = isLightBg ? "#1a1a1a" : "#ffffff";
    const subColor = isLightBg ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.6)";

    // Quote mark
    ctx.font = `200px Georgia`; ctx.fillStyle = isLightBg ? catColor + "33" : "rgba(255,255,255,0.08)";
    ctx.fillText("❝", 60, layout === "bold" ? 650 : 700);

    // Word wrap text
    ctx.font = `${layout === "bold" ? "bold " : ""}${language === "english" ? 52 : 48}px ${fontBase}`;
    ctx.fillStyle = textColor;
    const maxW = 920;
    const words = text.split(" ");
    let lines = []; let line = "";
    for (const word of words) {
      const test = line + (line ? " " : "") + word;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; }
      else line = test;
    }
    if (line) lines.push(line);

    const lineH = language === "english" ? 72 : 68;
    const startY = Math.max(750, 960 - (lines.length * lineH) / 2);
    lines.forEach((l, i) => ctx.fillText(l, 80, startY + i * lineH));

    // Translation for Sanskrit
    if (quote.translation) {
      ctx.font = `italic 36px Noto Sans Devanagari, sans-serif`;
      ctx.fillStyle = subColor;
      const tWords = quote.translation.split(" ");
      let tLines = []; let tLine = "";
      for (const w of tWords) {
        const t = tLine + (tLine ? " " : "") + w;
        if (ctx.measureText(t).width > maxW && tLine) { tLines.push(tLine); tLine = w; }
        else tLine = t;
      }
      if (tLine) tLines.push(tLine);
      const tStartY = startY + lines.length * lineH + 40;
      tLines.forEach((l, i) => ctx.fillText(l, 80, tStartY + i * 52));
    }

    // Author
    ctx.font = `28px ${fontBase}`; ctx.fillStyle = subColor;
    ctx.fillText("— " + author, 80, startY + lines.length * lineH + (quote.translation ? 180 : 60));

    // Category pill
    const pillY = startY + lines.length * lineH + (quote.translation ? 240 : 120);
    ctx.fillStyle = catColor + "44";
    const catText = `${config.icon} ${quote.category}`;
    ctx.font = `bold 24px sans-serif`;
    const catW = ctx.measureText(catText).width + 40;
    roundRect(ctx, 80, pillY, catW, 44, 22); ctx.fill();
    ctx.fillStyle = isLightBg ? catColor : "#fff"; ctx.fillText(catText, 100, pillY + 30);

    // Watermark
    ctx.font = "22px sans-serif"; ctx.fillStyle = subColor;
    ctx.fillText("✦ Inspiration App", 80, 1860);

    return canvas.toDataURL("image/png");
  }, [quote, language]);

  useEffect(() => {
    const url = generateStoryImage(selectedLayout);
    setPreviewUrl(url);
  }, [selectedLayout, generateStoryImage]);

  const downloadImage = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `inspiration-${language}-${Date.now()}.png`;
    a.click();
  };

  const shareNative = async () => {
    if (!previewUrl || !navigator.share) { downloadImage(); return; }
    try {
      const blob = await (await fetch(previewUrl)).blob();
      const file = new File([blob], "quote.png", { type: "image/png" });
      await navigator.share({ files: [file], title: "Inspiration", text: quote.text });
    } catch { downloadImage(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}>
      <div className="w-full max-w-lg rounded-2xl p-5 max-h-[90vh] overflow-y-auto"
        style={{ background: isDark ? "rgba(20,20,30,0.95)" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` }}>
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ color: isDark ? "#fff" : "#1a1a1a" }} className="text-lg font-bold">Share Quote</h3>
          <button onClick={onClose} style={{ color: isDark ? "#fff" : "#1a1a1a" }} className="text-2xl bg-transparent border-none cursor-pointer p-1">✕</button>
        </div>

        {/* Layout selector */}
        <p style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} className="text-xs font-semibold uppercase tracking-wider mb-2">Choose Layout for Insta Story</p>
        <div className="flex gap-2 mb-4 flex-wrap">
          {Object.entries(STORY_LAYOUTS).map(([key, lay]) => (
            <button key={key} onClick={() => setSelectedLayout(key)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all"
              style={{
                background: selectedLayout === key ? (CATEGORY_COLORS[quote.category] || "#8b5cf6") : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"),
                color: selectedLayout === key ? "#fff" : (isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"),
                border: `1px solid ${selectedLayout === key ? "transparent" : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")}`,
              }}>
              {lay.icon} {lay.name}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="rounded-xl overflow-hidden mb-4" style={{ background: "#000", aspectRatio: "9/16", maxHeight: "420px" }}>
          {previewUrl && <img src={previewUrl} alt="Story preview" className="w-full h-full object-contain" />}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button onClick={downloadImage}
            className="flex-1 py-3 rounded-xl font-semibold text-sm cursor-pointer"
            style={{ background: CATEGORY_COLORS[quote.category] || "#8b5cf6", color: "#fff", border: "none" }}>
            ⬇️ Download
          </button>
          <button onClick={shareNative}
            className="flex-1 py-3 rounded-xl font-semibold text-sm cursor-pointer"
            style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", color: isDark ? "#fff" : "#1a1a1a", border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}` }}>
            📤 Share
          </button>
        </div>

        {/* Copy text */}
        <button onClick={() => { navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}`); }}
          className="w-full mt-2 py-2.5 rounded-xl text-xs cursor-pointer"
          style={{ background: "transparent", color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}` }}>
          📋 Copy Text
        </button>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}

// ─── Helper: roundRect ────────────────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Theme Picker ─────────────────────────────────────────────────────────────
function ThemePicker({ currentTheme, onSelect, onClose }) {
  const isDark = THEMES[currentTheme]?.mode === "dark";
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 pb-8"
        style={{ background: isDark ? "rgba(20,20,30,0.97)" : "#fff" }}
        onClick={(e) => e.stopPropagation()}>
        <h3 style={{ color: isDark ? "#fff" : "#1a1a1a" }} className="text-lg font-bold mb-4">Choose Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(THEMES).map(([key, t]) => (
            <button key={key} onClick={() => { onSelect(key); onClose(); }}
              className="rounded-xl p-3 cursor-pointer transition-all text-center"
              style={{
                background: key === "categoryThemed" ? "linear-gradient(135deg, #2c5364, #e94560, #6b2fa0)"
                  : key === "parchment" || key === "minimal" ? "#f5f0e8"
                  : (t.bg ? t.bg("") : "").replace("linear-gradient", "linear-gradient"),
                border: currentTheme === key ? "2px solid #f59e0b" : `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                minHeight: "70px",
              }}>
              <span className="text-xs font-semibold"
                style={{ color: t.mode === "light" ? "#3d2b1f" : "#fff" }}>
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── History Panel (Improved with tabs) ───────────────────────────────────────
function HistoryPanel({ history, onClose, theme }) {
  const [tab, setTab] = useState("all");
  const isDark = theme.mode === "dark";

  const filtered = useMemo(() => {
    if (tab === "all") return history;
    return history.filter((h) => h.reaction === tab);
  }, [history, tab]);

  const counts = useMemo(() => ({
    all: history.length,
    liked: history.filter((h) => h.reaction === "liked").length,
    disliked: history.filter((h) => h.reaction === "disliked").length,
    neutral: history.filter((h) => h.reaction === "neutral").length,
  }), [history]);

  const tabs = [
    { key: "all", label: "All", icon: "📜" },
    { key: "liked", label: "Liked", icon: "❤️" },
    { key: "disliked", label: "Disliked", icon: "👎" },
    { key: "neutral", label: "Skipped", icon: "⏭️" },
  ];

  return (
    <div className="fixed top-0 right-0 bottom-0 w-[400px] max-w-full z-50 slide-in overflow-y-auto safe-top safe-bottom"
      style={{ background: isDark ? "rgba(10,10,20,0.97)" : "rgba(255,255,255,0.97)", backdropFilter: "blur(24px)", boxShadow: "-4px 0 40px rgba(0,0,0,0.4)" }}>
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ color: isDark ? "#fff" : "#1a1a1a" }} className="text-lg font-bold">Quote History</h3>
          <button onClick={onClose} style={{ color: isDark ? "#fff" : "#1a1a1a" }} className="text-2xl bg-transparent border-none cursor-pointer p-2">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-4 p-1 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex-1 py-2 rounded-lg text-[11px] font-semibold cursor-pointer transition-all"
              style={{
                background: tab === t.key ? (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)") : "transparent",
                color: tab === t.key ? (isDark ? "#fff" : "#1a1a1a") : (isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"),
                border: "none",
              }}>
              {t.icon} {counts[t.key]}
            </button>
          ))}
        </div>

        {/* Quote list */}
        {filtered.length === 0 && (
          <p style={{ color: isDark ? "#6b7280" : "#9ca3af" }} className="text-center text-sm mt-8">
            No quotes in this category yet.
          </p>
        )}
        {[...filtered].reverse().map((item, i) => (
          <div key={i} className="rounded-xl p-3.5 mb-2"
            style={{
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
              borderLeft: `3px solid ${item.reaction === "liked" ? "#ef4444" : item.reaction === "disliked" ? "#6b7280" : "#374151"}`,
            }}>
            <p style={{ color: isDark ? "#e5e7eb" : "#374151" }} className="text-[13px] mb-1.5 leading-relaxed">
              &ldquo;{item.quote.text.length > 140 ? item.quote.text.substring(0, 140) + "..." : item.quote.text}&rdquo;
            </p>
            <div className="flex justify-between items-center">
              <span className="text-[11px]" style={{ color: isDark ? "#6b7280" : "#9ca3af" }}>
                {LANGUAGE_CONFIG[item.language].icon} {item.quote.author}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: item.reaction === "liked" ? "rgba(239,68,68,0.12)" : item.reaction === "disliked" ? "rgba(107,114,128,0.12)" : "rgba(75,85,99,0.1)",
                  color: item.reaction === "liked" ? "#fca5a5" : isDark ? "#9ca3af" : "#6b7280",
                }}>
                {item.reaction === "liked" ? "❤️" : item.reaction === "disliked" ? "👎" : "—"} {item.quote.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Word Map ─────────────────────────────────────────────────────────────────
function WordMap({ selectedCategories, onToggle, theme }) {
  const isDark = theme.mode === "dark";
  const grouped = useMemo(() => {
    const groups = {};
    Object.entries(QUOTES).forEach(([lang, quotes]) => {
      groups[lang] = [...new Set(quotes.map((q) => q.category))];
    });
    return groups;
  }, []);

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([lang, cats]) => (
        <div key={lang}>
          <p className="text-xs mb-2 font-semibold uppercase tracking-wider"
            style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>
            {LANGUAGE_CONFIG[lang].icon} {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </p>
          <div className="flex flex-wrap gap-2">
            {cats.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              const color = CATEGORY_COLORS[cat] || "#6b7280";
              return (
                <button key={`${lang}-${cat}`} onClick={() => onToggle(cat)} className="cat-pill"
                  style={{
                    padding: "5px 14px", borderRadius: "20px", border: `2px solid ${color}`,
                    background: isSelected ? color : "transparent",
                    color: isSelected ? "#fff" : color,
                    cursor: "pointer", fontSize: "12px", fontWeight: 600,
                    opacity: isSelected ? 1 : 0.65,
                  }}>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Preference Bars ──────────────────────────────────────────────────────────
function PreferenceBars({ engine, theme }) {
  const isDark = theme.mode === "dark";
  const langs = Object.entries(engine.languageScores);
  const maxScore = Math.max(...langs.map(([, s]) => s));
  return (
    <div className="flex gap-1.5 items-end justify-center h-8">
      {langs.map(([lang, score]) => (
        <div key={lang} className="flex flex-col items-center gap-0.5">
          <div className="rounded-full transition-all duration-500"
            style={{
              width: "28px", height: `${Math.max(4, (score / Math.max(maxScore, 1)) * 24)}px`,
              background: score === maxScore ? "linear-gradient(to top, #f59e0b, #fbbf24)" : (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"),
            }} />
          <span className="text-[9px]" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }}>
            {LANGUAGE_CONFIG[lang].icon}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function QuoteApp() {
  const engineRef = useRef(null);
  if (!engineRef.current) engineRef.current = createRecommendationEngine();
  const engine = engineRef.current;

  const [currentQuote, setCurrentQuote] = useState(null);
  const [currentLang, setCurrentLang] = useState("english");
  const [reaction, setReaction] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [themeName, setThemeName] = useState("categoryThemed");
  const [animState, setAnimState] = useState("enter");
  const [isSpinning, setIsSpinning] = useState(false);
  const [notionMsg, setNotionMsg] = useState(null);
  const [, forceUpdate] = useState(0);
  const quoteNum = useRef(0);

  const theme = THEMES[themeName] || THEMES.aurora;
  const isDark = theme.mode === "dark";

  const bgStyle = useMemo(() => {
    if (themeName === "categoryThemed" && currentLang) {
      return LANGUAGE_CONFIG[currentLang].gradient;
    }
    const catColor = currentQuote ? (CATEGORY_COLORS[currentQuote.category] || "#8b5cf6") : "#8b5cf6";
    return theme.bg ? theme.bg(catColor) : LANGUAGE_CONFIG[currentLang || "english"].gradient;
  }, [themeName, currentLang, theme, currentQuote]);

  // Save to Notion
  const saveToNotion = useCallback(async (quoteData) => {
    try {
      const res = await fetch("/api/notion", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quoteData),
      });
      const data = await res.json();
      if (data.success) setNotionMsg("Saved to Notion ✓");
    } catch { /* silently fail */ }
    setTimeout(() => setNotionMsg(null), 2500);
  }, []);

  // Get next quote
  const getNextQuote = useCallback(() => {
    if (currentQuote) {
      const r = reaction || "neutral";
      const entry = { quote: currentQuote, language: currentLang, reaction: r, timestamp: new Date().toISOString() };
      setHistory((h) => [...h, entry]);
      if (reaction) engine.recordReaction(currentLang, currentQuote.category, reaction);
      saveToNotion({
        quote: currentQuote.text, author: currentQuote.author, language: currentLang,
        category: currentQuote.category, reaction: r, translation: currentQuote.translation || "",
      });
    }
    setAnimState("exit");
    setIsSpinning(true);
    setTimeout(() => {
      const lang = engine.getWeightedLanguage(selectedCategories);
      const quote = engine.getWeightedQuote(lang, selectedCategories);
      setCurrentLang(lang); setCurrentQuote(quote); setReaction(null);
      quoteNum.current += 1;
      setAnimState("enter"); setIsSpinning(false); forceUpdate((n) => n + 1);
    }, 350);
  }, [currentQuote, currentLang, reaction, engine, selectedCategories, saveToNotion]);

  useEffect(() => {
    const lang = engine.getWeightedLanguage([]);
    const quote = engine.getWeightedQuote(lang, []);
    setCurrentLang(lang); setCurrentQuote(quote); quoteNum.current = 1;
  }, [engine]);

  const toggleCategory = (cat) => setSelectedCategories((p) => p.includes(cat) ? p.filter((c) => c !== cat) : [...p, cat]);
  const handleLike = () => setReaction((r) => (r === "liked" ? null : "liked"));
  const handleDislike = () => setReaction((r) => (r === "disliked" ? null : "disliked"));

  if (!currentQuote) return null;

  const config = LANGUAGE_CONFIG[currentLang];
  const catColor = CATEGORY_COLORS[currentQuote.category] || "#6b7280";
  const likeCount = history.filter((h) => h.reaction === "liked").length;
  const dislikeCount = history.filter((h) => h.reaction === "disliked").length;

  return (
    <div className="min-h-screen bg-transition flex flex-col items-center relative overflow-hidden"
      style={{ background: bgStyle }}>

      {/* Ambient blobs */}
      <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full pointer-events-none transition-all duration-1000"
        style={{ background: `radial-gradient(circle, ${catColor}22 0%, transparent 70%)` }} />

      {/* Header */}
      <div className="w-full max-w-3xl px-5 pt-5 pb-2 flex justify-between items-center">
        <div>
          <h1 style={{ color: isDark ? "#fff" : "#1a1a1a" }} className="text-xl sm:text-2xl font-bold tracking-tight">✦ Inspiration</h1>
          <p style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }} className="text-[11px] mt-0.5">
            #{quoteNum.current} of 1000 · {likeCount} ❤️ · {dislikeCount} 👎
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowThemes(true)}
            className="rounded-xl px-3 py-2 text-xs cursor-pointer transition-colors flex items-center gap-1.5"
            style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", color: isDark ? "#fff" : "#1a1a1a", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` }}>
            <PaletteIcon /> Theme
          </button>
          <button onClick={() => setShowHistory(!showHistory)}
            className="rounded-xl px-3 py-2 text-xs cursor-pointer transition-colors"
            style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", color: isDark ? "#fff" : "#1a1a1a", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` }}>
            📜 {history.length}
          </button>
        </div>
      </div>

      {/* Preference indicator */}
      <div className="max-w-3xl w-full px-5 py-1">
        <PreferenceBars engine={engine} theme={theme} />
      </div>

      {/* Language badge */}
      <div className="mt-4 px-4 py-1.5 rounded-full"
        style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}` }}>
        <span style={{ color: isDark ? "#fff" : "#1a1a1a" }} className="text-sm font-semibold">
          {config.icon} {config.label}
        </span>
      </div>

      {/* Category badge */}
      <div className="mt-2.5 px-3.5 py-1 rounded-full" style={{ background: `${catColor}33`, border: `1px solid ${catColor}66` }}>
        <span style={{ color: catColor }} className="text-[11px] font-bold uppercase tracking-wider">{currentQuote.category}</span>
      </div>

      {/* Quote Card */}
      <div className={`max-w-[720px] w-[calc(100%-40px)] mx-5 mt-6 rounded-3xl p-7 sm:p-10 shadow-2xl ${animState === "enter" ? "quote-enter" : "quote-exit"}`}
        style={{ background: theme.card, backdropFilter: "blur(20px)", border: `1px solid ${theme.border}` }}>
        <div className="text-5xl sm:text-6xl leading-none mb-[-8px]" style={{ color: `${catColor}44`, fontFamily: "Georgia, serif" }}>❝</div>
        <p style={{ color: theme.text, fontFamily: currentLang === "english" ? "'Playfair Display', Georgia, serif" : "'Noto Sans Devanagari', sans-serif" }}
          className="text-lg sm:text-xl leading-relaxed mb-5">
          {currentQuote.text}
        </p>
        {currentQuote.translation && (
          <div className="rounded-xl p-3.5 sm:p-4 mb-4" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", borderLeft: `3px solid ${catColor}88` }}>
            <p style={{ color: isDark ? "#d1d5db" : "#4b5563", fontFamily: "'Noto Sans Devanagari', sans-serif" }} className="text-sm leading-relaxed italic">
              अनुवाद: {currentQuote.translation}
            </p>
          </div>
        )}
        <p style={{ color: theme.subtext }} className="text-sm text-right">— {currentQuote.author}</p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4 sm:gap-5 mt-7">
        <button onClick={handleDislike}
          className="w-[50px] h-[50px] sm:w-14 sm:h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-90"
          style={{ background: reaction === "disliked" ? "rgba(107,114,128,0.3)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"), border: `2px solid ${reaction === "disliked" ? "#6b7280" : (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)")}`, color: isDark ? "#fff" : "#1a1a1a" }}>
          <ThumbsDownIcon filled={reaction === "disliked"} />
        </button>

        <button onClick={() => setShowShare(true)}
          className="w-[44px] h-[44px] rounded-full flex items-center justify-center cursor-pointer transition-all"
          style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`, color: isDark ? "#fff" : "#1a1a1a" }}>
          <ShareIcon />
        </button>

        <button onClick={getNextQuote}
          className={`w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-full flex items-center justify-center cursor-pointer border-none text-white transition-all duration-300 active:scale-90 ${isSpinning ? "rotate-spin" : ""}`}
          style={{ background: `linear-gradient(135deg, ${catColor}cc, ${catColor}88)`, boxShadow: `0 8px 30px ${catColor}44` }}>
          <RotateIcon />
        </button>

        <button onClick={() => { navigator.clipboard.writeText(`"${currentQuote.text}" — ${currentQuote.author}`); setNotionMsg("Copied! 📋"); setTimeout(() => setNotionMsg(null), 1500); }}
          className="w-[44px] h-[44px] rounded-full flex items-center justify-center cursor-pointer transition-all text-sm"
          style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`, color: isDark ? "#fff" : "#1a1a1a" }}>
          📋
        </button>

        <button onClick={handleLike}
          className="w-[50px] h-[50px] sm:w-14 sm:h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-90"
          style={{ background: reaction === "liked" ? "rgba(239,68,68,0.2)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"), border: `2px solid ${reaction === "liked" ? "#ef4444" : (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)")}`, color: isDark ? "#fff" : "#1a1a1a" }}>
          <HeartIcon filled={reaction === "liked"} />
        </button>
      </div>

      {/* Toast */}
      {notionMsg && (
        <div className="mt-3 px-4 py-2 rounded-xl text-xs font-medium"
          style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#6ee7b7" }}>
          {notionMsg}
        </div>
      )}

      {/* Word Map */}
      <div className="max-w-[720px] w-[calc(100%-40px)] mx-5 mt-8 rounded-2xl p-5 sm:p-6"
        style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}` }}>
        <div className="flex justify-between items-center mb-3">
          <h3 style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)" }} className="text-xs font-semibold uppercase tracking-widest">
            🏷️ Filter by Categories
          </h3>
          {selectedCategories.length > 0 && (
            <button onClick={() => setSelectedCategories([])} className="bg-transparent border-none text-amber-400 text-[11px] cursor-pointer">Clear all</button>
          )}
        </div>
        <WordMap selectedCategories={selectedCategories} onToggle={toggleCategory} theme={theme} />
      </div>

      {/* Footer */}
      <div className="max-w-[720px] w-[calc(100%-40px)] mx-5 mt-5 mb-10 p-4 rounded-xl"
        style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}` }}>
        <p style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }} className="text-[11px] text-center leading-relaxed">
          🤖 1,000 curated quotes · AI learns your preferences · Like to see more, dislike to see fewer · Auto-saved to Notion
        </p>
      </div>

      {/* Panels */}
      {showHistory && <HistoryPanel history={history} onClose={() => setShowHistory(false)} theme={theme} />}
      {showShare && <SharePanel quote={currentQuote} language={currentLang} onClose={() => setShowShare(false)} theme={theme} />}
      {showThemes && <ThemePicker currentTheme={themeName} onSelect={setThemeName} onClose={() => setShowThemes(false)} />}
    </div>
  );
}
