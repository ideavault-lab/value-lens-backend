// src/modules/valuation/formatters/valuation-cache.formatter.js

class ValuationCacheFormatter {
  toApiResponse(doc) {
    if (!doc) return null;

    console.log("ValuationCacheFormatter: toApiResponse: doc:", doc);
    return {
      estimatedPrice: doc.result?.estimatedPrice,
      priceRange: doc.result?.priceRange,
      confidence: doc.result?.confidence,

      marketSummary: doc.marketSummary,
      comparables: doc.comparables ?? [],

      depreciationFactors:
        doc.result?.depreciationFactors,

      priceFactors:
        doc.result?.priceFactors ?? [],

      aiInsights: doc.aiInsights,

      segmentIntelligence:
        doc.segmentIntelligence ?? [], 

      warnings:
        doc.result?.warnings ?? [],

      meta:
        doc.result?.meta,
    };
  }
}

export default new ValuationCacheFormatter();