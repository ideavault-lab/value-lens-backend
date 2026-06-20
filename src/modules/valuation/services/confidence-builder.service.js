// src/valuation/services/confidence-builder.service.js

import { getVehicleConfig } from "../config/vehicle-types/index.js";

class ConfidenceBuilder {
  build({ form, marketData, basePrice }) {
    const vehicleTypeSlug = form.vehicleType?.slug ?? "car";
    // Confidence scoring logic itself is currently universal (sample size,
    // tier, spread). Pull config in only if/when a type needs different
    // thresholds — kept here for symmetry with the other two services.
    const config = getVehicleConfig(vehicleTypeSlug);

    let score = 50;

    const { sampleSize, tierUsed, stdDev, medianPrice, topComparables } = marketData;

    if (sampleSize >= 20) score += 20;
    else if (sampleSize >= 10) score += 15;
    else if (sampleSize >= 5)  score += 10;
    else if (sampleSize >= 3)  score += 5;
    else score -= 15;

    if (tierUsed === 1) score += 15;
    else if (tierUsed === 2) score += 8;
    else if (tierUsed === 3) score -= 5;
    else if (tierUsed === 4) score -= 12;
    else score -= 20;

    if (medianPrice && stdDev) {
      const cv = stdDev / medianPrice;
      if (cv < 0.10) score += 10;
      else if (cv < 0.20) score += 5;
      else if (cv > 0.35) score -= 10;
    }

    const topSimilarity = topComparables?.[0]?.similarityScore ?? 0;
    if (topSimilarity >= 90) score += 8;
    else if (topSimilarity >= 70) score += 4;
    else if (topSimilarity < 50) score -= 5;

    const issueCount = form.conditionIssues?.length ?? 0;
    if (issueCount > 3) score -= 5;

    score = Math.max(0, Math.min(100, Math.round(score)));

    const spreadPct = this._spreadPct(score);
    const priceRange = {
      low:  Math.round((basePrice * (1 - spreadPct)) / 1_000) * 1_000,
      high: Math.round((basePrice * (1 + spreadPct)) / 1_000) * 1_000,
    };

    return {
      confidence: score,
      label:      this._label(score),
      priceRange,

      // ── FIX: dataQuality is now a STRING, matching the DB schema ───────
      dataQuality: this._qualityLabel(score),

      // ── Raw diagnostic numbers moved to their own field ─────────────────
      dataStats: {
        sampleSize,
        tierUsed,
        topSimilarityScore: topSimilarity,
      },
    };
  }

  _spreadPct(score) {
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

  // ── NEW: derives the enum-safe quality string the schema expects ───────
  _qualityLabel(score) {
    if (score >= 80) return "excellent";
    if (score >= 60) return "good";
    if (score >= 40) return "fair";
    return "poor";
  }
}

export default new ConfidenceBuilder();