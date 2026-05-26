/**
 * PriceScorer
 *
 * Calculates a rule-based estimated resale price using:
 *   1. Market anchor price  (weighted avg of comparable listings)
 *   2. Depreciation curve   (non-linear, steeper in early years)
 *   3. Km-driven adjustment (per 10k km penalty)
 *   4. Condition multiplier
 *   5. Ownership penalty    (each subsequent owner drops value)
 *   6. Fuel/transmission bonus or penalty
 *   7. Ex-showroom fallback (when no market data at all)
 *
 * All weights are named constants — easy to tune without touching logic.
 */

// ─── Tunable weights ─────────────────────────────────────────────────────────

const DEPRECIATION_SCHEDULE = [
  // { maxAge, annualRate } — first match wins
  { maxAge: 1,  annualRate: 0.20 }, // Year 1: fastest drop
  { maxAge: 3,  annualRate: 0.15 }, // Years 2–3
  { maxAge: 5,  annualRate: 0.12 }, // Years 4–5
  { maxAge: 10, annualRate: 0.09 }, // Years 6–10
  { maxAge: Infinity, annualRate: 0.06 }, // 10+ years: slow decay
];

// Per 10,000 km above base (base = 15k km/year × age)
const KM_PENALTY_PER_10K   = 0.008; // 0.8% per 10k excess km
const KM_BONUS_PER_10K     = 0.004; // 0.4% per 10k below expected (lower gain, higher loss)
const MAX_KM_ADJUSTMENT    = 0.25;  // cap at ±25%

const CONDITION_MULTIPLIERS = {
  excellent: 1.05,
  good:      1.00,
  fair:      0.90,
  poor:      0.75,
};

const OWNERSHIP_PENALTIES = {
  first:  0.00,  // no penalty
  second: 0.05,  // -5%
  third:  0.10,  // -10%
  fourth: 0.15,  // -15%
  fifth:  0.20,  // -20%
};

// Fuel type adjustment relative to petrol (diesel often retains more in India)
const FUEL_ADJUSTMENT = {
  diesel:   0.03,
  petrol:   0.00,
  electric: 0.05,
  cng:      -0.03,
  hybrid:   0.04,
};

// Transmission adjustment
const TRANSMISSION_ADJUSTMENT = {
  automatic: 0.02,
  manual:    0.00,
  amt:       0.01,
};

// How much to trust market data vs formula when we have listings
// tierUsed=1 (exact match) → trust market more, tierUsed=4 → trust formula more
const MARKET_WEIGHT_BY_TIER = {
  1: 0.75,
  2: 0.65,
  3: 0.50,
  4: 0.35,
};

// ─── PriceScorer ─────────────────────────────────────────────────────────────

class PriceScorer {
  /**
   * @param {object} params
   * @param {object} params.form       - validated vehicle form
   * @param {object} params.marketData - result from MarketAnalyzer
   * @returns {{ basePrice: number, factors: object }}
   */
  calculate({ form, marketData }) {
    const vehicleAge   = this._getAge(form);
    const exShowroom   = (form.variant?.exShowroomPriceLakh ?? 0) * 100_000;
    const kmDriven     = form.kmDriven ?? 0;
    const conditionId  = form.condition?.id ?? "good";
    const ownershipId  = form.ownership?.id ?? "first";
    const fuelSlug     = form.variant?.fuelType?.slug ?? "petrol";
    const transSlug    = form.variant?.transmission?.slug ?? "manual";

    // ── Step 1: Depreciated ex-showroom price (pure formula fallback) ──────
    const formulaPrice = this._depreciateExShowroom(exShowroom, vehicleAge);

    // ── Step 2: Market anchor ──────────────────────────────────────────────
    const marketAnchor = marketData.weightedAvgPrice ?? marketData.medianPrice;

    // ── Step 3: Blend market + formula ────────────────────────────────────
    const marketWeight  = MARKET_WEIGHT_BY_TIER[marketData.tierUsed] ?? 0.40;
    const formulaWeight = 1 - marketWeight;

    let blendedPrice = marketAnchor
      ? marketAnchor * marketWeight + formulaPrice * formulaWeight
      : formulaPrice;

    // ── Step 4: Km adjustment ──────────────────────────────────────────────
    const expectedKm      = 15_000 * vehicleAge;
    const excessKm        = kmDriven - expectedKm;
    const kmUnitDelta     = excessKm / 10_000;
    const kmAdjRate       = excessKm > 0
      ? Math.min(kmUnitDelta * KM_PENALTY_PER_10K, MAX_KM_ADJUSTMENT)
      : Math.max(kmUnitDelta * KM_BONUS_PER_10K, -MAX_KM_ADJUSTMENT);
    const kmAdjusted      = blendedPrice * (1 - kmAdjRate);

    // ── Step 5: Condition adjustment ──────────────────────────────────────
    const conditionMult   = CONDITION_MULTIPLIERS[conditionId] ?? 1.0;
    const condAdjusted    = kmAdjusted * conditionMult;

    // ── Step 6: Ownership penalty ─────────────────────────────────────────
    const ownerPenalty    = OWNERSHIP_PENALTIES[ownershipId] ?? 0;
    const ownerAdjusted   = condAdjusted * (1 - ownerPenalty);

    // ── Step 7: Fuel + transmission ───────────────────────────────────────
    const fuelBonus       = FUEL_ADJUSTMENT[fuelSlug]       ?? 0;
    const transBonus      = TRANSMISSION_ADJUSTMENT[transSlug] ?? 0;
    const finalPrice      = ownerAdjusted * (1 + fuelBonus + transBonus);

    // ── Round to nearest 1000 ─────────────────────────────────────────────
    const basePrice = Math.round(finalPrice / 1_000) * 1_000;

    return {
      basePrice,
      factors: {
        vehicleAge,
        exShowroomLakh:     exShowroom / 100_000,
        formulaPrice:       Math.round(formulaPrice),
        marketAnchor:       marketAnchor ? Math.round(marketAnchor) : null,
        marketWeight:       `${(marketWeight * 100).toFixed(0)}%`,
        formulaWeight:      `${(formulaWeight * 100).toFixed(0)}%`,
        expectedKm,
        actualKm:           kmDriven,
        kmAdjustmentPct:    `${(kmAdjRate * 100 * (excessKm > 0 ? -1 : 1)).toFixed(1)}%`,
        condition:          conditionId,
        conditionMultiplier: conditionMult,
        ownership:          ownershipId,
        ownershipPenaltyPct: `${(ownerPenalty * 100).toFixed(0)}%`,
        fuelAdjustmentPct:   `${(fuelBonus * 100).toFixed(1)}%`,
        transAdjustmentPct:  `${(transBonus * 100).toFixed(1)}%`,
      },
    };
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  _getAge(form) {
    const currentYear = new Date().getFullYear();
    const modelYear   = form.year ?? form.variant?.year ?? currentYear;
    return Math.max(0, currentYear - modelYear);
  }

  /**
   * Non-linear compound depreciation using the schedule above.
   * Applies each year's rate in sequence for a realistic curve.
   */
  _depreciateExShowroom(exShowroom, age) {
    if (!exShowroom || age <= 0) return exShowroom || 0;

    let value = exShowroom;

    for (let yr = 1; yr <= age; yr++) {
      const schedule = DEPRECIATION_SCHEDULE.find((s) => yr <= s.maxAge);
      value          = value * (1 - schedule.annualRate);
    }

    return value;
  }
}

export default new PriceScorer();