// src/valuation/models/valuation-result.model.js

import mongoose from "mongoose";

const { Schema, model } = mongoose;

// ─── Shared primitives ────────────────────────────────────────────────────────

const PriceRangeSchema = new Schema(
  { low: Number, high: Number },
  { _id: false }
);

// ─── Confidence — fixed dataQuality type + added dataStats ───────────────────

const ConfidenceSchema = new Schema(
  {
    score: { type: Number, min: 0, max: 100 },
    label: { type: String, enum: ["Low", "Medium", "High", "Very High"] },
    dataQuality: { type: String, enum: ["poor", "fair", "good", "excellent"] },
    dataStats: {
      sampleSize: Number,
      tierUsed: Number,
      topSimilarityScore: Number,
    },
  },
  { _id: false }
);

const DepreciationFactorsSchema = new Schema(
  {
    vehicleAge: Number,
    kmAdjustmentPct: Number,
    conditionMultiplier: Number,
    ownershipPenaltyPct: Number,
    fuelAdjustmentPct: Number,
    transAdjustmentPct: Number,
    marketWeight: Number,
  },
  { _id: false }
);

const PriceFactorSchema = new Schema(
  {
    key: String,
    label: String,
    value: Number,
  },
  {
    _id: false
  });
const SegmentIntelligenceItemSchema = new Schema(
  {
    key: String,
    label: String,
    insight: String,
  },
  { _id: false }
);


const CoreResultSchema = new Schema(
  {
    estimatedPrice: { type: Number, required: true },
    priceRange: PriceRangeSchema,
    confidence: ConfidenceSchema,
    depreciationFactors: DepreciationFactorsSchema,
    priceFactors:{
        type:[PriceFactorSchema],
        default:[]
    },
    warnings: [String],
    meta: {
      vehicleType: String,
      brand: String,
      model: String,
      variant: String,
      year: Number,
      estimatedAt: Date,
    },
  },
  { _id: false }
);

const AiInsightsSchema = new Schema(
  {
    priceSentiment: { type: String, enum: ["positive", "neutral", "negative"] },
    strengths: [String],
    weaknesses: [String],
    marketObservations: [String],
    sellerTip: String,
    buyerTip: String,
    reasoning: String,
  },
  { _id: false }
);

const MarketSummarySchema = new Schema(
  {
    sampleSize: Number,
    tierUsed: Number,
    marketPriceRange: PriceRangeSchema,
    medianListingPrice: Number,
    weightedAvgPrice: Number,
  },
  { _id: false }
);

const ComparableSchema = new Schema(
  {
    brand: String,
    model: String,
    year: Number,
    price: Number,
    kmDriven: Number,
    fuelType: String,
    transmission: String,
    condition: String,
    location: String,
    listingUrl: String,
  },
  { _id: false }
);

// ─── Root schema ──────────────────────────────────────────────────────────────

const ValuationResultSchema = new Schema(
  {
    draftId: { type: String, required: true, unique: true },
    vehicleType: { type: String, enum: ["car", "bike", "truck", "scooter"], default: "car" },

    // Denormalised for fast queries without unpacking result
    brand: String,
    model: String,
    variant: String,
    year: Number,

    result: { type: CoreResultSchema, required: true },
    aiInsights: { type: AiInsightsSchema, default: null },
    segmentIntelligence: { type: [SegmentIntelligenceItemSchema], default: [] },
    marketSummary: { type: MarketSummarySchema, default: null },
    comparables: { type: [ComparableSchema], default: [] },

    expiresAt: { type: Date, required: true },
    version: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    collection: "valuation_results",
  }
);

ValuationResultSchema.index({ draftId: 1 }, { unique: true });
ValuationResultSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
ValuationResultSchema.index({ vehicleType: 1, brand: 1, model: 1 });
ValuationResultSchema.index({ vehicleType: 1, year: 1 });

ValuationResultSchema.virtual("isExpired").get(function () {
  return this.expiresAt < new Date();
});

export const ValuationResult = model("ValuationResult", ValuationResultSchema);