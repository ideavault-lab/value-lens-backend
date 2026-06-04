import { MarketListing } from "../../market/models/market-listing.model.js";

/**
 * MarketAnalyzer
 *
 * Responsible for:
 *  1. Fetching comparable listings from DB with progressive fallback
 *  2. Cleaning outliers (IQR method)
 *  3. Scoring each listing by similarity to the query vehicle
 *  4. Returning both raw and weighted market stats
 *
 * Fallback strategy (loosens filters until we get enough samples):
 *   Tier 1 → exact brand + model + fuel + transmission + year ±1
 *   Tier 2 → brand + model + fuel + year ±2  (drop transmission)
 *   Tier 3 → brand + model + year ±3          (drop fuel)
 *   Tier 4 → brand + model only               (widest net)
 */

const MIN_COMPARABLE_LISTINGS = 3;

class MarketAnalyzer {
  /**
   * @param {object} form - validated vehicle form from frontend
   * @returns {Promise<MarketAnalysisResult>}
   */
  async getComparableCars(form) {
    const {
      brand,
      model,
      variant,
      year,
      city,
    } = form;

    const brandName    = brand?.name;
    const modelName    = model?.name;
    const fuelType     = variant?.fuelType?.name;
    const transmission = variant?.transmission?.name;
    const vehicleYear  = year ?? variant?.year;

    // Progressive fallback tiers
    const tiers = [
      this._buildQuery({ brandName, modelName, fuelType, transmission, vehicleYear, spread: 1 }),
      this._buildQuery({ brandName, modelName, fuelType, transmission: null, vehicleYear, spread: 2 }),
      this._buildQuery({ brandName, modelName, fuelType: null, transmission: null, vehicleYear, spread: 3 }),
      this._buildQuery({ brandName, modelName, fuelType: null, transmission: null, vehicleYear, spread: 5 }),
    ];

    let listings = [];
    let tierUsed  = 0;

    for (let i = 0; i < tiers.length; i++) {
      listings = await MarketListing.find(tiers[i]).lean();

      if (listings.length >= MIN_COMPARABLE_LISTINGS) {
        tierUsed = i + 1;
        break;
      }
    }

    // If still empty, at least return whatever we have
    if (!listings.length) {
      return this._emptyResult(brandName, modelName);
    }

    const prices         = listings.map((l) => l.price);
    const cleanedListings = this._removeOutliers(listings, prices);
    const scoredListings  = this._scoreListings(cleanedListings, form);

    return this._buildResult(scoredListings, tierUsed, city);
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  _buildQuery({ brandName, modelName, fuelType, transmission, vehicleYear, spread }) {
    const query = {
      vehicleType: "car",
      brand:       brandName,
      model:       modelName,
      price:       { $gt: 50_000 }, // floor: ignore junk listings
    };

    if (fuelType)     query.fuelType     = fuelType;
    if (transmission) query.transmission = transmission;

    if (vehicleYear) {
      query.year = { $gte: vehicleYear - spread, $lte: vehicleYear + 1 };
    }

    return query;
  }

  /**
   * IQR-based outlier removal.
   * Removes listings whose price is below Q1 - 1.5×IQR or above Q3 + 1.5×IQR.
   */
  _removeOutliers(listings, prices) {
    if (prices.length < 4) return listings;

    const sorted = [...prices].sort((a, b) => a - b);
    const q1     = sorted[Math.floor(sorted.length * 0.25)];
    const q3     = sorted[Math.floor(sorted.length * 0.75)];
    const iqr    = q3 - q1;
    const lower  = q1 - 1.5 * iqr;
    const upper  = q3 + 1.5 * iqr;

    return listings.filter((l) => l.price >= lower && l.price <= upper);
  }

  /**
   * Score each listing 0–100 based on how closely it matches the query.
   * Higher score = more comparable = more weight in price estimation.
   */
  _scoreListings(listings, form) {
    const queryYear     = form.year ?? form.variant?.year;
    const queryKm       = form.kmDriven;
    const queryFuel     = form.variant?.fuelType?.name;
    const queryTrans    = form.variant?.transmission?.name;
    const queryOwner    = form.ownership?.id;
    const queryCity     = form.city?.name;

    return listings.map((l) => {
      let score = 100;

      // Year proximity (lose 8 pts per year gap, max -32)
      if (queryYear && l.year) {
        const gap = Math.abs(queryYear - l.year);
        score -= Math.min(gap * 8, 32);
      }

      // Km proximity (lose up to 20 pts)
      if (queryKm && l.kmDriven) {
        const kmGapPct = Math.abs(queryKm - l.kmDriven) / Math.max(queryKm, 1);
        score -= Math.min(kmGapPct * 20, 20);
      }

      // Fuel type match
      if (queryFuel && l.fuelType && l.fuelType !== queryFuel) score -= 10;

      // Transmission match
      if (queryTrans && l.transmission && l.transmission !== queryTrans) score -= 8;

      // Ownership match
      if (queryOwner && l.ownership && l.ownership !== queryOwner) score -= 5;

      // Same city bonus
      if (queryCity && l.city && l.city === queryCity) score += 5;

      return { ...l, _similarityScore: Math.max(0, Math.min(100, score)) };
    });
  }

  _buildResult(scoredListings, tierUsed, userCity) {
    const prices          = scoredListings.map((l) => l.price);
    const sorted          = [...prices].sort((a, b) => a - b);
    const topListings     = scoredListings
      .sort((a, b) => b._similarityScore - a._similarityScore)
      .slice(0, 10);

    // Weighted average using similarity score as weight
    const totalWeight     = topListings.reduce((s, l) => s + l._similarityScore, 0);
    const weightedAvg     = totalWeight
      ? topListings.reduce((s, l) => s + l.price * l._similarityScore, 0) / totalWeight
      : prices.reduce((a, b) => a + b, 0) / prices.length;

    const median = sorted[Math.floor(sorted.length / 2)];
    const min    = sorted[0];
    const max    = sorted[sorted.length - 1];
    const stdDev = this._stdDev(prices);

    return {
      weightedAvgPrice:  Math.round(weightedAvg),
      medianPrice:       Math.round(median),
      minPrice:          Math.round(min),
      maxPrice:          Math.round(max),
      stdDev:            Math.round(stdDev),
      sampleSize:        scoredListings.length,
      tierUsed,                        // 1 = most precise match, 4 = loosest
      topComparables:    topListings.slice(0, 5).map((l) => ({
        price:           l.price,
        year:            l.year,
        kmDriven:        l.kmDriven,
        fuelType:        l.fuelType,
        transmission:    l.transmission,
        ownership:       l.ownership,
        city:            l.city,
        source:          l.source,
        listingUrl:      l.listingUrl,
        similarityScore: l._similarityScore,
      })),
    };
  }

  _emptyResult(brand, model) {
    return {
      weightedAvgPrice: null,
      medianPrice:      null,
      minPrice:         null,
      maxPrice:         null,
      stdDev:           null,
      sampleSize:       0,
      tierUsed:         null,
      topComparables:   [],
      warning:          `No market listings found for ${brand} ${model}`,
    };
  }

  _stdDev(values) {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
    return Math.sqrt(variance);
  }
}

export default new MarketAnalyzer();