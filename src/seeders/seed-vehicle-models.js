// seed-vehicle-models.js

import { VehicleBrand }
from "../modules/vehicle/models/vehicle-brand.model.js";

import { VehicleModel }
from "../modules/vehicle/models/vehicle-model.model.js";

import { VEHICLE_MODELS }
from "./data/vehicle-models.data.js";

export async function seedVehicleModels() {

  await VehicleModel.deleteMany();

  const models = [];

  for (const model of VEHICLE_MODELS) {

    const brand =
      await VehicleBrand.findOne({
        slug:
          model.brandSlug,
      });

    if (!brand) {
      throw new Error(
        `Brand not found: ${model.brandSlug}`
      );
    }

    models.push({
      brandId:
        brand._id,

      slug:
        model.slug,

      name:
        model.name,

      segment:
        model.segment,

      launchYear:
        model.launchYear,

      discontinued:
        model.discontinued,

      fuelTypes:
        model.fuelTypes,

      transmissions:
        model.transmissions,

      ownershipLimit:
        model.ownershipLimit,

      mileageRange:
        model.mileageRange,

      resaleDemand:
        model.resaleDemand,

      basePriceLakh:
        model.basePriceLakh,

      enabled:
        model.enabled,
    });
  }

  await VehicleModel.insertMany(
    models
  );

  console.log(
    "✓ Vehicle models seeded"
  );
}