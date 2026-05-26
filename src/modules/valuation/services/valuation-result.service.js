/**
 * ValuationResult
 *
 * Assembles the final response object from all engine outputs.
 * Single place that defines the API response shape — never leak
 * internal fields (like _similarityScore) to the client.
 */

class ValuationResult {
  /**
   * @param {object} params
   * @param {number} params.basePrice        - from PriceScorer
   * @param {object} params.pricingFactors   - from PriceScorer
   * @param {object} params.marketData       - from MarketAnalyzer
   * @param {object} params.confidenceResult - from ConfidenceBuilder
   * @param {object} params.aiInsights       - from ValuationAIService
   * @param {object} params.form             - original form
   * @returns {object}
   */
  build({
    basePrice,
    pricingFactors,
    marketData,
    confidenceResult,
    aiInsights,
    form,
  }) {
    // The final recommended price is AI's adjusted price (it had full context).
    // Fall back to basePrice if AI didn't change it meaningfully.
    const recommendedPrice =
      aiInsights?.adjustedPrice ?? basePrice;

    const warnings = this._collectWarnings({
      form,
      marketData,
      confidenceResult,
    });

    return {
      // ── Core output ──────────────────────────────────────────────────────
      estimatedPrice:    recommendedPrice,
      priceRange:        confidenceResult.priceRange,
      confidence:        {
        score:           confidenceResult.confidence,
        label:           confidenceResult.label,
        dataQuality:     confidenceResult.dataQuality,
      },

      // ── Market summary ───────────────────────────────────────────────────
      marketSummary: marketData.sampleSize > 0
        ? {
            sampleSize:        marketData.sampleSize,
            tierUsed:          marketData.tierUsed,
            marketPriceRange:  {
              low:   marketData.minPrice,
              high:  marketData.maxPrice,
            },
            medianListingPrice: marketData.medianPrice,
            weightedAvgPrice:   marketData.weightedAvgPrice,
          }
        : null,

      // ── Comparable listings (for UI display) ─────────────────────────────
      comparables: marketData.topComparables ?? [],

      // ── Factor breakdown (for transparency UI) ───────────────────────────
      depreciationFactors: {
        vehicleAge:          pricingFactors.vehicleAge,
        kmAdjustmentPct:     pricingFactors.kmAdjustmentPct,
        conditionMultiplier: pricingFactors.conditionMultiplier,
        ownershipPenaltyPct: pricingFactors.ownershipPenaltyPct,
        fuelAdjustmentPct:   pricingFactors.fuelAdjustmentPct,
        transAdjustmentPct:  pricingFactors.transAdjustmentPct,
        marketWeight:        pricingFactors.marketWeight,
      },

      // ── AI insights ───────────────────────────────────────────────────────
      aiInsights: {
        priceSentiment:      aiInsights.priceSentiment,
        strengths:           aiInsights.strengths,
        weaknesses:          aiInsights.weaknesses,
        marketObservations:  aiInsights.marketObservations,
        sellerTip:           aiInsights.sellerTip,
        buyerTip:            aiInsights.buyerTip,
        reasoning:           aiInsights.reasoning,
      },

      // ── Warnings ──────────────────────────────────────────────────────────
      warnings,

      // ── Meta ─────────────────────────────────────────────────────────────
      meta: {
        vehicleType:   form.vehicleType?.slug ?? "car",
        brand:         form.brand?.name,
        model:         form.model?.name,
        variant:       form.variant?.name,
        year:          form.year ?? form.variant?.year,
        estimatedAt:   new Date().toISOString(),
      },
    };
  }

  _collectWarnings({ form, marketData, confidenceResult }) {
    const warnings = [];

    if (marketData.sampleSize === 0) {
      warnings.push("No comparable market listings found — estimate is formula-only.");
    } else if (marketData.tierUsed >= 3) {
      warnings.push("Limited exact matches found — comparable listings are approximate.");
    }

    if (confidenceResult.confidence < 40) {
      warnings.push("Low confidence estimate due to sparse market data.");
    }

    const kmDriven = form.kmDriven ?? 0;
    if (kmDriven > 200_000) {
      warnings.push("High odometer reading (>2L km) — buyer interest may be limited.");
    }

    if ((form.conditionIssues?.length ?? 0) > 0) {
      warnings.push(`Reported condition issues may further impact resale value.`);
    }

    if (marketData.warning) {
      warnings.push(marketData.warning);
    }

    return warnings;
  }
}

export default new ValuationResult();