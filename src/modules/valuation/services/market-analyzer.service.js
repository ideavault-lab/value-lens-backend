// src/valuation/services/market-analyzer.service.js

import { MarketListing } from "../../market/models/market-listing.model.js";
import { getVehicleConfig } from "../config/vehicle-types/index.js";

const MIN_COMPARABLE_LISTINGS = 3;

class MarketAnalyzer {
  async getComparableCars(form) {
    const vehicleTypeSlug = form.vehicleType?.slug ?? "car";
    const config = getVehicleConfig(vehicleTypeSlug);

    const { brand, model, variant, year, city } = form;

    const brandName    = brand?.name;
    const modelName    = model?.name;
    const fuelType     = variant?.fuelType?.name ?? variant?.fuelType?.label;
    const transmission = variant?.transmission?.name ?? variant?.transmission?.label;
    const vehicleYear  = year ?? variant?.year;

    const tiers = [
      this._buildQuery({ vehicleTypeSlug, brandName, modelName, fuelType, transmission, vehicleYear, spread: 1, config }),
      this._buildQuery({ vehicleTypeSlug, brandName, modelName, fuelType, transmission: null, vehicleYear, spread: 2, config }),
      this._buildQuery({ vehicleTypeSlug, brandName, modelName, fuelType: null, transmission: null, vehicleYear, spread: 3, config }),
      this._buildQuery({ vehicleTypeSlug, brandName, modelName, fuelType: null, transmission: null, vehicleYear, spread: 5, config }),
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

    if (!listings.length) {
      return this._emptyResult(brandName, modelName);
    }

    const prices          = listings.map((l) => l.price);
    const cleanedListings = this._removeOutliers(listings, prices);
    const scoredListings  = this._scoreListings(cleanedListings, form);

    return this._buildResult(scoredListings, tierUsed, city);
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  _buildQuery({ vehicleTypeSlug, brandName, modelName, fuelType, transmission, vehicleYear, spread, config }) {
    const query = {
      vehicleType: vehicleTypeSlug,         // ← was hardcoded "car"
      brand:       brandName,
      model:       modelName,
      price:       { $gt: config.priceFloor }, // ← was hardcoded 50_000
    };

    if (fuelType)     query.fuelType     = fuelType;
    if (transmission) query.transmission = transmission;

    if (vehicleYear) {
      query.year = { $gte: vehicleYear - spread, $lte: vehicleYear + 1 };
    }

    return query;
  }

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

  _scoreListings(listings, form) {
    const queryYear  = form.year ?? form.variant?.year;
    const queryKm    = form.kmDriven;
    const queryFuel  = form.variant?.fuelType?.name ?? form.variant?.fuelType?.label;
    const queryTrans = form.variant?.transmission?.name ?? form.variant?.transmission?.label;
    const queryOwner = form.ownership?.id;
    const queryCity  = form.city?.name;

    return listings.map((l) => {
      let score = 100;

      if (queryYear && l.year) {
        const gap = Math.abs(queryYear - l.year);
        score -= Math.min(gap * 8, 32);
      }

      if (queryKm && l.kmDriven) {
        const kmGapPct = Math.abs(queryKm - l.kmDriven) / Math.max(queryKm, 1);
        score -= Math.min(kmGapPct * 20, 20);
      }

      if (queryFuel && l.fuelType && l.fuelType !== queryFuel) score -= 10;
      if (queryTrans && l.transmission && l.transmission !== queryTrans) score -= 8;
      if (queryOwner && l.ownership && l.ownership !== queryOwner) score -= 5;
      if (queryCity && l.city && l.city === queryCity) score += 5;

      return { ...l, _similarityScore: Math.max(0, Math.min(100, score)) };
    });
  }

  _buildResult(scoredListings, tierUsed, userCity) {
    const prices      = scoredListings.map((l) => l.price);
    const sorted      = [...prices].sort((a, b) => a - b);
    const topListings = scoredListings
      .sort((a, b) => b._similarityScore - a._similarityScore)
      .slice(0, 10);

    const totalWeight = topListings.reduce((s, l) => s + l._similarityScore, 0);
    const weightedAvg = totalWeight
      ? topListings.reduce((s, l) => s + l.price * l._similarityScore, 0) / totalWeight
      : prices.reduce((a, b) => a + b, 0) / prices.length;

    const median = sorted[Math.floor(sorted.length / 2)];
    const min    = sorted[0];
    const max    = sorted[sorted.length - 1];
    const stdDev = this._stdDev(prices);

    return {
      weightedAvgPrice: Math.round(weightedAvg),
      medianPrice:      Math.round(median),
      minPrice:         Math.round(min),
      maxPrice:         Math.round(max),
      stdDev:           Math.round(stdDev),
      sampleSize:       scoredListings.length,
      tierUsed,
      topComparables: topListings.slice(0, 5).map((l) => ({
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
    const mean     = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
    return Math.sqrt(variance);
  }
}

export default new MarketAnalyzer();