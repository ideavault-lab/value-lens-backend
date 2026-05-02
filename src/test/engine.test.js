import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { getDepreciationMultiplier } from "../src/engine/depreciation.js";
import {
  kmImpact,
  conditionImpact,
  ownerImpact,
  fuelImpact,
  transmissionImpact,
  marketExitImpact,
  luxuryAgeImpact,
} from "../src/engine/multipliers.js";
import { computeConfidence } from "../src/engine/confidence.js";
import { predictCarValue }   from "../src/engine/predict.js";

// ── Depreciation ──────────────────────────────────────────────────────────────
describe("getDepreciationMultiplier", () => {
  it("returns 1.0 at age 0", () => {
    assert.equal(getDepreciationMultiplier("slow", 0), 1.0);
  });

  it("slow profile retains more value than fast at age 5", () => {
    const slow = getDepreciationMultiplier("slow", 5);
    const fast = getDepreciationMultiplier("fast", 5);
    assert.ok(slow > fast, `slow(${slow}) should be > fast(${fast})`);
  });

  it("never returns below 0.06 (fast, very old)", () => {
    const val = getDepreciationMultiplier("fast", 25);
    assert.ok(val >= 0.06);
  });

  it("unknown profile falls back to moderate", () => {
    const unknown  = getDepreciationMultiplier("unknown_profile", 5);
    const moderate = getDepreciationMultiplier("moderate", 5);
    assert.equal(unknown, moderate);
  });
});

// ── Km impact ─────────────────────────────────────────────────────────────────
describe("kmImpact", () => {
  it("very low mileage earns a premium", () => {
    assert.ok(kmImpact(5_000, 5, "sedan") > 1.0);
  });

  it("very high mileage earns a discount", () => {
    assert.ok(kmImpact(200_000, 5, "sedan") < 1.0);
  });

  it("average mileage is neutral (1.0)", () => {
    // 5 years × 12 000 km/yr = 60 000 expected
    assert.equal(kmImpact(60_000, 5, "sedan"), 1.00);
  });
});

// ── Condition ─────────────────────────────────────────────────────────────────
describe("conditionImpact", () => {
  it("excellent > good > fair > poor", () => {
    const [e, g, f, p] = ["excellent", "good", "fair", "poor"].map(conditionImpact);
    assert.ok(e > g && g > f && f > p);
  });

  it("good is the neutral baseline (1.0)", () => {
    assert.equal(conditionImpact("good"), 1.0);
  });
});

// ── Owner ────────────────────────────────────────────────────────────────────
describe("ownerImpact", () => {
  it("first > second > third > fourth_plus", () => {
    const [a, b, c, d] = ["first", "second", "third", "fourth_plus"].map(
      (o) => ownerImpact(o, "mass_premium"),
    );
    assert.ok(a > b && b > c && c > d);
  });

  it("luxury applies extra discount for third+ owners", () => {
    const luxuryThird    = ownerImpact("third", "luxury");
    const nonLuxuryThird = ownerImpact("third", "mass_premium");
    assert.ok(luxuryThird < nonLuxuryThird);
  });
});

// ── Fuel ──────────────────────────────────────────────────────────────────────
describe("fuelImpact", () => {
  it("new EV earns a premium over petrol", () => {
    assert.ok(fuelImpact("electric", 1) > fuelImpact("petrol", 1));
  });

  it("old EV (8yr) gets a discount vs petrol", () => {
    assert.ok(fuelImpact("electric", 8) < fuelImpact("petrol", 8));
  });

  it("old diesel (10yr) gets a discount", () => {
    assert.ok(fuelImpact("diesel", 10) < 1.0);
  });
});

// ── Transmission ────────────────────────────────────────────────────────────
describe("transmissionImpact", () => {
  it("automatic is always >= manual", () => {
    for (const seg of ["hatchback", "sedan", "suv", "mpv"]) {
      assert.ok(transmissionImpact("automatic", seg) >= transmissionImpact("manual", seg));
    }
  });
});

// ── Market exit ──────────────────────────────────────────────────────────────
describe("marketExitImpact", () => {
  it("exited market gets 0.88 multiplier", () => {
    assert.equal(marketExitImpact(true), 0.88);
  });
  it("active market is neutral", () => {
    assert.equal(marketExitImpact(false), 1.00);
  });
});

