import { resolveProvider } from "./config/providers.js";

/**
 * ValuationAIService
 *
 * Provider-agnostic used-car valuation AI service.
 *
 * Switch providers by setting AI_PROVIDER in your environment:
 *
 *   AI_PROVIDER=anthropic   → uses AnthropicProvider  (default)
 *   AI_PROVIDER=mistral     → uses MistralProvider
 *
 * No other code changes needed. The provider is resolved once at startup.
 *
 * ─── Output schema ────────────────────────────────────────────────────────────
 * @typedef {object} PriceRange
 * @property {number} low   - Conservative / quick-sale price (₹)
 * @property {number} mid   - Fair-market realistic price (₹) — equals adjustedPrice
 * @property {number} high  - Best-case private-sale price (₹)
 *
 * @typedef {object} DepreciationBreakdown
 * @property {number} baseDepreciationPct
 * @property {number} kmAdjustmentPct
 * @property {number} conditionAdjustmentPct
 * @property {number} variantPremiumPct
 * @property {number} ownershipPenaltyPct
 * @property {number} marketDemandPct
 *
 * @typedef {object} SellingChannel
 * @property {string} channel
 * @property {number} expectedPrice
 * @property {string} tip
 *
 * @typedef {object} AIValuationResult
 * @property {number}               adjustedPrice
 * @property {PriceRange}           priceRange
 * @property {string}               priceSentiment        "undervalued"|"fairly_priced"|"overvalued"
 * @property {number}               confidenceScore       0–100
 * @property {DepreciationBreakdown} depreciationBreakdown
 * @property {string[]}             strengths
 * @property {string[]}             weaknesses
 * @property {string[]}             marketObservations
 * @property {string[]}             competitorComparisons
 * @property {SellingChannel[]}     sellingChannels
 * @property {string}               buyerTip
 * @property {string}               reasoning
 * @property {string}               disclaimer
 * @property {string}               _provider             injected — which provider answered
 */

class ValuationAIService {
  constructor() {
    // Resolved once at startup; swap by changing AI_PROVIDER env var + restart
    this._provider = resolveProvider();
    console.info(`[ValuationAIService] Active provider: ${this._provider.name}`);
  }

  /**
   * Run AI valuation analysis.
   *
   * @param {object} params
   * @param {object} params.form
   * @param {object} params.marketData
   * @param {number} params.basePrice       Formula-derived base price (₹)
   * @param {object} params.pricingFactors
   * @param {object} params.confidence
   * @returns {Promise<AIValuationResult>}
   */
  async analyze({ form, marketData, basePrice, pricingFactors, confidence }) {
    const system = this._systemPrompt();
    const user   = this._buildPrompt({ form, marketData, basePrice, pricingFactors, confidence });

    try {
      const raw = await this._provider.chat({ system, user, maxTokens: 1500 });
      const result = this._parse(raw, basePrice);
      result._provider = this._provider.name;
      return result;
    } catch (err) {
      console.error(`[ValuationAIService] Provider "${this._provider.name}" failed:`, err.message);
      return this._fallback(basePrice);
    }
  }

  // ─── Prompts (provider-neutral) ──────────────────────────────────────────────

  _systemPrompt() {
    return `You are a senior Indian used-car market analyst with 15 years of experience across
metros and Tier-2 cities. You specialize in resale pricing, depreciation modeling, and buyer/seller advisory.

ABSOLUTE RULES — never break these:
1. Respond with ONLY a single valid JSON object. No markdown, no backticks, no prose outside the JSON.
2. Never invent market data. Only extrapolate from what the prompt provides.
3. adjustedPrice must be within ±25% of basePrice unless you have an extremely strong, explicitly stated reason.
4. All prices are in Indian Rupees (₹) as plain integers (no formatting commas).
5. priceRange.low ≤ priceRange.mid ≤ priceRange.high.
6. adjustedPrice must equal priceRange.mid.
7. depreciationBreakdown percentages are signed floats (negative = value reduction).
8. sellingChannels: rank from highest expected price to lowest.
9. Keep every string concise, specific, and actionable — no filler language.
10. confidenceScore is YOUR confidence (0–100) in this estimate based on data richness.`;
  }

