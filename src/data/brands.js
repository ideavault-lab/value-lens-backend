/**
 * Brand registry.
 *
 * Fields per brand:
 *   basePriceLakh       – fallback price when the model isn't found (₹ Lakhs)
 *   segment             – "mass" | "mass_premium" | "luxury"
 *   depreciationProfile – "slow" | "moderate" | "moderate_fast" | "fast"
 *   resaleDemand        – brand-level resale multiplier (1.0 = neutral)
 *   exitedMarket        – brand has left India (parts/service anxiety)
 *   models              – per-model overrides { base, segment, resale }
 */
export const BRANDS = {
  toyota: {
    basePriceLakh: 14.5,
    segment: "mass_premium",
    depreciationProfile: "slow",
    resaleDemand: 1.18,
    exitedMarket: false,
    models: {
      "Innova Crysta":  { base: 18.5, segment: "mpv",       resale: 1.22 },
      "Fortuner":       { base: 35.0, segment: "suv",       resale: 1.25 },
      "Camry":          { base: 45.0, segment: "sedan",     resale: 1.10 },
      "Glanza":         { base: 8.5,  segment: "hatchback", resale: 1.12 },
      "Urban Cruiser":  { base: 10.5, segment: "suv",       resale: 1.10 },
      "Corolla Altis":  { base: 20.0, segment: "sedan",     resale: 1.08 },
      "Etios":          { base: 7.5,  segment: "sedan",     resale: 1.02 },
      "Yaris":          { base: 10.0, segment: "sedan",     resale: 1.05 },
    },
  },

  honda: {
    basePriceLakh: 12.0,
    segment: "mass_premium",
    depreciationProfile: "moderate",
    resaleDemand: 1.10,
    exitedMarket: false,
    models: {
      "City":   { base: 13.5, segment: "sedan",     resale: 1.15 },
      "Amaze":  { base: 8.0,  segment: "sedan",     resale: 1.05 },
      "WR-V":   { base: 10.5, segment: "suv",       resale: 1.08 },
      "Jazz":   { base: 9.5,  segment: "hatchback", resale: 1.06 },
      "Civic":  { base: 22.0, segment: "sedan",     resale: 1.08 },
      "CR-V":   { base: 30.0, segment: "suv",       resale: 1.05 },
      "BR-V":   { base: 14.0, segment: "suv",       resale: 1.02 },
    },
  },

  hyundai: {
    basePriceLakh: 10.5,
    segment: "mass_premium",
    depreciationProfile: "moderate",
    resaleDemand: 1.12,
    exitedMarket: false,
    models: {
      "Creta":     { base: 15.0, segment: "suv",       resale: 1.20 },
      "Venue":     { base: 10.5, segment: "suv",       resale: 1.15 },
      "i20":       { base: 9.0,  segment: "hatchback", resale: 1.12 },
      "i10 Grand": { base: 6.5,  segment: "hatchback", resale: 1.08 },
      "Verna":     { base: 12.0, segment: "sedan",     resale: 1.10 },
      "Tucson":    { base: 28.0, segment: "suv",       resale: 1.08 },
      "Alcazar":   { base: 18.0, segment: "suv",       resale: 1.12 },
      "Exter":     { base: 8.0,  segment: "suv",       resale: 1.10 },
    },
  },

  maruti: {
    basePriceLakh: 7.5,
    segment: "mass",
    depreciationProfile: "slow",
    resaleDemand: 1.20,
    exitedMarket: false,
    models: {
      "Swift":   { base: 8.0,  segment: "hatchback", resale: 1.25 },
      "Baleno":  { base: 8.5,  segment: "hatchback", resale: 1.22 },
      "Brezza":  { base: 11.5, segment: "suv",       resale: 1.22 },
      "Dzire":   { base: 8.0,  segment: "sedan",     resale: 1.20 },
      "Alto":    { base: 4.5,  segment: "hatchback", resale: 1.15 },
      "Ertiga":  { base: 10.0, segment: "mpv",       resale: 1.18 },
      "Wagon R": { base: 6.5,  segment: "hatchback", resale: 1.18 },
      "Ciaz":    { base: 10.5, segment: "sedan",     resale: 1.10 },
      "S-Cross": { base: 12.0, segment: "suv",       resale: 1.08 },
      "XL6":     { base: 12.5, segment: "mpv",       resale: 1.12 },
    },
  },

  tata: {
    basePriceLakh: 10.0,
    segment: "mass_premium",
    depreciationProfile: "moderate",
    resaleDemand: 1.05,
    exitedMarket: false,
    models: {
      "Nexon":   { base: 11.5, segment: "suv",       resale: 1.15 },
      "Harrier": { base: 18.5, segment: "suv",       resale: 1.10 },
      "Safari":  { base: 22.0, segment: "suv",       resale: 1.08 },
      "Punch":   { base: 8.0,  segment: "suv",       resale: 1.12 },
      "Altroz":  { base: 8.5,  segment: "hatchback", resale: 1.10 },
      "Tiago":   { base: 6.0,  segment: "hatchback", resale: 1.05 },
      "Tigor":   { base: 7.5,  segment: "sedan",     resale: 1.03 },
    },
  },

  mahindra: {
    basePriceLakh: 13.0,
    segment: "mass_premium",
    depreciationProfile: "moderate",
    resaleDemand: 1.15,
    exitedMarket: false,
    models: {
      "Thar":       { base: 15.0, segment: "suv", resale: 1.35 },
      "XUV700":     { base: 22.0, segment: "suv", resale: 1.20 },
      "XUV300":     { base: 10.5, segment: "suv", resale: 1.08 },
      "Scorpio N":  { base: 18.0, segment: "suv", resale: 1.18 },
      "Bolero":     { base: 10.0, segment: "suv", resale: 1.12 },
      "XUV400":     { base: 16.0, segment: "suv", resale: 1.10 },
      "Marazzo":    { base: 14.0, segment: "mpv", resale: 1.05 },
    },
  },

  kia: {
    basePriceLakh: 14.0,
    segment: "mass_premium",
    depreciationProfile: "moderate",
    resaleDemand: 1.12,
    exitedMarket: false,
    models: {
      "Seltos":   { base: 15.0, segment: "suv",      resale: 1.18 },
      "Sonet":    { base: 10.0, segment: "suv",      resale: 1.15 },
      "Carens":   { base: 12.0, segment: "mpv",      resale: 1.10 },
      "Carnival": { base: 32.0, segment: "mpv",      resale: 1.05 },
      "EV6":      { base: 60.0, segment: "electric", resale: 1.08 },
    },
  },

  bmw: {
    basePriceLakh: 55.0,
    segment: "luxury",
    depreciationProfile: "fast",
    resaleDemand: 0.90,
    exitedMarket: false,
    models: {
      "3 Series":            { base: 55.0,  segment: "sedan", resale: 0.90 },
      "5 Series":            { base: 75.0,  segment: "sedan", resale: 0.88 },
      "7 Series":            { base: 160.0, segment: "sedan", resale: 0.82 },
      "X1":                  { base: 50.0,  segment: "suv",   resale: 0.92 },
      "X3":                  { base: 70.0,  segment: "suv",   resale: 0.90 },
      "X5":                  { base: 110.0, segment: "suv",   resale: 0.88 },
      "X7":                  { base: 140.0, segment: "suv",   resale: 0.85 },
      "2 Series Gran Coupe": { base: 45.0,  segment: "sedan", resale: 0.88 },
    },
  },

  mercedes: {
    basePriceLakh: 60.0,
    segment: "luxury",
    depreciationProfile: "fast",
    resaleDemand: 0.88,
    exitedMarket: false,
    models: {
      "A-Class": { base: 48.0,  segment: "hatchback", resale: 0.88 },
      "C-Class": { base: 65.0,  segment: "sedan",     resale: 0.88 },
      "E-Class": { base: 90.0,  segment: "sedan",     resale: 0.85 },
      "S-Class": { base: 180.0, segment: "sedan",     resale: 0.82 },
      "GLA":     { base: 52.0,  segment: "suv",       resale: 0.90 },
      "GLC":     { base: 75.0,  segment: "suv",       resale: 0.88 },
      "GLE":     { base: 110.0, segment: "suv",       resale: 0.85 },
      "GLS":     { base: 140.0, segment: "suv",       resale: 0.82 },
    },
  },

  audi: {
    basePriceLakh: 55.0,
    segment: "luxury",
    depreciationProfile: "fast",
    resaleDemand: 0.87,
    exitedMarket: false,
    models: {
      "A3":     { base: 45.0,  segment: "sedan",    resale: 0.87 },
      "A4":     { base: 55.0,  segment: "sedan",    resale: 0.87 },
      "A6":     { base: 75.0,  segment: "sedan",    resale: 0.85 },
      "A8":     { base: 140.0, segment: "sedan",    resale: 0.80 },
      "Q3":     { base: 48.0,  segment: "suv",      resale: 0.88 },
      "Q5":     { base: 70.0,  segment: "suv",      resale: 0.87 },
      "Q7":     { base: 105.0, segment: "suv",      resale: 0.85 },
      "Q8":     { base: 130.0, segment: "suv",      resale: 0.83 },
      "e-tron": { base: 110.0, segment: "electric", resale: 0.85 },
    },
  },

  volkswagen: {
    basePriceLakh: 11.0,
    segment: "mass_premium",
    depreciationProfile: "moderate",
    resaleDemand: 1.02,
    exitedMarket: false,
    models: {
      "Polo":   { base: 9.0,  segment: "hatchback", resale: 1.05 },
      "Vento":  { base: 11.0, segment: "sedan",     resale: 1.02 },
      "Taigun": { base: 13.5, segment: "suv",       resale: 1.08 },
      "Virtus": { base: 13.0, segment: "sedan",     resale: 1.05 },
      "Tiguan": { base: 38.0, segment: "suv",       resale: 0.98 },
    },
  },

  ford: {
    basePriceLakh: 9.5,
    segment: "mass_premium",
    depreciationProfile: "fast",
    resaleDemand: 0.85,
    exitedMarket: true,
    models: {
      "EcoSport":  { base: 10.5, segment: "suv",       resale: 0.85 },
      "Endeavour": { base: 32.0, segment: "suv",       resale: 0.82 },
      "Figo":      { base: 7.5,  segment: "hatchback", resale: 0.83 },
      "Aspire":    { base: 8.5,  segment: "sedan",     resale: 0.82 },
      "Freestyle": { base: 9.0,  segment: "hatchback", resale: 0.83 },
    },
  },

  chevrolet: {
    basePriceLakh: 7.0,
    segment: "mass",
    depreciationProfile: "fast",
    resaleDemand: 0.80,
    exitedMarket: true,
    models: {
      "Beat":   { base: 5.5,  segment: "hatchback", resale: 0.80 },
      "Cruze":  { base: 18.0, segment: "sedan",     resale: 0.78 },
      "Spark":  { base: 4.5,  segment: "hatchback", resale: 0.78 },
      "Tavera": { base: 12.0, segment: "mpv",       resale: 0.75 },
      "Enjoy":  { base: 10.0, segment: "mpv",       resale: 0.75 },
    },
  },

  nissan: {
    basePriceLakh: 8.5,
    segment: "mass",
    depreciationProfile: "moderate_fast",
    resaleDemand: 0.92,
    exitedMarket: false,
    models: {
      "Magnite": { base: 7.5,  segment: "suv",   resale: 1.00 },
      "Kicks":   { base: 12.0, segment: "suv",   resale: 0.92 },
      "Terrano": { base: 12.5, segment: "suv",   resale: 0.90 },
      "Sunny":   { base: 10.0, segment: "sedan", resale: 0.88 },
    },
  },

  skoda: {
    basePriceLakh: 12.5,
    segment: "mass_premium",
    depreciationProfile: "moderate",
    resaleDemand: 1.02,
    exitedMarket: false,
    models: {
      "Slavia":  { base: 13.0, segment: "sedan", resale: 1.05 },
      "Kushaq":  { base: 12.5, segment: "suv",   resale: 1.08 },
      "Octavia": { base: 30.0, segment: "sedan", resale: 1.00 },
      "Superb":  { base: 42.0, segment: "sedan", resale: 0.97 },
      "Kodiaq":  { base: 45.0, segment: "suv",   resale: 0.97 },
    },
  },

  renault: {
    basePriceLakh: 8.0,
    segment: "mass",
    depreciationProfile: "moderate_fast",
    resaleDemand: 0.90,
    exitedMarket: false,
    models: {
      "Kwid":   { base: 5.0,  segment: "hatchback", resale: 0.90 },
      "Triber": { base: 7.5,  segment: "mpv",       resale: 0.92 },
      "Kiger":  { base: 7.0,  segment: "suv",       resale: 0.92 },
      "Duster": { base: 13.0, segment: "suv",       resale: 0.88 },
    },
  },

  mg: {
    basePriceLakh: 16.0,
    segment: "mass_premium",
    depreciationProfile: "moderate",
    resaleDemand: 1.05,
    exitedMarket: false,
    models: {
      "Hector":   { base: 16.0, segment: "suv",      resale: 1.05 },
      "Astor":    { base: 14.5, segment: "suv",      resale: 1.05 },
      "Gloster":  { base: 35.0, segment: "suv",      resale: 1.00 },
      "ZS EV":    { base: 24.0, segment: "electric", resale: 1.08 },
      "Comet EV": { base: 8.0,  segment: "electric", resale: 1.02 },
    },
  },

  jeep: {
    basePriceLakh: 20.0,
    segment: "mass_premium",
    depreciationProfile: "moderate",
    resaleDemand: 1.08,
    exitedMarket: false,
    models: {
      "Compass":        { base: 22.0, segment: "suv", resale: 1.08 },
      "Meridian":       { base: 32.0, segment: "suv", resale: 1.05 },
      "Wrangler":       { base: 65.0, segment: "suv", resale: 1.10 },
      "Grand Cherokee": { base: 80.0, segment: "suv", resale: 1.05 },
    },
  },
};

/** Resolve brand + model data. Always returns something usable. */
export function resolveBrandModel(brandId, modelName) {
  const brand = BRANDS[brandId] ?? null;
  const model = brand?.models?.[modelName] ?? null;
  return { brand, model };
}