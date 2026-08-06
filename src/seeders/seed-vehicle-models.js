// seeders/vehicle-model.seed.js

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
        slug: model.brandSlug,
      });

    if (!brand) {

      throw new Error(
        `Brand not found: ${model.brandSlug}`
      );
    }

    models.push({

      brandId: brand._id,

      slug: model.slug,

      name: model.name,

      description:
        model.description,

      image:
        model.image,

      segment:
        model.segment,

      launchYear:
        model.launchYear,

      discontinued:
        model.discontinued,

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