  _buildPrompt({ form, marketData, basePrice, pricingFactors, confidence }) {
    const {
      brand, model, variant, year, kmDriven,
      condition, ownership, conditionIssues, city,
    } = form;

    const fmt  = (n) => n != null ? (n / 100_000).toFixed(1) : "N/A";

    const comparableSummary = marketData.topComparables?.slice(0, 3).map((c, i) =>
      `  ${i + 1}. ₹${fmt(c.price)}L | ${c.year} | ${c.kmDriven?.toLocaleString()} km | ` +
      `${c.ownership ?? "?"} owner | ${c.city ?? "?"} | similarity: ${c.similarityScore}%`
    ).join("\n") || "  No comparable listings available.";

    return `Analyze the following vehicle resale valuation and return a single JSON object.

## 1. Vehicle Profile
- Brand / Model    : ${brand?.name} ${model?.name}
- Variant          : ${variant?.name}
- Year             : ${year ?? variant?.year}
- Fuel             : ${variant?.fuelType?.name}
- Transmission     : ${variant?.transmission?.name}
- Engine           : ${variant?.engineCc}cc | ${variant?.powerBhp} bhp | ${variant?.torqueNm} Nm
- Official Mileage : ${variant?.mileage} kmpl
- Ex-Showroom      : ₹${pricingFactors?.exShowroomLakh}L
- Km Driven        : ${kmDriven?.toLocaleString()}
- Condition        : ${condition?.name}
- Issues Reported  : ${conditionIssues?.join(", ") || "None"}
- Ownership        : ${ownership?.name}
- City             : ${city?.name ?? "Not specified"}

## 2. Market Intelligence
- Comparable Listings : ${marketData.sampleSize} (tier ${marketData.tierUsed ?? "N/A"})
- Price Range         : ₹${fmt(marketData.minPrice)}L – ₹${fmt(marketData.maxPrice)}L
- Weighted Average    : ₹${fmt(marketData.weightedAvgPrice)}L
- Median              : ₹${fmt(marketData.medianPrice)}L
- Top Comparables:
${comparableSummary}

## 3. Formula Breakdown
- Formula Price      : ₹${fmt(pricingFactors?.formulaPrice)}L
- Market Data Weight : ${pricingFactors?.marketWeight}
- Km Adjustment      : ${pricingFactors?.kmAdjustmentPct}%
- Condition Mult.    : ${pricingFactors?.conditionMultiplier}
- Ownership Penalty  : ${pricingFactors?.ownershipPenaltyPct}%

## 4. Base Price (pre-AI)
₹${(basePrice / 100_000).toFixed(2)}L  |  Confidence: ${confidence.confidence}/100 (${confidence.label})

---

Return ONLY this exact JSON (integers for prices, floats for percentages):

{
  "adjustedPrice": <integer rounded to nearest 10000>,
  "priceRange": {
    "low":  <integer>,
    "mid":  <integer — must equal adjustedPrice>,
    "high": <integer>
  },
  "priceSentiment": "<undervalued|fairly_priced|overvalued>",
  "confidenceScore": <integer 0–100>,
  "depreciationBreakdown": {
    "baseDepreciationPct":    <float>,
    "kmAdjustmentPct":        <float>,
    "conditionAdjustmentPct": <float>,
    "variantPremiumPct":      <float>,
    "ownershipPenaltyPct":    <float>,
    "marketDemandPct":        <float>
  },
  "strengths":             ["<string>", "<string>"],
  "weaknesses":            ["<string>", "<string>"],
  "marketObservations":    ["<string>"],
  "competitorComparisons": ["<string>"],
  "sellingChannels": [
    { "channel": "<string>", "expectedPrice": <integer>, "tip": "<string>" }
  ],
  "buyerTip":   "<string>",
  "reasoning":  "<3–4 sentences explaining adjustedPrice vs basePrice>",
  "disclaimer": "<one-sentence standard market disclaimer>"
}`;
  }

