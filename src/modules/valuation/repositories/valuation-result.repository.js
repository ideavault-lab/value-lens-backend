// src/valuation/repositories/valuation-result.repository.js

import { ValuationResult } from "../models/valuation-result.model.js";

const TTL_DAYS = 7;

class ValuationResultRepository {

  _expiresAt() {
    const d = new Date();
    d.setDate(d.getDate() + TTL_DAYS);
    return d;
  }

  async findByDraftId(draftId) {
    return ValuationResult.findOne(
      { draftId, expiresAt: { $gt: new Date() } },
      { __v: 0, version: 0 }
    ).lean();
  }

  async findByVehicle({ vehicleType, brand, model, limit = 10 }) {
    return ValuationResult.find(
      { vehicleType, brand, model },
      { draftId: 1, result: 1, createdAt: 1 }
    )
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async upsert({ draftId, vehicleType, engineResult }) {
    const {
      estimatedPrice,
      priceRange,
      confidence,
      depreciationFactors,
      warnings,
      aiInsights,
      marketSummary,
      comparables,
      meta,
    } = engineResult;

    // ── Normalize confidence — split dataQuality string from dataStats object ──
    const normalizedConfidence = confidence
      ? {
          score:       confidence.score,
          label:       confidence.label,
          dataQuality: typeof confidence.dataQuality === "string"
            ? confidence.dataQuality
            : this._deriveDataQuality(confidence.score),   // ← safe fallback
          dataStats: typeof confidence.dataQuality === "object"
            ? confidence.dataQuality   // the object was wrongly in dataQuality
            : confidence.dataStats,    // or it's already in the right place
        }
      : null;

    return ValuationResult.findOneAndUpdate(
      { draftId },
      {
        $set: {
          vehicleType: vehicleType ?? "car",
          brand:   meta?.brand,
          model:   meta?.model,
          variant: meta?.variant,
          year:    meta?.year,

          result: {
            estimatedPrice,
            priceRange,
            confidence:          normalizedConfidence,
            depreciationFactors,
            warnings,
            meta,
          },
          aiInsights:    aiInsights    ?? null,
          marketSummary: marketSummary ?? null,
          comparables:   comparables   ?? [],

          expiresAt: this._expiresAt(),
          version:   1,
        },
      },
      {
        upsert:             true,
        returnDocument:     "after",     // ← replaces deprecated `new: true`
        setDefaultsOnInsert: true,
        lean:               true,
        projection:         { __v: 0, version: 0 },
      }
    );
  }

  async deleteByDraftId(draftId) {
    const res = await ValuationResult.deleteOne({ draftId });
    return res.deletedCount > 0;
  }

  // Fallback: derive quality label from score if builder didn't provide it
  _deriveDataQuality(score) {
    if (score >= 80) return "excellent";
    if (score >= 60) return "good";
    if (score >= 40) return "fair";
    return "poor";
  }
}

export default new ValuationResultRepository();