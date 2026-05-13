export const VEHICLE_MODELS = [
  // Toyota
  { brandSlug: "toyota", slug: "innova-crysta", name: "Innova Crysta", segment: "mpv", launchYear: 2016, discontinued: false, fuelTypes: ["petrol", "diesel"], transmissions: ["manual", "automatic"], ownershipLimit: 4, mileageRange: { min: 0, max: 400000 }, resaleDemand: 1.28, basePriceLakh: 18.5, enabled: true },
  { brandSlug: "toyota", slug: "fortuner", name: "Fortuner", segment: "suv", launchYear: 2009, discontinued: false, fuelTypes: ["diesel", "petrol"], transmissions: ["manual", "automatic"], ownershipLimit: 4, mileageRange: { min: 0, max: 350000 }, resaleDemand: 1.32, basePriceLakh: 35, enabled: true },
  { brandSlug: "toyota", slug: "camry", name: "Camry", segment: "sedan", launchYear: 2019, discontinued: false, fuelTypes: ["hybrid", "petrol"], transmissions: ["automatic"], ownershipLimit: 4, mileageRange: { min: 0, max: 300000 }, resaleDemand: 1.18, basePriceLakh: 45, enabled: true },
  { brandSlug: "toyota", slug: "glanza", name: "Glanza", segment: "hatchback", launchYear: 2019, discontinued: false, fuelTypes: ["petrol", "cng"], transmissions: ["manual", "automatic"], ownershipLimit: 4, mileageRange: { min: 0, max: 250000 }, resaleDemand: 1.15, basePriceLakh: 8.5, enabled: true },

  // Maruti Suzuki
  { brandSlug: "maruti", slug: "swift", name: "Swift", segment: "hatchback", launchYear: 2005, discontinued: false, fuelTypes: ["petrol", "cng"], transmissions: ["manual", "automatic"], ownershipLimit: 4, mileageRange: { min: 0, max: 300000 }, resaleDemand: 1.35, basePriceLakh: 7.5, enabled: true },
  { brandSlug: "maruti", slug: "brezza", name: "Brezza", segment: "suv", launchYear: 2016, discontinued: false, fuelTypes: ["petrol", "diesel", "cng"], transmissions: ["manual", "automatic"], ownershipLimit: 4, mileageRange: { min: 0, max: 280000 }, resaleDemand: 1.30, basePriceLakh: 9.5, enabled: true },
  { brandSlug: "maruti", slug: "ertiga", name: "Ertiga", segment: "mpv", launchYear: 2012, discontinued: false, fuelTypes: ["petrol", "cng"], transmissions: ["manual", "automatic"], ownershipLimit: 4, mileageRange: { min: 0, max: 320000 }, resaleDemand: 1.22, basePriceLakh: 10.5, enabled: true },

  // Hyundai
  { brandSlug: "hyundai", slug: "creta", name: "Creta", segment: "suv", launchYear: 2015, discontinued: false, fuelTypes: ["petrol", "diesel"], transmissions: ["manual", "automatic"], ownershipLimit: 4, mileageRange: { min: 0, max: 300000 }, resaleDemand: 1.25, basePriceLakh: 12, enabled: true },
  { brandSlug: "hyundai", slug: "verna", name: "Verna", segment: "sedan", launchYear: 2006, discontinued: false, fuelTypes: ["petrol", "diesel"], transmissions: ["manual", "automatic"], ownershipLimit: 4, mileageRange: { min: 0, max: 280000 }, resaleDemand: 1.20, basePriceLakh: 11, enabled: true },

  // Tata
  { brandSlug: "tata", slug: "nexon", name: "Nexon", segment: "suv", launchYear: 2017, discontinued: false, fuelTypes: ["petrol", "diesel"], transmissions: ["manual", "automatic"], ownershipLimit: 4, mileageRange: { min: 0, max: 250000 }, resaleDemand: 1.28, basePriceLakh: 9.5, enabled: true },
  { brandSlug: "tata", slug: "harrier", name: "Harrier", segment: "suv", launchYear: 2019, discontinued: false, fuelTypes: ["diesel"], transmissions: ["manual", "automatic"], ownershipLimit: 4, mileageRange: { min: 0, max: 280000 }, resaleDemand: 1.24, basePriceLakh: 16, enabled: true },

  // Mahindra
  { brandSlug: "mahindra", slug: "thar", name: "Thar", segment: "suv", launchYear: 2010, discontinued: false, fuelTypes: ["diesel", "petrol"], transmissions: ["manual", "automatic"], ownershipLimit: 4, mileageRange: { min: 0, max: 300000 }, resaleDemand: 1.40, basePriceLakh: 15, enabled: true },
  { brandSlug: "mahindra", slug: "xuv700", name: "XUV700", segment: "suv", launchYear: 2021, discontinued: false, fuelTypes: ["petrol", "diesel"], transmissions: ["manual", "automatic"], ownershipLimit: 4, mileageRange: { min: 0, max: 200000 }, resaleDemand: 1.35, basePriceLakh: 18, enabled: true },

  // Add more brands similarly...
  { brandSlug: "kia", slug: "seltos", name: "Seltos", segment: "suv", launchYear: 2019, discontinued: false, fuelTypes: ["petrol", "diesel"], transmissions: ["manual", "automatic"], ownershipLimit: 4, mileageRange: { min: 0, max: 250000 }, resaleDemand: 1.22, basePriceLakh: 12.5, enabled: true },
  { brandSlug: "bmw", slug: "3-series", name: "3 Series", segment: "sedan", launchYear: 2019, discontinued: false, fuelTypes: ["petrol", "diesel"], transmissions: ["automatic"], ownershipLimit: 3, mileageRange: { min: 0, max: 200000 }, resaleDemand: 1.18, basePriceLakh: 55, enabled: true },
  { brandSlug: "mercedes", slug: "c-class", name: "C-Class", segment: "sedan", launchYear: 2022, discontinued: false, fuelTypes: ["petrol"], transmissions: ["automatic"], ownershipLimit: 3, mileageRange: { min: 0, max: 180000 }, resaleDemand: 1.15, basePriceLakh: 60, enabled: true },
];

export const CAR_MODELS_SIMPLE = {
  toyota: ["Innova Crysta", "Fortuner", "Camry", "Glanza", "Urban Cruiser"],
  maruti: ["Swift", "Brezza", "Ertiga", "Baleno", "Dzire"],
  hyundai: ["Creta", "Venue", "Verna", "i20"],
  tata: ["Nexon", "Harrier", "Safari", "Punch"],
  mahindra: ["Thar", "XUV700", "Scorpio N"],
  kia: ["Seltos", "Sonet", "Carens"],
  bmw: ["3 Series", "5 Series", "X3", "X5"],
  mercedes: ["C-Class", "E-Class", "GLC"],
  // ... add more
};