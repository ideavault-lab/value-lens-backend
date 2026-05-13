// seed-vehicle-brands.js

import { VehicleType }
from "../modules/vehicle/models/vehicle-type.model.js";

import { VehicleBrand }
from "../modules/vehicle/models/vehicle-brand.model.js";

import { VEHICLE_BRANDS }
from "./data/vehicle-brands.data.js";

export async function seedVehicleBrands() {

  await VehicleBrand.deleteMany();

  const brands = [];

  for (const brand of VEHICLE_BRANDS) {

    const vehicleType =
      await VehicleType.findOne({
        slug:
          brand.vehicleTypeSlug,
      });

    if (!vehicleType) {
      throw new Error(
        `Vehicle type not found: ${brand.vehicleTypeSlug}`
      );
    }

    brands.push({
      vehicleTypeId:
        vehicleType._id,

      // IMPORTANT
      slug:
        brand.slug,

      name:
        brand.name,

      shortName:
        brand.shortName,

      country:
        brand.country,

      logo:
        brand.logo,

      featured:
        brand.featured,

      popularityScore:
        brand.popularityScore,

      segment:
        brand.segment,

      resaleStrength:
        brand.resaleStrength,

      serviceNetwork:
        brand.serviceNetwork,

      enabled:
        brand.enabled,

      seo:
        brand.seo,
    });
  }

  await VehicleBrand.insertMany(
    brands
  );

  console.log(
    "✓ Vehicle brands seeded"
  );
}