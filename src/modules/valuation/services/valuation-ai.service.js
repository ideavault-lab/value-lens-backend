import valuationAi from "../../../services/ai/valuation-ai.js";

class ValuationAIService {
    constructor() {
        this.provider = valuationAi._provider;
    }

    async analyze(context) {

        const system =
            this.buildSystemPrompt();

        const user =
            this.buildUserPrompt(context);

        try {

            const raw =
                await this.provider.chat({
                    system,
                    user,
                    maxTokens: 1500,
                });

            return this.parse(raw, context.basePrice);

        } catch (error) {

            console.error(
                "[ValuationAIService]",
                error.message
            );

            return this.fallback(
                context.basePrice
            );
        }
    }

    buildSystemPrompt() {
        return `
You are an expert Indian used car valuation analyst.

Your job is to improve an already calculated valuation.

You DO NOT replace the formula engine.

You REVIEW the formula result.

Rules:

1. Formula price is the primary source.
2. Adjust maximum ±10%.
3. Never invent market trends.
4. Never mention lack of data.
5. Consider:
   - vehicle age
   - mileage
   - ownership
   - condition
   - fuel type
   - transmission
   - brand resale strength
   - segment demand
6. Return ONLY valid JSON.
`;
    }

    buildUserPrompt({
        form,
        basePrice,
        pricingFactors,
        confidence,
        marketData,
    }) {

        return JSON.stringify({
            vehicle: {
                brand: form.brand.name,
                model: form.model.name,
                variant: form.variant.name,
                year: form.year,
                fuel: form.variant.fuelType?.name,
                transmission:
                    form.variant.transmission?.name,
                kmDriven:
                    form.kmDriven,
                ownership:
                    form.ownership.id,
                condition:
                    form.condition.id,
            },

            valuation: {
                basePrice,
                confidence:
                    confidence.confidence,
                formulaPrice:
                    pricingFactors.formulaPrice,
            },

            market: {
                listings:
                    marketData.sampleSize,
                weightedAverage:
                    marketData.weightedAvgPrice,
            },

            output: {
                adjustedPrice:
                    "number",

                priceSentiment:
                    "undervalued | fairly_priced | overvalued",

                strengths:
                    ["string"],

                weaknesses:
                    ["string"],

                sellerTip:
                    "string",

                buyerTip:
                    "string",

                reasoning:
                    "string",
            },
        });
    }

    parse(raw, basePrice) {

        try {

            const parsed =
                JSON.parse(raw);

            const min =
                basePrice * 0.9;

            const max =
                basePrice * 1.1;

            parsed.adjustedPrice =
                Math.max(
                    min,
                    Math.min(
                        parsed.adjustedPrice,
                        max
                    )
                );

            return parsed;

        } catch {

            return this.fallback(
                basePrice
            );
        }
    }

    fallback(basePrice) {

        return {

            adjustedPrice:
                basePrice,

            priceSentiment:
                "fairly_priced",

            strengths: [],

            weaknesses: [],

            sellerTip:
                "Maintain service records.",

            buyerTip:
                "Inspect thoroughly.",

            reasoning:
                "Formula-based valuation used.",
        };
    }
}

export default new ValuationAIService();