  // ─── Parse & Validate ────────────────────────────────────────────────────────

  _parse(raw, basePrice) {
    try {
      const cleaned = raw.replace(/```json\s*/g, "").replace(/```/g, "").trim();
      const parsed  = JSON.parse(cleaned);

      // Clamp adjustedPrice to ±25% of basePrice
      const lo = basePrice * 0.75;
      const hi = basePrice * 1.25;

      if (parsed.adjustedPrice < lo || parsed.adjustedPrice > hi) {
        const clamped = Math.round(basePrice / 10_000) * 10_000;
        parsed.adjustedPrice  = clamped;
        if (parsed.priceRange) parsed.priceRange.mid = clamped;
        parsed.reasoning = (parsed.reasoning ?? "") +
          " [Price was outside ±25% band and clamped to formula estimate.]";
      }

      // Enforce priceRange consistency
      if (parsed.priceRange) {
        parsed.priceRange.mid  = parsed.adjustedPrice;
        parsed.priceRange.low  = Math.min(parsed.priceRange.low,  parsed.adjustedPrice);
        parsed.priceRange.high = Math.max(parsed.priceRange.high, parsed.adjustedPrice);
      }

      // Coerce arrays
      for (const f of ["strengths", "weaknesses", "marketObservations", "competitorComparisons", "sellingChannels"]) {
        if (!Array.isArray(parsed[f])) parsed[f] = [];
      }

      // Enum guard
      parsed.priceSentiment = ["undervalued", "fairly_priced", "overvalued"].includes(parsed.priceSentiment)
        ? parsed.priceSentiment : "fairly_priced";

      // Numeric guard
      parsed.confidenceScore = typeof parsed.confidenceScore === "number"
        ? Math.min(100, Math.max(0, Math.round(parsed.confidenceScore))) : 50;

      // String defaults
      parsed.buyerTip   ??= "Inspect thoroughly and verify service history before purchase.";
      parsed.reasoning  ??= "Analysis complete. Refer to price range for guidance.";
      parsed.disclaimer ??= "Prices vary by region, platform, and negotiation. For reference only.";

      return parsed;
    } catch (err) {
      console.error("[ValuationAIService] JSON parse error:", err.message, "\nRaw:", raw.slice(0, 300));
      return this._fallback(basePrice);
    }
  }

  _fallback(basePrice) {
    const mid  = Math.round(basePrice / 10_000) * 10_000;
    const low  = Math.round((basePrice * 0.92) / 10_000) * 10_000;
    const high = Math.round((basePrice * 1.08) / 10_000) * 10_000;

    return {
      adjustedPrice: mid,
      priceRange: { low, mid, high },
      priceSentiment:  "fairly_priced",
      confidenceScore: 40,
      depreciationBreakdown: {
        baseDepreciationPct: 0, kmAdjustmentPct: 0,
        conditionAdjustmentPct: 0, variantPremiumPct: 0,
        ownershipPenaltyPct: 0, marketDemandPct: 0,
      },
      strengths: [], weaknesses: [], marketObservations: [],
      competitorComparisons: [],
      sellingChannels: [
        { channel: "Private Sale (OLX / Facebook Marketplace)", expectedPrice: high,
          tip: "List with service history and quality photos." },
        { channel: "Certified Pre-Owned / Dealer", expectedPrice: low,
          tip: "Faster sale but expect 10–15% below private market." },
      ],
      buyerTip:   "Inspect thoroughly and verify service history before purchase.",
      reasoning:  "AI analysis unavailable. Showing formula-based estimate only.",
      disclaimer: "Prices vary by region, platform, and negotiation. For reference only.",
      _provider:  "fallback",
    };
  }
}

export default new ValuationAIService();