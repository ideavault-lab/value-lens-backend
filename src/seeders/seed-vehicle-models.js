import { VehicleBrand }
from "../modules/vehicle/models/vehicle-brand.model.js";

import { VehicleModel }
from "../modules/vehicle/models/vehicle-model.model.js";

import { VehicleFuelType }
from "../modules/vehicle/models/vehicle-fuel-type.model.js";

import { VehicleTransmission }
from "../modules/vehicle/models/vehicle-transmission.model.js";

import { VEHICLE_MODELS }
from "./data/vehicle-models.data.js";

export async function seedVehicleModels() {

  await VehicleModel.deleteMany();

  const models = [];

  for (const model of VEHICLE_MODELS) {

    // brand
    const brand =
      await VehicleBrand.findOne({
        slug: model.brandSlug,
      });

    if (!brand) {
      throw new Error(
        `Brand not found: ${model.brandSlug}`
      );
    }

    // fuel types
    const fuelTypes =
      await VehicleFuelType.find({
        slug: {
          $in: model.fuelTypes,
        },
      });

    // transmissions
    const transmissions =
      await VehicleTransmission.find({
        slug: {
          $in: model.transmissions,
        },
      });

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

      // ✅ SAVE IDS
      fuelTypeIds:
        fuelTypes.map(
          (fuel) => fuel._id
        ),

      transmissionIds:
        transmissions.map(
          (transmission) =>
            transmission._id
        ),

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