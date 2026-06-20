// src/modules/valuation/formatters/valuation-cache.formatter.js

class ValuationCacheFormatter {
  toApiResponse(doc) {
    if (!doc) return null;

    return {
      estimatedPrice: doc.result?.estimatedPrice,
      priceRange: doc.result?.priceRange,
      confidence: doc.result?.confidence,

      marketSummary: doc.marketSummary,
      comparables: doc.comparables ?? [],

      depreciationFactors:
        doc.result?.depreciationFactors,

      aiInsights: doc.aiInsights,

      warnings:
        doc.result?.warnings ?? [],

      meta:
        doc.result?.meta,
    };
  }
}

export default new ValuationCacheFormatter();