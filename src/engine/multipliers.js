import { resolveLocation } from "../data/locations.js";

/**
 * Expected annual km by vehicle segment.
 * Used to judge whether a car's odometer is low, average, or high.
 */
const EXPECTED_KM_PER_YEAR = {
  hatchback: 10_000,
  sedan:     12_000,
  suv:       14_000,
  mpv:       15_000,
  electric:  12_000,
};

// ── Mileage ──────────────────────────────────────────────────────────────────

/**
 * Returns a multiplier based on km driven vs the expected amount for the
 * vehicle's segment and age. Low mileage earns a premium; very high mileage
 * applies a significant discount.
 */
export function kmImpact(kmDriven, age, segment) {
  const annualExpected = EXPECTED_KM_PER_YEAR[segment] ?? 12_000;
  const totalExpected  = annualExpected * Math.max(age, 1);
  const ratio          = kmDriven / totalExpected;

  if (ratio <= 0.50) return 1.12;  // very low — strong premium
  if (ratio <= 0.70) return 1.07;
  if (ratio <= 0.90) return 1.02;
  if (ratio <= 1.10) return 1.00;  // average band
  if (ratio <= 1.30) return 0.94;
  if (ratio <= 1.60) return 0.87;
  if (ratio <= 2.00) return 0.78;
  return 0.68;                     // extremely high mileage
}

// ── Condition ────────────────────────────────────────────────────────────────

/** Visual and mechanical condition as self-reported by the seller. */
export function conditionImpact(condition) {
  const MAP = {
    excellent: 1.14,
    good:      1.00,
    fair:      0.87,
    poor:      0.68,
  };
  return MAP[condition] ?? 1.00;
}

// ── Ownership ────────────────────────────────────────────────────────────────

/**
 * Number of previous owners.
 * Luxury buyers apply a steeper discount for third-plus ownership because
 * maintenance history uncertainty is much more costly to resolve.
 */
export function ownerImpact(ownerType, brandSegment) {
  const MAP = {
    first:      1.12,
    second:     1.00,
    third:      0.87,
    fourth_plus: 0.74,
  };
  let multiplier = MAP[ownerType] ?? 1.00;

  if (brandSegment === "luxury" && (ownerType === "third" || ownerType === "fourth_plus")) {
    multiplier *= 0.95;
  }

  return multiplier;
}

// ── Location ─────────────────────────────────────────────────────────────────

/**
 * City/region demand multiplier.
 * EVs are treated separately because adoption is uneven across tiers.
 */
export function locationImpact(city, fuelType) {
  const loc = resolveLocation(city);
  return fuelType === "electric" ? loc.evDemand : loc.demand;
}

// ── Fuel type ────────────────────────────────────────────────────────────────

/**
 * Demand premium or discount based on fuel type and vehicle age.
 *
 * - EV:     high demand for new, battery-anxiety discount for old
 * - Diesel: aging fleet faces regulatory headwinds in metros
 * - CNG:    stable demand due to running-cost savings
 * - Hybrid: consistent modest premium
 * - Petrol: baseline
 */
export function fuelImpact(fuelType, age) {
  switch (fuelType) {
    case "electric":
      if (age <= 2) return 1.18;
      if (age <= 4) return 1.08;
      if (age <= 6) return 0.98;
      return 0.85;

    case "hybrid":
      return age <= 5 ? 1.10 : 1.05;

    case "diesel":
      if (age <= 5) return 1.05;
      if (age <= 8) return 0.97;
      return 0.87;

    case "cng":
      return 1.04;

    default: // petrol
      return 1.00;
  }
}

// ── Transmission ─────────────────────────────────────────────────────────────

/**
 * Automatic commands a premium that varies by segment:
 * buyers expect it more in SUVs/MPVs than in small hatchbacks.
 */
export function transmissionImpact(transmission, segment) {
  if (transmission !== "automatic") return 1.00;

  const PREMIUM = {
    hatchback: 1.04,
    sedan:     1.06,
    suv:       1.07,
    mpv:       1.07,
    electric:  1.00, // EVs are effectively always automatic
  };
  return PREMIUM[segment] ?? 1.06;
}

// ── Market exit penalty ──────────────────────────────────────────────────────

/**
 * Brands that have exited India (Ford, Chevrolet) suffer a permanent discount
 * due to parts scarcity and service network shrinkage.
 */
export function marketExitImpact(exitedMarket) {
  return exitedMarket ? 0.88 : 1.00;
}

// ── Luxury post-warranty discount ────────────────────────────────────────────

/**
 * For luxury brands, servicing costs escalate sharply once the manufacturer
 * warranty expires (~3 years). This suppresses demand for older luxury cars
 * beyond what the depreciation curve alone captures.
 */
export function luxuryAgeImpact(age, isLuxury) {
  if (!isLuxury) return 1.00;
  if (age <= 3)  return 1.00;  // within warranty
  if (age <= 5)  return 0.96;
  if (age <= 8)  return 0.90;
  return 0.82;
}