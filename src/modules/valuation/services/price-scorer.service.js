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

    // trace[] holds the real before/after price at every step — single
    // source of truth for both the display factors and any debugging.
    const trace = [];
    const record = (key, label, before, after) => {
      trace.push({
        key,
        label,
        value: before > 0 ? Number((((after - before) / before) * 100).toFixed(1)) : 0,
      });
      return after;
    };

    // ── Step 1: Depreciated ex-showroom price ───────────────────────────
    const formulaPrice = this._depreciateExShowroom(exShowroom, vehicleAge, config);
    record("age", "Age & depreciation", exShowroom, formulaPrice);

    // ── Step 2: Market anchor ─────────────────────────────────────────────
    const marketAnchor = marketData.weightedAvgPrice ?? marketData.medianPrice;
    const marketWeight = config.marketWeightByTier[marketData.tierUsed] ?? config.defaultMarketWeight;
    const formulaWeight = 1 - marketWeight;

    let blendedPrice = marketAnchor
      ? marketAnchor * marketWeight + formulaPrice * formulaWeight
      : formulaPrice;
    blendedPrice = record("market", "Market demand", formulaPrice, blendedPrice);

    // ── Step 3: Km adjustment ─────────────────────────────────────────────
    const expectedKm = config.expectedKmPerYear * vehicleAge;
    const excessKm = kmDriven - expectedKm;
    const kmUnitDelta = excessKm / 10_000;
    const kmAdjRate = excessKm > 0
      ? Math.min(kmUnitDelta * config.kmPenaltyPer10k, config.maxKmAdjustment)
      : Math.max(kmUnitDelta * config.kmBonusPer10k, -config.maxKmAdjustment);
    let kmAdjusted = blendedPrice * (1 - kmAdjRate);
    kmAdjusted = record("mileage", "Mileage", blendedPrice, kmAdjusted);

    // ── Step 4: Condition adjustment ──────────────────────────────────────
    const conditionMult = config.conditionMultipliers[conditionId] ?? 1.0;
    let condAdjusted = kmAdjusted * conditionMult;
    condAdjusted = record("condition", "Condition", kmAdjusted, condAdjusted);

    // ── Step 5: Ownership penalty ─────────────────────────────────────────
    const ownerPenalty = config.ownershipPenalties[ownershipId] ?? 0;
    let ownerAdjusted = condAdjusted * (1 - ownerPenalty);
    ownerAdjusted = record("ownership", "Ownership", condAdjusted, ownerAdjusted);

    // ── Step 6: Fuel + transmission ───────────────────────────────────────
    const fuelBonus = config.fuelAdjustment[fuelSlug] ?? 0;
    const transBonus = config.transmissionAdjustment[transSlug] ?? 0;
    const finalPrice = ownerAdjusted * (1 + fuelBonus + transBonus);
    record("fuel_transmission", "Fuel & gearbox", ownerAdjusted, finalPrice);

    const basePrice = Math.round(finalPrice / 1_000) * 1_000;

    return {
      basePrice,
      priceFactors: trace,
      // Kept only for the AI prompt (buildUserPrompt reads formulaPrice) —
      // not sent to the frontend anymore.
      pricingMeta: {
        vehicleType: vehicleTypeSlug,
        vehicleAge,
        exShowroomLakh: exShowroom / 100_000,
        formulaPrice: Math.round(formulaPrice),
        marketAnchor: marketAnchor ? Math.round(marketAnchor) : null,
        marketWeight: Number((marketWeight * 100).toFixed(0)),
      },
    };
  }

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