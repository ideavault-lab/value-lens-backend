/**
 * Depreciation profiles — value-retention multiplier by vehicle age (years).
 *
 * Each function returns the fraction of base price remaining after `age` years.
 * Profiles are calibrated to Indian used-car market data.
 *
 *   slow          – Toyota, Maruti  (excellent resale, high spare availability)
 *   moderate      – Honda, Hyundai, Kia, Mahindra, VW, Skoda, Jeep, MG
 *   moderate_fast – Nissan, Renault (weaker brand equity in India)
 *   fast          – BMW, Mercedes, Audi, Ford*, Chevrolet*  (*exited market)
 */

const PROFILES = {
  slow(age) {
    if (age <= 0)  return 1.000;
    if (age === 1) return 0.880;
    if (age === 2) return 0.800;
    if (age === 3) return 0.730;
    if (age === 4) return 0.670;
    if (age === 5) return 0.620;
    if (age <= 7)  return 0.620 - (age - 5) * 0.040;
    if (age <= 10) return 0.540 - (age - 7) * 0.035;
    if (age <= 15) return 0.435 - (age - 10) * 0.025;
    return Math.max(0.18, 0.310 - (age - 15) * 0.013);
  },

  moderate(age) {
    if (age <= 0)  return 1.000;
    if (age === 1) return 0.850;
    if (age === 2) return 0.750;
    if (age === 3) return 0.670;
    if (age === 4) return 0.600;
    if (age === 5) return 0.540;
    if (age <= 7)  return 0.540 - (age - 5) * 0.050;
    if (age <= 10) return 0.440 - (age - 7) * 0.040;
    if (age <= 15) return 0.320 - (age - 10) * 0.027;
    return Math.max(0.12, 0.185 - (age - 15) * 0.013);
  },

  moderate_fast(age) {
    if (age <= 0)  return 1.000;
    if (age === 1) return 0.820;
    if (age === 2) return 0.710;
    if (age === 3) return 0.630;
    if (age === 4) return 0.560;
    if (age === 5) return 0.500;
    if (age <= 7)  return 0.500 - (age - 5) * 0.055;
    if (age <= 10) return 0.390 - (age - 7) * 0.042;
    if (age <= 15) return 0.264 - (age - 10) * 0.030;
    return Math.max(0.10, 0.114 - (age - 15) * 0.010);
  },

  fast(age) {
    if (age <= 0)  return 1.000;
    if (age === 1) return 0.780;
    if (age === 2) return 0.650;
    if (age === 3) return 0.560;
    if (age === 4) return 0.490;
    if (age === 5) return 0.430;
    if (age <= 7)  return 0.430 - (age - 5) * 0.060;
    if (age <= 10) return 0.310 - (age - 7) * 0.050;
    if (age <= 15) return 0.160 - (age - 10) * 0.020;
    return Math.max(0.06, 0.060 - (age - 15) * 0.005);
  },
};

/**
 * @param {"slow"|"moderate"|"moderate_fast"|"fast"} profile
 * @param {number} age  Vehicle age in years (>= 0)
 * @returns {number}    Value-retention multiplier (0–1)
 */
export function getDepreciationMultiplier(profile, age) {
  const fn = PROFILES[profile] ?? PROFILES.moderate;
  return fn(Math.max(0, age));
}