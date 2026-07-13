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
      const raw = await this.provider.chat({ system, user, maxTokens: 1500 });
      return this.parse(raw, context.basePrice);
    } catch (error) {
      console.error("[ValuationAIService] provider error:", error.message);
      return this.fallback(context.basePrice);
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
7. Return ONLY valid JSON. No markdown code fences, no preamble, no trailing text.
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
      },
    });
  }

  parse(raw, basePrice) {
    try {
      // Some providers wrap JSON in ```json fences even when told not to.
      const cleaned = raw.replace(/```json\s*|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      const min = basePrice * 0.9;
      const max = basePrice * 1.1;
      parsed.adjustedPrice = Math.max(min, Math.min(Number(parsed.adjustedPrice) || basePrice, max));

      return parsed;
    } catch (err) {
      console.error("[ValuationAIService] parse failed:", err.message, "raw:", raw);
      return this.fallback(basePrice);
    }
  }

  fallback(basePrice) {
    return {
      adjustedPrice: basePrice,
      priceSentiment: "fairly_priced",
      factorNotes: {},
      strengths: [],
      weaknesses: [],
      sellerTip: "Maintain service records.",
      buyerTip: "Inspect thoroughly.",
      reasoning: "Formula-based valuation used.",
    };
  }
}

export default new ValuationAIService();