// ── Luxury age ───────────────────────────────────────────────────────────────
describe("luxuryAgeImpact", () => {
  it("non-luxury always returns 1.0", () => {
    assert.equal(luxuryAgeImpact(10, false), 1.0);
  });
  it("luxury within warranty (<=3yr) is neutral", () => {
    assert.equal(luxuryAgeImpact(2, true), 1.0);
  });
  it("luxury beyond warranty discounts progressively", () => {
    assert.ok(luxuryAgeImpact(6, true) < luxuryAgeImpact(4, true));
  });
});

// ── Confidence ───────────────────────────────────────────────────────────────
describe("computeConfidence", () => {
  it("score stays within [50, 96]", () => {
    const low = computeConfidence({
      brandKnown: false, modelKnown: false, age: 20,
      condition: "poor", ownerType: "fourth_plus", fuelType: "electric",
    });
    const high = computeConfidence({
      brandKnown: true, modelKnown: true, age: 1,
      condition: "excellent", ownerType: "first", fuelType: "petrol",
    });
    assert.ok(low  >= 50);
    assert.ok(high <= 96);
    assert.ok(high > low);
  });
});

// ── Full prediction ───────────────────────────────────────────────────────────
describe("predictCarValue", () => {
  const BASE_INPUT = {
    brand: "maruti", model: "Swift", year: 2021,
    km_driven: 35_000, fuel_type: "petrol", transmission: "manual",
    condition: "good", owner_type: "first", location: "Bangalore",
  };

  it("returns a valid prediction shape", () => {
    const result = predictCarValue(BASE_INPUT);
    assert.ok(typeof result.predicted_price === "number");
    assert.ok(result.price_low < result.predicted_price);
    assert.ok(result.price_high > result.predicted_price);
    assert.ok(result.confidence >= 50 && result.confidence <= 96);
    assert.ok(typeof result.explanation === "string" && result.explanation.length > 0);
  });

  it("poor condition < good condition", () => {
    const good = predictCarValue({ ...BASE_INPUT, condition: "good" });
    const poor = predictCarValue({ ...BASE_INPUT, condition: "poor" });
    assert.ok(poor.predicted_price < good.predicted_price);
  });

  it("first owner > fourth_plus owner", () => {
    const first  = predictCarValue({ ...BASE_INPUT, owner_type: "first" });
    const fourth = predictCarValue({ ...BASE_INPUT, owner_type: "fourth_plus" });
    assert.ok(fourth.predicted_price < first.predicted_price);
  });

  it("luxury (BMW) depreciates faster than mass (Maruti) over 7 years", () => {
    const year = new Date().getFullYear() - 7;
    const maruti = predictCarValue({
      brand: "maruti", model: "Swift", year,
      km_driven: 84_000, fuel_type: "petrol", transmission: "manual",
      condition: "good", owner_type: "second", location: "Mumbai",
    });
    const bmw = predictCarValue({
      brand: "bmw", model: "5 Series", year,
      km_driven: 84_000, fuel_type: "petrol", transmission: "automatic",
      condition: "good", owner_type: "second", location: "Mumbai",
    });

    const marutiRetention = maruti.predicted_price / 8.0;    // Swift base ~8L
    const bmwRetention    = bmw.predicted_price   / 75.0;    // 5 Series base ~75L
    assert.ok(
      bmwRetention < marutiRetention,
      `BMW retention (${bmwRetention.toFixed(3)}) should be lower than Maruti (${marutiRetention.toFixed(3)})`,
    );
  });

  it("exited brand (Ford) is cheaper than active brand (Honda) equivalent", () => {
    const shared = {
      year: 2019, km_driven: 60_000, fuel_type: "petrol",
      transmission: "manual", condition: "good",
      owner_type: "second", location: "Pune",
    };
    const ford  = predictCarValue({ ...shared, brand: "ford",  model: "EcoSport" });
    const honda = predictCarValue({ ...shared, brand: "honda", model: "WR-V" });
    assert.ok(ford.predicted_price < honda.predicted_price);
  });
});