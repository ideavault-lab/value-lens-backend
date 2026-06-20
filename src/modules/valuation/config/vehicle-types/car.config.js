// src/valuation/config/vehicle-types/car.config.js

export default {
  slug: "car",

  depreciationSchedule: [
    { maxAge: 1,  annualRate: 0.20 },
    { maxAge: 3,  annualRate: 0.15 },
    { maxAge: 5,  annualRate: 0.12 },
    { maxAge: 10, annualRate: 0.09 },
    { maxAge: Infinity, annualRate: 0.06 },
  ],

  expectedKmPerYear:   15_000,
  kmPenaltyPer10k:     0.008,
  kmBonusPer10k:       0.004,
  maxKmAdjustment:     0.25,

  conditionMultipliers: {
    excellent: 1.05,
    good:      1.00,
    fair:      0.90,
    poor:      0.75,
  },

  ownershipPenalties: {
    first:  0.00,
    second: 0.05,
    third:  0.10,
    fourth: 0.15,
    fifth:  0.20,
  },

  fuelAdjustment: {
    diesel:   0.03,
    petrol:   0.00,
    electric: 0.05,
    cng:      -0.03,
    hybrid:   0.04,
  },

  transmissionAdjustment: {
    automatic: 0.02,
    manual:    0.00,
    amt:       0.01,
  },

  marketWeightByTier: { 1: 0.75, 2: 0.65, 3: 0.50, 4: 0.35 },
  defaultMarketWeight: 0.40,

  priceFloor: 50_000, // ignore junk listings below this
};