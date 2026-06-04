/**
 * ConfidenceBuilder
 *
 * Computes:
 *  - confidence score (0–100) based on data quality signals
 *  - price range band (low / high) around the base price
 *  - human-readable confidence label
 *
 * Signals that raise confidence:
 *   ✓ More comparable listings
 *   ✓ Closer tier match (tier 1 = best)
 *   ✓ Tighter price spread (low stdDev/mean ratio)
 *   ✓ Top comparable has high similarity score
 *
 * Signals that lower confidence:
 *   ✗ No market data (formula only)
 *   ✗ Very high km (unusual scenario)
 *   ✗ Loose tier match (tier 3–4)
 *   ✗ Wide price spread
 */

class ConfidenceBuilder {
  /**
   * @param {object} params
   * @param {object} params.form        - vehicle form
   * @param {object} params.marketData  - from MarketAnalyzer
   * @param {number} params.basePrice   - from PriceScorer
   * @returns {{ confidence: number, label: string, priceRange: { low, high } }}
   */
  build({ form, marketData, basePrice }) {
    let score = 50; // start at neutral

    // ── Market sample size ────────────────────────────────────────────────
    const { sampleSize, tierUsed, stdDev, medianPrice, topComparables } = marketData;

    if (sampleSize >= 20) score += 20;
    else if (sampleSize >= 10) score += 15;
    else if (sampleSize >= 5)  score += 10;
    else if (sampleSize >= 3)  score += 5;
    else score -= 15; // very few listings

    // ── Tier quality ──────────────────────────────────────────────────────
    if (tierUsed === 1) score += 15;
    else if (tierUsed === 2) score += 8;
    else if (tierUsed === 3) score -= 5;
    else if (tierUsed === 4) score -= 12;
    else score -= 20; // no market data at all

    // ── Price spread (coefficient of variation) ───────────────────────────
    if (medianPrice && stdDev) {
      const cv = stdDev / medianPrice;
      if (cv < 0.10) score += 10;      // tight spread
      else if (cv < 0.20) score += 5;
      else if (cv > 0.35) score -= 10; // very scattered market
    }

    // ── Similarity of top comparable ─────────────────────────────────────
    const topSimilarity = topComparables?.[0]?.similarityScore ?? 0;
    if (topSimilarity >= 90) score += 8;
    else if (topSimilarity >= 70) score += 4;
    else if (topSimilarity < 50) score -= 5;

    // ── Condition issues (user-reported problems) ─────────────────────────
    const issueCount = form.conditionIssues?.length ?? 0;
    if (issueCount > 3) score -= 5; // harder to estimate accurately

    // ── Clamp 0–100 ───────────────────────────────────────────────────────
    score = Math.max(0, Math.min(100, Math.round(score)));

    // ── Price range band (wider if less confident) ────────────────────────
    const spreadPct = this._spreadPct(score);
    const priceRange = {
      low:  Math.round((basePrice * (1 - spreadPct)) / 1_000) * 1_000,
      high: Math.round((basePrice * (1 + spreadPct)) / 1_000) * 1_000,
    };

    return {
      confidence:  score,
      label:       this._label(score),
      priceRange,
      dataQuality: {
        sampleSize,
        tierUsed,
        topSimilarityScore: topSimilarity,
      },
    };
  }

  _spreadPct(score) {
    // High confidence → tight band, low confidence → wide band
    if (score >= 80) return 0.06;
    if (score >= 65) return 0.10;
    if (score >= 50) return 0.15;
    return 0.22;
  }

  _label(score) {
    if (score >= 80) return "High";
    if (score >= 60) return "Moderate";
    if (score >= 40) return "Low";
    return "Very Low";
  }
}

export default new ConfidenceBuilder();