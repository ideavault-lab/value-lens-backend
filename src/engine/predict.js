import { resolveBrandModel }       from "../data/brands.js";
import { getDepreciationMultiplier } from "./depreciation.js";
import {
  kmImpact,
  conditionImpact,
  ownerImpact,
  locationImpact,
  fuelImpact,
  transmissionImpact,
  marketExitImpact,
  luxuryAgeImpact,
} from "./multipliers.js";
import { computeConfidence } from "./confidence.js";

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Build a human-readable explanation from the active factors.
 * Only surfaces the most meaningful drivers — avoids listing every factor.
 */
function buildExplanation(data, { brand, model }, age, multipliers) {
  const lines = [];

  if (brand?.exitedMarket) {
    lines.push(`${data.brand} has exited the Indian market, significantly impacting resale value`);
  }

  if (age <= 2) {
    lines.push(`Near-new vehicle (${age} yr) retains strong residual value`);
  } else if (age >= 10) {
    lines.push(`High age (${age} yrs) drives significant depreciation`);
  }

  if (multipliers.km > 1.05) {
    lines.push("Well below average mileage commands a premium");
  } else if (multipliers.km < 0.90) {
    lines.push("Above-average km driven reduces resale value");
  }

  if (data.condition === "excellent") {
    lines.push("Excellent condition boosts buyer confidence");
  } else if (data.condition === "fair" || data.condition === "poor") {
    lines.push("Below-average condition lowers the estimate");
  }

  if (data.owner_type === "first") {
    lines.push("First-owner vehicles are highly preferred by buyers");
  } else if (data.owner_type === "fourth_plus") {
    lines.push("Multiple ownership transfers significantly reduce value");
  }

  if (data.fuel_type === "electric" && age <= 4) {
    lines.push("Strong EV demand in the current market");
  } else if (data.fuel_type === "diesel" && age > 8) {
    lines.push("Older diesel vehicles face demand headwinds");
  }

  if (data.location) {
    const locM = multipliers.location;
    if (locM >= 1.08) lines.push(`High demand in ${data.location} supports pricing`);
    else if (locM <= 0.93) lines.push(`Lower demand outside major metros reduces pricing`);
  }

  if (data.transmission === "automatic") {
    lines.push("Automatic transmission adds a buyer-preference premium");
  }

  if (model?.resale >= 1.20) {
    lines.push(`${data.model} has exceptional resale demand`);
  } else if (model?.resale <= 0.82) {
    lines.push(`${data.model} has below-average resale demand`);
  }

  return lines.length > 0
    ? lines.join(". ") + "."
    : "Standard market valuation based on vehicle specifications.";
}

/**
 * Convert a raw multiplier to a percentage-point impact string.
 * e.g. 1.12 → +12, 0.88 → -12
 */
function pctImpact(m) {
  return Math.round((m - 1) * 100);
}

/**
 * Main prediction function.
 *
 * @param {object} data  Validated request body
 * @returns {object}     Prediction result
 */
export function predictCarValue(data) {
  const {
    brand: brandId,
    model: modelName,
    year,
    km_driven,
    fuel_type,
    transmission,
    condition,
    owner_type,
    location,
  } = data;

  const age = Math.max(0, CURRENT_YEAR - year);

  // ── Resolve brand + model ──────────────────────────────────────────────────
  const { brand, model } = resolveBrandModel(brandId, modelName);
  const brandKnown = brand !== null;
  const modelKnown = model !== null;

  const basePrice          = model?.base            ?? brand?.basePriceLakh ?? 10.0;
  const segment            = model?.segment         ?? "suv";
  const depreciationProfile = brand?.depreciationProfile ?? "moderate";
  const isLuxury           = brand?.segment === "luxury";

  // ── Compute each multiplier ────────────────────────────────────────────────
  const mDepreciation = getDepreciationMultiplier(depreciationProfile, age);
  const mResale       = model?.resale ?? brand?.resaleDemand ?? 1.00;
  const mKm           = kmImpact(km_driven, age, segment);
  const mCondition    = conditionImpact(condition);
  const mOwner        = ownerImpact(owner_type, brand?.segment);
  const mLocation     = locationImpact(location, fuel_type);
  const mFuel         = fuelImpact(fuel_type, age);
  const mTransmission = transmissionImpact(transmission, segment);
  const mMarketExit   = marketExitImpact(brand?.exitedMarket ?? false);
  const mLuxuryAge    = luxuryAgeImpact(age, isLuxury);

  // ── Final price (₹ Lakhs) ─────────────────────────────────────────────────
  const predicted = basePrice
    * mDepreciation
    * mResale
    * mKm
    * mCondition
    * mOwner
    * mLocation
    * mFuel
    * mTransmission
    * mMarketExit
    * mLuxuryAge;

  // Price range — luxury market is more volatile
  const spread    = isLuxury ? 0.15 : 0.10;
  const priceLow  = predicted * (1 - spread);
  const priceHigh = predicted * (1 + spread);

  // ── Confidence ────────────────────────────────────────────────────────────
  const confidence = computeConfidence({
    brandKnown,
    modelKnown,
    age,
    condition,
    ownerType:  owner_type,
    fuelType:   fuel_type,
  });

  // ── Explanation ───────────────────────────────────────────────────────────
  const explanation = buildExplanation(
    data,
    { brand, model },
    age,
    { km: mKm, location: mLocation },
  );

  // ── Response shape ────────────────────────────────────────────────────────
  return {
    predicted_price: round2(predicted),
    price_low:       round2(priceLow),
    price_high:      round2(priceHigh),
    confidence,
    explanation,
    meta: {
      base_price_lakh:       round2(basePrice),
      age_years:             age,
      segment,
      depreciation_profile:  depreciationProfile,
      is_luxury:             isLuxury,
      brand_known:           brandKnown,
      model_known:           modelKnown,
    },
    factors: {
      depreciation_impact:    pctImpact(mDepreciation),
      resale_demand_impact:   pctImpact(mResale),
      km_impact:              pctImpact(mKm),
      condition_impact:       pctImpact(mCondition),
      owner_impact:           pctImpact(mOwner),
      location_impact:        pctImpact(mLocation),
      fuel_impact:            pctImpact(mFuel),
      transmission_impact:    pctImpact(mTransmission),
      market_exit_impact:     pctImpact(mMarketExit),
      luxury_age_impact:      pctImpact(mLuxuryAge),
    },
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}