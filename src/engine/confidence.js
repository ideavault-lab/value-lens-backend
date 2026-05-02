/**
 * Confidence score — how reliable this prediction is likely to be.
 *
 * Starts at a base of 68 and adjusts based on:
 *   - Whether the brand and model are in our dataset
 *   - Vehicle age (newer = more liquid market data)
 *   - Condition and ownership (cleaner history = tighter spread)
 *   - Fuel type (EV market is more volatile)
 *
 * Clamped to [50, 96].
 */
export function computeConfidence({
  brandKnown,
  modelKnown,
  age,
  condition,
  ownerType,
  fuelType,
}) {
  let score = 68;

  // Data coverage
  if (brandKnown) score += 5;
  if (modelKnown) score += 8;

  // Age — newer cars have more comparable listings
  if (age <= 2)       score += 8;
  else if (age <= 5)  score += 5;
  else if (age > 12)  score -= 6;
  else if (age > 8)   score -= 3;

  // Condition
  if (condition === "excellent" || condition === "good") score += 4;
  else if (condition === "poor") score -= 4;

  // Ownership — fewer owners = less uncertainty
  if (ownerType === "first")       score += 4;
  else if (ownerType === "third")  score -= 3;
  else if (ownerType === "fourth_plus") score -= 6;

  // Fuel — EV resale market is still forming
  if (fuelType === "electric") score -= 4;

  return Math.min(96, Math.max(50, score));
}