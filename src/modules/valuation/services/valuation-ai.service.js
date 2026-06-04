    import Anthropic from "@anthropic-ai/sdk";

    /**
     * ValuationAIService
     *
     * Sends the full valuation context to Claude and returns structured insights.
     *
     * The prompt is designed so Claude acts as a senior car market analyst.
     * The response schema is strictly defined — always returns JSON, never prose.
     *
     * Future improvements:
     *  - Add model fine-tuning data from past valuations (where sale price was known)
     *  - Feed in real-time market trends (scraped weekly summaries)
     *  - Inject regional demand signals (city-level data)
     */

    const client = new Anthropic();

    // ─── Response schema ─────────────────────────────────────────────────────────

    /**
     * @typedef {object} AIInsight
     * @property {number}   adjustedPrice       - AI's suggested price (may differ from basePrice)
     * @property {string}   priceSentiment      - "undervalued" | "fairly_priced" | "overvalued"
     * @property {string[]} strengths           - reasons this car holds value well
     * @property {string[]} weaknesses          - reasons this car loses value faster
     * @property {string[]} marketObservations  - broader market context
     * @property {string}   sellerTip           - one actionable tip for a seller
     * @property {string}   buyerTip            - one actionable tip for a buyer
     * @property {string}   reasoning           - 2-3 sentence explanation of adjusted price
     */

    class ValuationAIService {
    /**
     * @param {object} params
     * @param {object} params.form          - vehicle form
     * @param {object} params.marketData    - from MarketAnalyzer
     * @param {number} params.basePrice     - from PriceScorer
     * @param {object} params.pricingFactors - factor breakdown from PriceScorer
     * @param {object} params.confidence    - from ConfidenceBuilder
     * @returns {Promise<AIInsight>}
     */
    async analyze({ form, marketData, basePrice, pricingFactors, confidence }) {
        const prompt = this._buildPrompt({
        form,
        marketData,
        basePrice,
        pricingFactors,
        confidence,
        });

        try {
        const message = await client.messages.create({
            model:      "claude-opus-4-5",  // Use best model for analysis quality
            max_tokens: 1024,
            messages: [
            { role: "user", content: prompt },
            ],
            system: this._systemPrompt(),
        });

        const raw = message.content?.[0]?.text ?? "{}";
        return this._parse(raw, basePrice);
        } catch (err) {
        // Never let AI failure crash the valuation — return a safe fallback
        console.error("[ValuationAIService] AI call failed:", err.message);
        return this._fallback(basePrice);
        }
    }

    // ─── Private ────────────────────────────────────────────────────────────────

    _systemPrompt() {
        return `You are a senior Indian used-car market analyst with 15 years of experience.
    You analyze vehicle resale data and provide pricing insights.

    CRITICAL RULES:
    1. Always respond with ONLY valid JSON. No markdown, no explanation outside JSON.
    2. Never hallucinate market trends — only state what the data supports.
    3. adjustedPrice must be within ±30% of the basePrice unless there is a very strong reason.
    4. All prices are in Indian Rupees (₹).
    5. Keep tips concise and actionable (1 sentence each).
    6. strengths and weaknesses: 2–4 items each.
    7. marketObservations: 1–3 items.`;
    }

    _buildPrompt({ form, marketData, basePrice, pricingFactors, confidence }) {
        const {
        brand, model, variant, year, kmDriven,
        condition, ownership, conditionIssues, city,
        } = form;

        const comparableSummary = marketData.topComparables?.slice(0, 3).map((c) =>
        `  - ₹${(c.price / 100_000).toFixed(1)}L, ${c.year}, ${c.kmDriven?.toLocaleString()} km, ${c.ownership ?? "?"} owner, ${c.city ?? "?"} (similarity: ${c.similarityScore}%)`
        ).join("\n") || "  No comparable listings found.";

        return `Analyze this vehicle resale valuation and return a JSON object.

    ## Vehicle Details
    - Brand/Model: ${brand?.name} ${model?.name}
    - Variant: ${variant?.name}
    - Year: ${year ?? variant?.year}
    - Fuel: ${variant?.fuelType?.name}
    - Transmission: ${variant?.transmission?.name}
    - Engine: ${variant?.engineCc}cc, ${variant?.powerBhp}bhp, ${variant?.torqueNm}Nm
    - Mileage (claimed): ${variant?.mileage} kmpl
    - Ex-showroom price (when new): ₹${pricingFactors?.exShowroomLakh}L
    - Km driven: ${kmDriven?.toLocaleString()}
    - Condition: ${condition?.name}
    - Condition issues reported: ${conditionIssues?.join(", ") || "None"}
    - Ownership: ${ownership?.name}
    - City: ${city?.name ?? "Not specified"}

    ## Market Data
    - Comparable listings found: ${marketData.sampleSize} (tier ${marketData.tierUsed ?? "N/A"} match)
    - Market price range: ₹${marketData.minPrice ? (marketData.minPrice / 100_000).toFixed(1) : "N/A"}L – ₹${marketData.maxPrice ? (marketData.maxPrice / 100_000).toFixed(1) : "N/A"}L
    - Weighted avg: ₹${marketData.weightedAvgPrice ? (marketData.weightedAvgPrice / 100_000).toFixed(1) : "N/A"}L
    - Median: ₹${marketData.medianPrice ? (marketData.medianPrice / 100_000).toFixed(1) : "N/A"}L
    - Top comparables:
    ${comparableSummary}

    ## Formula Estimate Breakdown
    - Formula-only price: ₹${(pricingFactors?.formulaPrice / 100_000).toFixed(1)}L
    - Market weight used: ${pricingFactors?.marketWeight}
    - Km adjustment: ${pricingFactors?.kmAdjustmentPct}
    - Condition multiplier: ${pricingFactors?.conditionMultiplier}
    - Ownership penalty: ${pricingFactors?.ownershipPenaltyPct}

    ## Base Price (before AI)
    ₹${(basePrice / 100_000).toFixed(2)}L

    ## Confidence
    ${confidence.confidence}/100 (${confidence.label})

    ---

    Return ONLY this JSON (no markdown, no backticks):
    {
    "adjustedPrice": <number in rupees, rounded to nearest 10000>,
    "priceSentiment": "<undervalued|fairly_priced|overvalued>",
    "strengths": ["<string>", ...],
    "weaknesses": ["<string>", ...],
    "marketObservations": ["<string>", ...],
    "sellerTip": "<string>",
    "buyerTip": "<string>",
    "reasoning": "<2-3 sentences explaining adjustedPrice vs basePrice>"
    }`;
    }

    _parse(raw, basePrice) {
        try {
        const cleaned = raw
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const parsed = JSON.parse(cleaned);

        // Safety: clamp adjustedPrice to ±30% of basePrice
        const lo = basePrice * 0.70;
        const hi = basePrice * 1.30;
        if (parsed.adjustedPrice < lo || parsed.adjustedPrice > hi) {
            parsed.adjustedPrice = Math.round(basePrice / 10_000) * 10_000;
            parsed.reasoning = (parsed.reasoning ?? "") +
            " (Price clamped to safe range by system.)";
        }

        return parsed;
        } catch {
        return this._fallback(basePrice);
        }
    }

    _fallback(basePrice) {
        return {
        adjustedPrice:      Math.round(basePrice / 10_000) * 10_000,
        priceSentiment:     "fairly_priced",
        strengths:          [],
        weaknesses:         [],
        marketObservations: [],
        sellerTip:          "Price competitively based on local market listings.",
        buyerTip:           "Inspect thoroughly before purchase.",
        reasoning:          "AI analysis unavailable. Using formula-based estimate.",
        };
    }
    }

    export default new ValuationAIService();