// src/valuation/services/valuation-ai.service.js

import valuationAi from "../../../services/ai/valuation-ai.js";

class ValuationAIService {
  constructor() {
    this.provider = valuationAi._provider;
  }

  async analyze(context) {
    const system = this.buildSystemPrompt();
    const user = this.buildUserPrompt(context);

    try {
      const raw = await this.provider.chat({ system, user, maxTokens: 1800 });
      return this.parse(raw, context);
    } catch (error) {
      console.error("[ValuationAIService] provider error:", error.message);
      return this.fallback(context);
    }
  }

  buildSystemPrompt() {
    return `
You are an expert Indian used car valuation analyst.

Your job is to review an already calculated valuation and add context — you do not have live market data, so you must not invent prices, listings, or trends you cannot see.

Rules:

1. The formula price is the primary source of truth. Do not contradict it without reason.
2. Adjust the price by a maximum of ±10% from basePrice, and only when the vehicle's specific attributes clearly justify it.
3. Never invent market trends, competitor prices, or listing counts.
4. Never claim to have real-time or live pricing data.
5. Base your reasoning only on the vehicle attributes and pre-computed factors given to you:
   - vehicle age, mileage, ownership, condition, fuel type, transmission
   - general, well-established brand resale reputation in India (e.g. Maruti/Toyota hold value; this is general knowledge, not live data)
   - typical segment demand patterns (e.g. compact SUVs and MUVs are in demand)
6. For "factorNotes", write one short, specific sentence per factor key explaining what that factor's number means for this vehicle.
7. For "segmentIntelligence", return EXACTLY 4 items. Each is a short, specific insight about this vehicle's segment (not generic filler) — cover distinct angles such as: depreciation/value-retention pattern for this segment, demand/liquidity characteristics, how this variant/trim is positioned versus siblings in its own lineup, and timing/seasonality considerations for resale. If you have no listings data (sampleSize is 0), say so honestly rather than implying you checked the market — reason from segment/brand/fuel-type knowledge instead.
8. Return ONLY valid JSON. No markdown code fences, no preamble, no trailing text.
`;
  }

  buildUserPrompt({ form, basePrice, pricingMeta, priceFactors, confidence, marketData }) {
    return JSON.stringify({
      vehicle: {
        brand: form.brand.name,
        model: form.model.name,
        variant: form.variant.name,
        year: form.year,
        fuel: form.variant.fuelType?.name,
        transmission: form.variant.transmission?.name,
        kmDriven: form.kmDriven,
        ownership: form.ownership.id,
        condition: form.condition.id,
      },

      valuation: {
        basePrice,
        confidence: confidence.confidence,
        formulaPrice: pricingMeta.formulaPrice,
      },

      priceFactors, // [{ key, label, value }] — the real, computed per-step % changes

      market: {
        listings: marketData.sampleSize,
        weightedAverage: marketData.weightedAvgPrice,
      },

      output: {
        baseMarketValueLakh: "price in lakhs before condition-specific adjustments", 
        adjustedPrice: "number",
        priceSentiment: "undervalued | fairly_priced | overvalued",
        factorNotes: {
          age: "string",
          market: "string",
          mileage: "string",
          condition: "string",
          ownership: "string",
          fuel_transmission: "string",
        },
        strengths: ["string"],
        weaknesses: ["string"],
        sellerTip: "string",
        buyerTip: "string",
        reasoning: "string",
        segmentIntelligence: [
          {
            key: "string - short slug, e.g. depreciation | demand | positioning | timing",
            label: "string - 2-4 word heading",
            insight: "string - 1-2 sentences, specific to this brand/model/variant/segment, not generic",
          },
        ], // exactly 4 items
      },
    });
  }

  parse(raw, context) {
    const { basePrice } = context;
    try {
      // Some providers wrap JSON in ```json fences even when told not to.
      const cleaned = raw.replace(/```json\s*|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      const min = basePrice * 0.9;
      const max = basePrice * 1.1;
      parsed.adjustedPrice = Math.max(min, Math.min(Number(parsed.adjustedPrice) || basePrice, max));

      parsed.segmentIntelligence = this.normalizeSegmentIntelligence(
        parsed.segmentIntelligence,
        context
      );

      return parsed;
    } catch (err) {
      console.error("[ValuationAIService] parse failed:", err.message, "raw:", raw);
      return this.fallback(context);
    }
  }

  // Guards against the AI returning fewer/more than 4, missing fields, or
  // garbage — tops up with rule-based insights rather than ever going empty.
  normalizeSegmentIntelligence(items, context) {
    const valid = Array.isArray(items)
      ? items.filter((i) => i && typeof i.insight === "string" && i.insight.trim().length > 0)
      : [];

    if (valid.length >= 4) return valid.slice(0, 4);

    const fallbackPool = this.buildFallbackSegmentIntelligence(context);
    const usedKeys = new Set(valid.map((i) => i.key));
    const topUps = fallbackPool.filter((f) => !usedKeys.has(f.key));

    return [...valid, ...topUps].slice(0, 4);
  }

  buildFallbackSegmentIntelligence({ form, priceFactors = [], confidence, marketData }) {
    const biggestFactor = [...priceFactors].sort(
      (a, b) => Math.abs(b.value) - Math.abs(a.value)
    )[0];

    const brand = form?.brand?.name ?? "This vehicle";
    const model = form?.model?.name ?? "";
    const sampleSize = marketData?.sampleSize ?? 0;

    return [
      {
        key: "demand",
        label: "Market demand",
        insight:
          sampleSize === 0
            ? `No comparable listings were found for ${brand} ${model} in this area — demand signals are limited, so this is a formula-based estimate.`
            : `Based on ${sampleSize} comparable listing${sampleSize === 1 ? "" : "s"}, demand data is limited but factored into the price.`,
      },
      {
        key: "positioning",
        label: "Biggest price driver",
        insight: biggestFactor
          ? `${biggestFactor.label} has the largest impact on this valuation (${biggestFactor.value > 0 ? "+" : ""}${biggestFactor.value}%).`
          : `No single factor dominates this valuation — price is a blend of several moderate adjustments.`,
      },
      {
        key: "depreciation",
        label: "Depreciation pattern",
        insight: `${brand} ${model} (${form?.year ?? ""}) generally follows standard age-based depreciation for its segment; condition and mileage are the main levers on top of that.`,
      },
      {
        key: "timing",
        label: "Selling window",
        insight:
          "Live market timing signals aren't available for this vehicle yet — check back once more comparable listings are indexed for a sharper read.",
      },
    ];
  }

  fallback(context) {
    return {
      adjustedPrice: context.basePrice,
      priceSentiment: "fairly_priced",
      factorNotes: {},
      strengths: [],
      weaknesses: [],
      sellerTip: "Maintain service records.",
      buyerTip: "Inspect thoroughly.",
      reasoning: "Formula-based valuation used.",
      segmentIntelligence: this.buildFallbackSegmentIntelligence(context),
    };
  }
}

export default new ValuationAIService();