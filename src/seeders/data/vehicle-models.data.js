/* =========================================================
   VEHICLE MODELS
   scalable realistic dataset
========================================================= */

export const VEHICLE_MODELS = [

  /* =========================================================
     TOYOTA
  ========================================================= */

  {
    brandSlug: "toyota",
    slug: "innova-crysta",
    name: "Innova Crysta",
    segment: "mpv",
    launchYear: 2016,
    discontinued: false,
    fuelTypes: ["petrol", "diesel"],
    transmissions: ["manual", "automatic"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 400000 },
    resaleDemand: 1.28,
    basePriceLakh: 18.5,
    enabled: true,
  },

  {
    brandSlug: "toyota",
    slug: "fortuner",
    name: "Fortuner",
    segment: "suv",
    launchYear: 2009,
    discontinued: false,
    fuelTypes: ["diesel", "petrol"],
    transmissions: ["manual", "automatic"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 350000 },
    resaleDemand: 1.35,
    basePriceLakh: 35,
    enabled: true,
  },

  {
    brandSlug: "toyota",
    slug: "glanza",
    name: "Glanza",
    segment: "hatchback",
    launchYear: 2019,
    discontinued: false,
    fuelTypes: ["petrol", "cng"],
    transmissions: ["manual", "automatic"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 250000 },
    resaleDemand: 1.18,
    basePriceLakh: 8.5,
    enabled: true,
  },

  {
    brandSlug: "toyota",
    slug: "urban-cruiser-hyryder",
    name: "Urban Cruiser Hyryder",
    segment: "suv",
    launchYear: 2022,
    discontinued: false,
    fuelTypes: ["petrol", "hybrid", "cng"],
    transmissions: ["manual", "automatic"],
    ownershipLimit: 3,
    mileageRange: { min: 0, max: 180000 },
    resaleDemand: 1.22,
    basePriceLakh: 14,
    enabled: true,
  },

  /* =========================================================
     MARUTI SUZUKI
  ========================================================= */

  {
    brandSlug: "maruti",
    slug: "swift",
    name: "Swift",
    segment: "hatchback",
    launchYear: 2005,
    discontinued: false,
    fuelTypes: ["petrol", "cng"],
    transmissions: ["manual", "automatic"],
    ownershipLimit: 5,
    mileageRange: { min: 0, max: 350000 },
    resaleDemand: 1.38,
    basePriceLakh: 7.5,
    enabled: true,
  },

  {
    brandSlug: "maruti",
    slug: "baleno",
    name: "Baleno",
    segment: "hatchback",
    launchYear: 2015,
    discontinued: false,
    fuelTypes: ["petrol", "cng"],
    transmissions: ["manual", "automatic"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 280000 },
    resaleDemand: 1.26,
    basePriceLakh: 8,
    enabled: true,
  },

  {
    brandSlug: "maruti",
    slug: "brezza",
    name: "Brezza",
    segment: "suv",
    launchYear: 2016,
    discontinued: false,
    fuelTypes: ["petrol", "cng"],
    transmissions: ["manual", "automatic"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 300000 },
    resaleDemand: 1.31,
    basePriceLakh: 9.8,
    enabled: true,
  },

  {
    brandSlug: "maruti",
    slug: "wagonr",
    name: "WagonR",
    segment: "hatchback",
    launchYear: 1999,
    discontinued: false,
    fuelTypes: ["petrol", "cng"],
    transmissions: ["manual", "automatic"],
    ownershipLimit: 5,
    mileageRange: { min: 0, max: 400000 },
    resaleDemand: 1.34,
    basePriceLakh: 6,
    enabled: true,
  },

  {
    brandSlug: "maruti",
    slug: "dzire",
    name: "Dzire",
    segment: "sedan",
    launchYear: 2008,
    discontinued: false,
    fuelTypes: ["petrol", "cng"],
    transmissions: ["manual", "automatic"],
    ownershipLimit: 5,
    mileageRange: { min: 0, max: 320000 },
    resaleDemand: 1.29,
    basePriceLakh: 7.8,
    enabled: true,
  },

  /* =========================================================
     HYUNDAI
  ========================================================= */

  {
    brandSlug: "hyundai",
    slug: "creta",
    name: "Creta",
    segment: "suv",
    launchYear: 2015,
    discontinued: false,
    fuelTypes: ["petrol", "diesel"],
    transmissions: ["manual", "automatic", "dct", "cvt"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 300000 },
    resaleDemand: 1.27,
    basePriceLakh: 12,
    enabled: true,
  },

  {
    brandSlug: "hyundai",
    slug: "venue",
    name: "Venue",
    segment: "compact_suv",
    launchYear: 2019,
    discontinued: false,
    fuelTypes: ["petrol", "diesel"],
    transmissions: ["manual", "automatic", "dct"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 220000 },
    resaleDemand: 1.20,
    basePriceLakh: 9,
    enabled: true,
  },

  {
    brandSlug: "hyundai",
    slug: "i20",
    name: "i20",
    segment: "hatchback",
    launchYear: 2008,
    discontinued: false,
    fuelTypes: ["petrol", "diesel"],
    transmissions: ["manual", "automatic", "ivt"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 280000 },
    resaleDemand: 1.19,
    basePriceLakh: 8.5,
    enabled: true,
  },

  {
    brandSlug: "hyundai",
    slug: "verna",
    name: "Verna",
    segment: "sedan",
    launchYear: 2006,
    discontinued: false,
    fuelTypes: ["petrol", "diesel"],
    transmissions: ["manual", "automatic"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 250000 },
    resaleDemand: 1.16,
    basePriceLakh: 11,
    enabled: true,
  },

  /* =========================================================
     TATA
  ========================================================= */

  {
    brandSlug: "tata",
    slug: "nexon",
    name: "Nexon",
    segment: "suv",
    launchYear: 2017,
    discontinued: false,
    fuelTypes: ["petrol", "diesel", "electric"],
    transmissions: ["manual", "automatic", "amt"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 250000 },
    resaleDemand: 1.30,
    basePriceLakh: 9.5,
    enabled: true,
  },

  {
    brandSlug: "tata",
    slug: "punch",
    name: "Punch",
    segment: "compact_suv",
    launchYear: 2021,
    discontinued: false,
    fuelTypes: ["petrol", "cng"],
    transmissions: ["manual", "amt"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 180000 },
    resaleDemand: 1.28,
    basePriceLakh: 7,
    enabled: true,
  },

  {
    brandSlug: "tata",
    slug: "harrier",
    name: "Harrier",
    segment: "suv",
    launchYear: 2019,
    discontinued: false,
    fuelTypes: ["diesel"],
    transmissions: ["manual", "automatic"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 250000 },
    resaleDemand: 1.22,
    basePriceLakh: 16,
    enabled: true,
  },

  {
    brandSlug: "tata",
    slug: "safari",
    name: "Safari",
    segment: "suv",
    launchYear: 2021,
    discontinued: false,
    fuelTypes: ["diesel"],
    transmissions: ["manual", "automatic"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 220000 },
    resaleDemand: 1.21,
    basePriceLakh: 17,
    enabled: true,
  },

  /* =========================================================
     MAHINDRA
  ========================================================= */

  {
    brandSlug: "mahindra",
    slug: "thar",
    name: "Thar",
    segment: "offroad_suv",
    launchYear: 2010,
    discontinued: false,
    fuelTypes: ["diesel", "petrol"],
    transmissions: ["manual", "automatic"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 300000 },
    resaleDemand: 1.42,
    basePriceLakh: 15,
    enabled: true,
  },

  {
    brandSlug: "mahindra",
    slug: "xuv700",
    name: "XUV700",
    segment: "suv",
    launchYear: 2021,
    discontinued: false,
    fuelTypes: ["petrol", "diesel"],
    transmissions: ["manual", "automatic"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 200000 },
    resaleDemand: 1.36,
    basePriceLakh: 18,
    enabled: true,
  },

  {
    brandSlug: "mahindra",
    slug: "scorpio-n",
    name: "Scorpio N",
    segment: "suv",
    launchYear: 2022,
    discontinued: false,
    fuelTypes: ["diesel", "petrol"],
    transmissions: ["manual", "automatic"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 220000 },
    resaleDemand: 1.38,
    basePriceLakh: 17,
    enabled: true,
  },

  /* =========================================================
     KIA
  ========================================================= */

  {
    brandSlug: "kia",
    slug: "seltos",
    name: "Seltos",
    segment: "suv",
    launchYear: 2019,
    discontinued: false,
    fuelTypes: ["petrol", "diesel"],
    transmissions: ["manual", "automatic", "dct", "ivt"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 220000 },
    resaleDemand: 1.24,
    basePriceLakh: 12.5,
    enabled: true,
  },

  {
    brandSlug: "kia",
    slug: "sonet",
    name: "Sonet",
    segment: "compact_suv",
    launchYear: 2020,
    discontinued: false,
    fuelTypes: ["petrol", "diesel"],
    transmissions: ["manual", "imt", "dct", "automatic"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 180000 },
    resaleDemand: 1.21,
    basePriceLakh: 8,
    enabled: true,
  },

  {
    brandSlug: "kia",
    slug: "carens",
    name: "Carens",
    segment: "mpv",
    launchYear: 2022,
    discontinued: false,
    fuelTypes: ["petrol", "diesel"],
    transmissions: ["manual", "automatic", "dct"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 180000 },
    resaleDemand: 1.18,
    basePriceLakh: 11,
    enabled: true,
  },

  /* =========================================================
     HONDA
  ========================================================= */

  {
    brandSlug: "honda",
    slug: "city",
    name: "City",
    segment: "sedan",
    launchYear: 1998,
    discontinued: false,
    fuelTypes: ["petrol", "hybrid"],
    transmissions: ["manual", "cvt"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 320000 },
    resaleDemand: 1.26,
    basePriceLakh: 12,
    enabled: true,
  },

  {
    brandSlug: "honda",
    slug: "elevate",
    name: "Elevate",
    segment: "suv",
    launchYear: 2023,
    discontinued: false,
    fuelTypes: ["petrol"],
    transmissions: ["manual", "cvt"],
    ownershipLimit: 3,
    mileageRange: { min: 0, max: 120000 },
    resaleDemand: 1.18,
    basePriceLakh: 13,
    enabled: true,
  },

  {
    brandSlug: "honda",
    slug: "amaze",
    name: "Amaze",
    segment: "sedan",
    launchYear: 2013,
    discontinued: false,
    fuelTypes: ["petrol", "diesel"],
    transmissions: ["manual", "cvt"],
    ownershipLimit: 4,
    mileageRange: { min: 0, max: 260000 },
    resaleDemand: 1.17,
    basePriceLakh: 8,
    enabled: true,
  },

  /* =========================================================
     LUXURY
  ========================================================= */

  {
    brandSlug: "bmw",
    slug: "3-series",
    name: "3 Series",
    segment: "luxury_sedan",
    launchYear: 2019,
    discontinued: false,
    fuelTypes: ["petrol", "diesel", "hybrid"],
    transmissions: ["automatic"],
    ownershipLimit: 3,
    mileageRange: { min: 0, max: 180000 },
    resaleDemand: 1.18,
    basePriceLakh: 55,
    enabled: true,
  },

  {
    brandSlug: "bmw",
    slug: "x5",
    name: "X5",
    segment: "luxury_suv",
    launchYear: 2019,
    discontinued: false,
    fuelTypes: ["petrol", "diesel"],
    transmissions: ["automatic"],
    ownershipLimit: 3,
    mileageRange: { min: 0, max: 150000 },
    resaleDemand: 1.14,
    basePriceLakh: 95,
    enabled: true,
  },

  {
    brandSlug: "mercedes",
    slug: "c-class",
    name: "C-Class",
    segment: "luxury_sedan",
    launchYear: 2022,
    discontinued: false,
    fuelTypes: ["petrol", "diesel"],
    transmissions: ["automatic"],
    ownershipLimit: 3,
    mileageRange: { min: 0, max: 150000 },
    resaleDemand: 1.15,
    basePriceLakh: 60,
    enabled: true,
  },

  {
    brandSlug: "audi",
    slug: "a4",
    name: "A4",
    segment: "luxury_sedan",
    launchYear: 2021,
    discontinued: false,
    fuelTypes: ["petrol"],
    transmissions: ["automatic"],
    ownershipLimit: 3,
    mileageRange: { min: 0, max: 140000 },
    resaleDemand: 1.12,
    basePriceLakh: 52,
    enabled: true,
  },

  {
    brandSlug: "audi",
    slug: "q5",
    name: "Q5",
    segment: "luxury_suv",
    launchYear: 2021,
    discontinued: false,
    fuelTypes: ["petrol"],
    transmissions: ["automatic"],
    ownershipLimit: 3,
    mileageRange: { min: 0, max: 130000 },
    resaleDemand: 1.11,
    basePriceLakh: 68,
    enabled: true,
  },
];


/* =========================================================
   SIMPLE MODEL MAP
========================================================= */

export const CAR_MODELS_SIMPLE = {

  toyota: [
    "Innova Crysta",
    "Fortuner",
    "Glanza",
    "Urban Cruiser Hyryder",
  ],

  maruti: [
    "Swift",
    "Baleno",
    "Brezza",
    "WagonR",
    "Dzire",
  ],

  hyundai: [
    "Creta",
    "Venue",
    "i20",
    "Verna",
  ],

  tata: [
    "Nexon",
    "Punch",
    "Harrier",
    "Safari",
  ],

  mahindra: [
    "Thar",
    "XUV700",
    "Scorpio N",
  ],

  kia: [
    "Seltos",
    "Sonet",
    "Carens",
  ],

  honda: [
    "City",
    "Elevate",
    "Amaze",
  ],

  bmw: [
    "3 Series",
    "X5",
  ],

  mercedes: [
    "C-Class",
  ],

  audi: [
    "A4",
    "Q5",
  ],
};