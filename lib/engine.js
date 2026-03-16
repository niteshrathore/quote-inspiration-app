// ─── RECOMMENDATION ENGINE ────────────────────────────────────────────────────
// Weighted random selection based on user's like/dislike patterns.
// Likes boost language + category scores; dislikes suppress them.

import { QUOTES } from "./quotes";

export function createRecommendationEngine() {
  return {
    languageScores: { english: 1, hindi: 1, sanskrit: 1, urdu: 1 },
    categoryScores: {},
    seenIndices: { english: new Set(), hindi: new Set(), sanskrit: new Set(), urdu: new Set() },

    recordReaction(lang, category, reaction) {
      const key = `${lang}:${category}`;
      if (!this.categoryScores[key]) this.categoryScores[key] = 1;
      if (reaction === "liked") {
        this.languageScores[lang] = Math.min(this.languageScores[lang] + 0.4, 5);
        this.categoryScores[key] = Math.min(this.categoryScores[key] + 0.6, 5);
      } else if (reaction === "disliked") {
        this.languageScores[lang] = Math.max(this.languageScores[lang] - 0.3, 0.05);
        this.categoryScores[key] = Math.max(this.categoryScores[key] - 0.5, 0.01);
      }
    },

    getWeightedLanguage(selectedCategories) {
      const langs = Object.keys(this.languageScores);
      const weights = langs.map((l) => {
        let w = this.languageScores[l];
        if (selectedCategories.length > 0) {
          const langCats = [...new Set(QUOTES[l].map((q) => q.category))];
          const overlap = langCats.filter((c) => selectedCategories.includes(c));
          if (overlap.length === 0) w *= 0.05;
          else w *= 1 + overlap.length * 0.5;
        }
        return w;
      });
      const total = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      for (let i = 0; i < langs.length; i++) {
        r -= weights[i];
        if (r <= 0) return langs[i];
      }
      return langs[langs.length - 1];
    },

    getWeightedQuote(lang, selectedCategories) {
      const quotes = QUOTES[lang];
      let filtered = selectedCategories.length > 0
        ? quotes.filter((q) => selectedCategories.includes(q.category))
        : quotes;
      if (filtered.length === 0) filtered = quotes;

      if (this.seenIndices[lang].size >= filtered.length) {
        this.seenIndices[lang].clear();
      }

      const weights = filtered.map((q) => {
        const origIdx = quotes.indexOf(q);
        if (this.seenIndices[lang].has(origIdx)) return 0;
        const key = `${lang}:${q.category}`;
        return this.categoryScores[key] || 1;
      });
      const total = weights.reduce((a, b) => a + b, 0);
      if (total === 0) {
        this.seenIndices[lang].clear();
        return filtered[Math.floor(Math.random() * filtered.length)];
      }
      let r = Math.random() * total;
      for (let i = 0; i < filtered.length; i++) {
        r -= weights[i];
        if (r <= 0) {
          const origIdx = quotes.indexOf(filtered[i]);
          this.seenIndices[lang].add(origIdx);
          return filtered[i];
        }
      }
      return filtered[filtered.length - 1];
    },
  };
}
