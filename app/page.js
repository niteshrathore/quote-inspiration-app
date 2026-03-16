"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { QUOTES, LANGUAGE_CONFIG, CATEGORY_COLORS } from "../lib/quotes";
import { createRecommendationEngine } from "../lib/engine";

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

// ─── Word Map Component ───────────────────────────────────────────────────────
function WordMap({ allCategories, selectedCategories, onToggle, languageForCats }) {
  // Group categories by language
  const grouped = useMemo(() => {
    const groups = {};
    Object.entries(QUOTES).forEach(([lang, quotes]) => {
      const cats = [...new Set(quotes.map((q) => q.category))];
      groups[lang] = cats;
    });
    return groups;
  }, []);

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([lang, cats]) => (
        <div key={lang}>
          <p className="text-xs text-white/40 mb-2 font-semibold uppercase tracking-wider">
            {LANGUAGE_CONFIG[lang].icon} {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </p>
          <div className="flex flex-wrap gap-2">
            {cats.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              const color = CATEGORY_COLORS[cat] || "#6b7280";
              return (
                <button
                  key={`${lang}-${cat}`}
                  onClick={() => onToggle(cat)}
                  className="cat-pill"
                  style={{
                    padding: "5px 14px",
                    borderRadius: "20px",
                    border: `2px solid ${color}`,
                    background: isSelected ? color : "transparent",
                    color: isSelected ? "#fff" : color,
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 600,
                    opacity: isSelected ? 1 : 0.65,
                  }}
                >
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

// ─── History Panel ────────────────────────────────────────────────────────────
function HistoryPanel({ history, onClose }) {
  return (
    <div className="fixed top-0 right-0 bottom-0 w-[380px] max-w-full z-50 slide-in overflow-y-auto p-5 safe-top safe-bottom"
      style={{ background: "rgba(10,10,20,0.97)", backdropFilter: "blur(24px)", boxShadow: "-4px 0 40px rgba(0,0,0,0.6)" }}>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-white text-lg font-bold">History ({history.length})</h3>
        <button onClick={onClose} className="text-white text-2xl bg-transparent border-none cursor-pointer p-2">✕</button>
      </div>
      {history.length === 0 && <p className="text-gray-500 text-center text-sm">No quotes yet. Start rotating!</p>}
      {[...history].reverse().map((item, i) => (
        <div key={i} className="glass rounded-xl p-3.5 mb-2.5"
          style={{ borderLeft: `3px solid ${item.reaction === "liked" ? "#ef4444" : item.reaction === "disliked" ? "#6b7280" : "#374151"}` }}>
          <p className="text-gray-200 text-[13px] mb-1.5 leading-relaxed">
            &ldquo;{item.quote.text.length > 120 ? item.quote.text.substring(0, 120) + "..." : item.quote.text}&rdquo;
          </p>
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-gray-500">{LANGUAGE_CONFIG[item.language].icon} {item.quote.author}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: item.reaction === "liked" ? "rgba(239,68,68,0.15)" : item.reaction === "disliked" ? "rgba(107,114,128,0.15)" : "rgba(75,85,99,0.15)",
                color: item.reaction === "liked" ? "#fca5a5" : "#9ca3af",
              }}>
              {item.reaction === "liked" ? "❤️" : item.reaction === "disliked" ? "👎" : "—"} {item.quote.category}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Preference Bars ──────────────────────────────────────────────────────────
function PreferenceBars({ engine }) {
  const langs = Object.entries(engine.languageScores);
  const maxScore = Math.max(...langs.map(([, s]) => s));
  return (
    <div className="flex gap-1.5 items-end justify-center h-8">
      {langs.map(([lang, score]) => (
        <div key={lang} className="flex flex-col items-center gap-0.5">
          <div
            className="rounded-full transition-all duration-500"
            style={{
              width: "28px",
              height: `${Math.max(4, (score / Math.max(maxScore, 1)) * 24)}px`,
              background: score === maxScore
                ? "linear-gradient(to top, #f59e0b, #fbbf24)"
                : "rgba(255,255,255,0.15)",
            }}
          />
          <span className="text-[9px] text-white/40">{LANGUAGE_CONFIG[lang].icon}</span>
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
  const [animState, setAnimState] = useState("enter"); // "enter" | "exit"
  const [isSpinning, setIsSpinning] = useState(false);
  const [notionMsg, setNotionMsg] = useState(null);
  const [, forceUpdate] = useState(0);
  const quoteNum = useRef(0);

  const allCategories = useMemo(() => {
    const cats = new Set();
    Object.values(QUOTES).forEach((arr) => arr.forEach((q) => cats.add(q.category)));
    return [...cats].sort();
  }, []);

  // Save to Notion
  const saveToNotion = useCallback(async (quoteData) => {
    try {
      const res = await fetch("/api/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quoteData),
      });
      const data = await res.json();
      if (data.success) {
        setNotionMsg("Saved to Notion ✓");
      } else {
        setNotionMsg("Notion: " + (data.error || "error"));
      }
    } catch {
      // Silently fail if Notion not configured — still works locally
      setNotionMsg(null);
    }
    setTimeout(() => setNotionMsg(null), 2500);
  }, []);

  // Get next quote
  const getNextQuote = useCallback(() => {
    // Save current quote
    if (currentQuote) {
      const r = reaction || "neutral";
      const entry = { quote: currentQuote, language: currentLang, reaction: r, timestamp: new Date().toISOString() };
      setHistory((h) => [...h, entry]);
      if (reaction) engine.recordReaction(currentLang, currentQuote.category, reaction);

      // Auto-save to Notion
      saveToNotion({
        quote: currentQuote.text,
        author: currentQuote.author,
        language: currentLang,
        category: currentQuote.category,
        reaction: r,
        translation: currentQuote.translation || "",
      });
    }

    // Animate out then in
    setAnimState("exit");
    setIsSpinning(true);

    setTimeout(() => {
      const lang = engine.getWeightedLanguage(selectedCategories);
      const quote = engine.getWeightedQuote(lang, selectedCategories);
      setCurrentLang(lang);
      setCurrentQuote(quote);
      setReaction(null);
      quoteNum.current += 1;
      setAnimState("enter");
      setIsSpinning(false);
      forceUpdate((n) => n + 1); // force re-render for engine scores
    }, 350);
  }, [currentQuote, currentLang, reaction, engine, selectedCategories, saveToNotion]);

  // Initialize first quote
  useEffect(() => {
    const lang = engine.getWeightedLanguage([]);
    const quote = engine.getWeightedQuote(lang, []);
    setCurrentLang(lang);
    setCurrentQuote(quote);
    quoteNum.current = 1;
  }, [engine]);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleLike = () => setReaction((r) => (r === "liked" ? null : "liked"));
  const handleDislike = () => setReaction((r) => (r === "disliked" ? null : "disliked"));

  if (!currentQuote) return null;

  const config = LANGUAGE_CONFIG[currentLang];
  const catColor = CATEGORY_COLORS[currentQuote.category] || "#6b7280";
  const likeCount = history.filter((h) => h.reaction === "liked").length;
  const dislikeCount = history.filter((h) => h.reaction === "disliked").length;

  return (
    <div className="min-h-screen bg-transition flex flex-col items-center relative overflow-hidden"
      style={{ background: config.gradient }}>

      {/* Ambient blobs */}
      <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full pointer-events-none transition-all duration-1000"
        style={{ background: `radial-gradient(circle, ${catColor}22 0%, transparent 70%)` }} />
      <div className="absolute -bottom-[15%] -left-[10%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)" }} />

      {/* Header */}
      <div className="w-full max-w-3xl px-5 pt-5 pb-2 flex justify-between items-center">
        <div>
          <h1 className="text-white text-xl sm:text-2xl font-bold tracking-tight">✦ Inspiration</h1>
          <p className="text-white/40 text-[11px] mt-0.5">
            #{quoteNum.current} · {likeCount} ❤️ · {dislikeCount} 👎
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="glass rounded-xl px-3.5 py-2 text-white text-xs cursor-pointer hover:bg-white/10 transition-colors"
        >
          📜 History ({history.length})
        </button>
      </div>

      {/* Preference indicator */}
      <div className="max-w-3xl w-full px-5 py-1">
        <PreferenceBars engine={engine} />
      </div>

      {/* Language badge */}
      <div className="mt-4 px-4 py-1.5 rounded-full glass">
        <span className="text-white text-sm font-semibold">{config.icon} {config.label}</span>
      </div>

      {/* Category badge */}
      <div className="mt-2.5 px-3.5 py-1 rounded-full" style={{ background: `${catColor}33`, border: `1px solid ${catColor}66` }}>
        <span style={{ color: catColor }} className="text-[11px] font-bold uppercase tracking-wider">
          {currentQuote.category}
        </span>
      </div>

      {/* Quote Card */}
      <div className={`max-w-[720px] w-[calc(100%-40px)] mx-5 mt-6 glass rounded-3xl p-7 sm:p-10 shadow-2xl ${animState === "enter" ? "quote-enter" : "quote-exit"}`}>
        {/* Quote mark */}
        <div className="text-5xl sm:text-6xl leading-none mb-[-8px]" style={{ color: `${catColor}44`, fontFamily: "Georgia, serif" }}>❝</div>

        {/* Quote text */}
        <p className="text-gray-100 text-lg sm:text-xl leading-relaxed mb-5"
          style={{ fontFamily: currentLang === "english" ? "'Playfair Display', Georgia, serif" : "'Noto Sans Devanagari', sans-serif" }}>
          {currentQuote.text}
        </p>

        {/* Sanskrit translation */}
        {currentQuote.translation && (
          <div className="rounded-xl p-3.5 sm:p-4 mb-4" style={{ background: "rgba(255,255,255,0.05)", borderLeft: `3px solid ${catColor}88` }}>
            <p className="text-gray-300 text-sm leading-relaxed italic" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
              अनुवाद: {currentQuote.translation}
            </p>
          </div>
        )}

        {/* Author */}
        <p className="text-white/40 text-sm text-right">— {currentQuote.author}</p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-5 sm:gap-6 mt-7">
        {/* Dislike */}
        <button onClick={handleDislike}
          className="w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-90"
          style={{
            background: reaction === "disliked" ? "rgba(107,114,128,0.3)" : "rgba(255,255,255,0.08)",
            border: `2px solid ${reaction === "disliked" ? "#6b7280" : "rgba(255,255,255,0.15)"}`,
            color: "#fff",
          }}>
          <ThumbsDownIcon filled={reaction === "disliked"} />
        </button>

        {/* Rotate */}
        <button onClick={getNextQuote}
          className={`w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-full flex items-center justify-center cursor-pointer border-none text-white transition-all duration-300 active:scale-90 ${isSpinning ? "rotate-spin" : ""}`}
          style={{
            background: `linear-gradient(135deg, ${catColor}cc, ${catColor}88)`,
            boxShadow: `0 8px 30px ${catColor}44`,
          }}>
          <RotateIcon />
        </button>

        {/* Like */}
        <button onClick={handleLike}
          className="w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-90"
          style={{
            background: reaction === "liked" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.08)",
            border: `2px solid ${reaction === "liked" ? "#ef4444" : "rgba(255,255,255,0.15)"}`,
            color: "#fff",
          }}>
          <HeartIcon filled={reaction === "liked"} />
        </button>
      </div>

      {/* Notion status toast */}
      {notionMsg && (
        <div className="mt-3 px-4 py-2 rounded-xl text-xs font-medium pulse-glow"
          style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#6ee7b7" }}>
          {notionMsg}
        </div>
      )}

      {/* Word Map / Category Filter */}
      <div className="max-w-[720px] w-[calc(100%-40px)] mx-5 mt-8 glass rounded-2xl p-5 sm:p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-widest">🏷️ Filter by Categories</h3>
          {selectedCategories.length > 0 && (
            <button onClick={() => setSelectedCategories([])} className="bg-transparent border-none text-amber-400 text-[11px] cursor-pointer">
              Clear all
            </button>
          )}
        </div>
        <WordMap allCategories={allCategories} selectedCategories={selectedCategories} onToggle={toggleCategory} />
        {selectedCategories.length > 0 && (
          <p className="text-white/30 text-[11px] text-center mt-3">
            Active filters: {selectedCategories.join(", ")}
          </p>
        )}
      </div>

      {/* Footer tip */}
      <div className="max-w-[720px] w-[calc(100%-40px)] mx-5 mt-5 mb-10 p-4 rounded-xl"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-white/30 text-[11px] text-center leading-relaxed">
          🤖 AI learns from your preferences. Like quotes to see more of that type. Dislike to see fewer.
          Every quote is automatically saved to your Notion database.
        </p>
      </div>

      {/* History panel */}
      {showHistory && <HistoryPanel history={history} onClose={() => setShowHistory(false)} />}
    </div>
  );
}
