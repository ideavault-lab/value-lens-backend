// src/valuation/services/price-scorer.service.js

import { getVehicleConfig } from "../config/vehicle-types/index.js";

class PriceScorer {
  calculate({ form, marketData }) {
    const vehicleTypeSlug = form.vehicleType?.slug ?? "car";
    const config = getVehicleConfig(vehicleTypeSlug);

    const vehicleAge = this._getAge(form);
    const exShowroom = (form.variant?.exShowroomPriceLakh ?? 0) * 100_000;
    const kmDriven = form.kmDriven ?? 0;
    const conditionId = form.condition?.id ?? "good";
    const ownershipId = form.ownership?.id ?? "first";
    const fuelSlug = form.variant?.fuelType?.slug ?? "petrol";
    const transSlug = form.variant?.transmission?.slug ?? "manual";

    // ── Step 1: Depreciated ex-showroom price ───────────────────────────
    const formulaPrice = this._depreciateExShowroom(exShowroom, vehicleAge, config);

    // ── Step 2: Market anchor ─────────────────────────────────────────────
    const marketAnchor = marketData.weightedAvgPrice ?? marketData.medianPrice;

    // ── Step 3: Blend market + formula ────────────────────────────────────
    const marketWeight = config.marketWeightByTier[marketData.tierUsed] ?? config.defaultMarketWeight;
    const formulaWeight = 1 - marketWeight;

    let blendedPrice = marketAnchor
      ? marketAnchor * marketWeight + formulaPrice * formulaWeight
      : formulaPrice;

    // ── Step 4: Km adjustment ─────────────────────────────────────────────
    const expectedKm = config.expectedKmPerYear * vehicleAge;
    const excessKm = kmDriven - expectedKm;
    const kmUnitDelta = excessKm / 10_000;
    const kmAdjRate = excessKm > 0
      ? Math.min(kmUnitDelta * config.kmPenaltyPer10k, config.maxKmAdjustment)
      : Math.max(kmUnitDelta * config.kmBonusPer10k, -config.maxKmAdjustment);
    const kmAdjusted = blendedPrice * (1 - kmAdjRate);

    // ── Step 5: Condition adjustment ──────────────────────────────────────
    const conditionMult = config.conditionMultipliers[conditionId] ?? 1.0;
    const condAdjusted = kmAdjusted * conditionMult;

    // ── Step 6: Ownership penalty ─────────────────────────────────────────
    const ownerPenalty = config.ownershipPenalties[ownershipId] ?? 0;
    const ownerAdjusted = condAdjusted * (1 - ownerPenalty);

    // ── Step 7: Fuel + transmission ───────────────────────────────────────
    const fuelBonus = config.fuelAdjustment[fuelSlug] ?? 0;
    const transBonus = config.transmissionAdjustment[transSlug] ?? 0;
    const finalPrice = ownerAdjusted * (1 + fuelBonus + transBonus);

    const basePrice = Math.round(finalPrice / 1_000) * 1_000;

    return {
      basePrice,
      factors: {
        vehicleType: vehicleTypeSlug,
        vehicleAge,
        exShowroomLakh: exShowroom / 100_000,
        formulaPrice: Math.round(formulaPrice),
        marketAnchor: marketAnchor ? Math.round(marketAnchor) : null,
        marketWeight:
          Number(
            (marketWeight * 100)
              .toFixed(0)
          ),
        formulaWeight: `${(formulaWeight * 100).toFixed(0)}%`,
        expectedKm,
        actualKm: kmDriven,
        kmAdjustmentPct:
          Number(
            (kmAdjRate * 100 * (excessKm > 0 ? -1 : 1))
              .toFixed(1)
          ),
        condition: conditionId,
        conditionMultiplier: conditionMult,
        ownership: ownershipId,
        ownershipPenaltyPct:
          Number(
            (ownerPenalty * 100)
              .toFixed(1)
          ),

        fuelAdjustmentPct:
          Number(
            (fuelBonus * 100)
              .toFixed(1)
          ),
        transAdjustmentPct:
          Number(
            (transBonus * 100)
              .toFixed(1)
          ),
      },
    };
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  _getAge(form) {
    const currentYear = new Date().getFullYear();
    const modelYear = form.year ?? form.variant?.year ?? currentYear;
    return Math.max(0, currentYear - modelYear);
  }

  _depreciateExShowroom(exShowroom, age, config) {
    if (!exShowroom || age <= 0) return exShowroom || 0;

    let value = exShowroom;
    for (let yr = 1; yr <= age; yr++) {
      const schedule = config.depreciationSchedule.find((s) => yr <= s.maxAge);
      value = value * (1 - schedule.annualRate);
    }
    return value;
  }
}

export default new PriceScorer();