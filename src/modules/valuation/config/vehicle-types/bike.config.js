// src/valuation/config/vehicle-types/bike.config.js
// Placeholder — same shape, different numbers. Fill in real values when ready.

export default {
  slug: "bike",

  depreciationSchedule: [
    { maxAge: 1,  annualRate: 0.22 },
    { maxAge: 3,  annualRate: 0.16 },
    { maxAge: 5,  annualRate: 0.12 },
    { maxAge: 10, annualRate: 0.08 },
    { maxAge: Infinity, annualRate: 0.05 },
  ],

  expectedKmPerYear:   10_000,
  kmPenaltyPer10k:     0.010,
  kmBonusPer10k:       0.005,
  maxKmAdjustment:     0.30,

  conditionMultipliers: {
    excellent: 1.05,
    good:      1.00,
    fair:      0.88,
    poor:      0.70,
  },

  ownershipPenalties: {
    first:  0.00,
    second: 0.06,
    third:  0.12,
  },

  fuelAdjustment: {
    petrol:   0.00,
    electric: 0.04,
  },

  transmissionAdjustment: {
    manual: 0.00,
    // bikes mostly don't have "automatic" — kept empty, falls back to 0
  },

  marketWeightByTier: { 1: 0.70, 2: 0.60, 3: 0.45, 4: 0.30 },
  defaultMarketWeight: 0.35,

  priceFloor: 5_000,
};