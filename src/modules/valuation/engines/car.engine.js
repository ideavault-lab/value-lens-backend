

/**
 * CarEngine
 *
 * The single orchestrator for car resale valuation.
 * Coordinates all sub-systems in order:
 *
 *   1. MarketAnalyzer  → fetch + filter + score comparable listings
 *   2. PriceScorer     → depreciation formula + market blend → basePrice
 *   3. ConfidenceBuilder → data quality → confidence score + band
 *   4. ValuationAIService → AI analysis → adjusted price + insights
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

    console.time("[CarEngine] Total calculation time" , form);
    // ── Step 1: Market analysis ───────────────────────────────────────────
    const marketData = await marketAnalyzerService.getComparableCars(form);

    // ── Step 2: Rule-based price calculation ──────────────────────────────
    const { basePrice, factors: pricingFactors } =
      priceScorerService.calculate({ form, marketData });

    // ── Step 3: Confidence scoring ────────────────────────────────────────
    const confidenceResult = confidenceBuilderService.build({
      form,
      marketData,
      basePrice,
    });

    // ── Step 4: AI analysis (runs in parallel with nothing — awaited here) ─
    const aiInsights = await valuationAiService.analyze({
      form,
      marketData,
      basePrice,
      pricingFactors,
      confidence: confidenceResult,
    });

    // ── Step 5: Assemble final result ─────────────────────────────────────
    return valuationResultService.build({
      basePrice,
      pricingFactors,
      marketData,
      confidenceResult,
      aiInsights,
      form,
    });
  }
}

export default new CarEngine();