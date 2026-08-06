// src/valuation/engines/car.engine.js

/**
 * CarEngine
 *
 * The single orchestrator for car resale valuation.
 * Coordinates all sub-systems in order:
 *
 *   1. MarketAnalyzer    → fetch + filter + score comparable listings
 *   2. PriceScorer       → depreciation formula + market blend → basePrice + priceFactors
 *   3. ConfidenceBuilder → data quality → confidence score + band
 *   4. ValuationAIService → narrative review → bounded adjusted price + insights
 *   5. ValuationResult   → assemble final response
 *
 * Each step is independent and testable in isolation.
 * All intermediate values are passed explicitly — no shared state.
 */

import confidenceBuilderService from "../services/confidence-builder.service.js";
import marketAnalyzerService from "../services/market-analyzer.service.js";
import priceScorerService from "../services/price-scorer.service.js";
import valuationAiService from "../services/valuation-ai.service.js";
import valuationResultService from "../services/valuation-result.service.js";

class CarEngine {
  async calculate(form) {
    console.time("[CarEngine] calculate");

    try {
      // ── Step 1: Market analysis ─────────────────────────────────────────
      const marketData = await marketAnalyzerService.getComparableCars(form);

      // ── Step 2: Rule-based price calculation ────────────────────────────
      const { basePrice, priceFactors, pricingMeta } =
        priceScorerService.calculate({ form, marketData });

      // ── Step 3: Confidence scoring ───────────────────────────────────────
      const confidenceResult = confidenceBuilderService.build({
        form,
        marketData,
        basePrice,
      });

      // ── Step 4: AI narrative review (bounded ±10% adjustment) ───────────
      const aiInsights = await valuationAiService.analyze({
        form,
        marketData,
        basePrice,
        pricingMeta,
        priceFactors,
        confidence: confidenceResult,
      });

      console.log("[CarEngine] calculate: aiInsights:", aiInsights);
      // ── Step 5: Assemble final result ────────────────────────────────────
      return valuationResultService.build({
        basePrice,
        priceFactors,
        marketData,
        confidenceResult,
        aiInsights: aiInsights ?? {},
        form,
      });
    } finally {
      console.timeEnd("[CarEngine] calculate");
    }
  }
}

export default new CarEngine();