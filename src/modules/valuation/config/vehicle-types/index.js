// src/valuation/config/vehicle-types/index.js

import carConfig  from "./car.config.js";
import bikeConfig from "./bike.config.js";
// import truckConfig from "./truck.config.js";   // add when ready

const REGISTRY = {
  car:  carConfig,
  bike: bikeConfig,
  // truck: truckConfig,
};

/**
 * Returns config for a vehicle type, falling back to car config
 * if a type isn't configured yet. This means dropping in a new
 * vehicleType in the DB never crashes the engine — it just behaves
 * like a car until you add a real config.
 */
export function getVehicleConfig(slug) {
  const config = REGISTRY[slug];
  if (!config) {
    console.warn(`[VehicleConfig] No config for "${slug}" — falling back to car config`);
    return REGISTRY.car;
  }
  return config;
}