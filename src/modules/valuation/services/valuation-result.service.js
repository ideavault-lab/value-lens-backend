// src/valuation/services/valuation-result.service.js

class ValuationResult {
  build({ basePrice, priceFactors, marketData, confidenceResult, aiInsights, form }) {
    const recommendedPrice = aiInsights?.adjustedPrice ?? basePrice;
    const warnings = this._collectWarnings({ form, marketData, confidenceResult });

    return {
      estimatedPrice: recommendedPrice,
      priceRange: confidenceResult.priceRange,

      confidence: {
        score: confidenceResult.confidence,
        label: confidenceResult.label,
        dataQuality: confidenceResult.dataQuality,
        dataStats: confidenceResult.dataStats,
      },

      marketSummary: marketData.sampleSize > 0
        ? {
            sampleSize: marketData.sampleSize,
            tierUsed: marketData.tierUsed,
            marketPriceRange: { low: marketData.minPrice, high: marketData.maxPrice },
            medianListingPrice: marketData.medianPrice,
            weightedAvgPrice: marketData.weightedAvgPrice,
          }
        : null,

      comparables: marketData.topComparables ?? [],

      // Single factors array — real computed % per step, plus an AI note per factor.
      priceFactors: priceFactors.map((f) => ({
        ...f,
        note: aiInsights?.factorNotes?.[f.key] ?? null,
      })),

      aiInsights: {
        priceSentiment: aiInsights?.priceSentiment ?? "neutral",
        strengths: aiInsights?.strengths ?? [],
        weaknesses: aiInsights?.weaknesses ?? [],
        sellerTip: aiInsights?.sellerTip ?? null,
        buyerTip: aiInsights?.buyerTip ?? null,
        reasoning: aiInsights?.reasoning ?? null,
      },

      warnings,

      meta: {
        vehicleType: form.vehicleType?.slug ?? "car",
        brand: form.brand?.name,
        model: form.model?.name,
        variant: form.variant?.name,
        year: form.year ?? form.variant?.year,
        estimatedAt: new Date().toISOString(),
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
      warnings.push("Reported condition issues may further impact resale value.");
    }

    if (marketData.warning) {
      warnings.push(marketData.warning);
    }

    return warnings;
  }
}

export default new ValuationResult();