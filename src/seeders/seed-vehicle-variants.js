
import { VehicleVariant }
from "../modules/vehicle/models/vehicle-variant.model.js";

import { VehicleModel }
from "../modules/vehicle/models/vehicle-model.model.js";

import { VehicleFuelType }
from "../modules/vehicle/models/vehicle-fuel-type.model.js";

import { VehicleTransmission }
from "../modules/vehicle/models/vehicle-transmission.model.js";

import { VEHICLE_VARIANTS }
from "./data/vehicle-variants.data.js";

export async function seedVehicleVariants() {

  await VehicleVariant.deleteMany();

  const variants = [];

  for (const variant of VEHICLE_VARIANTS) {

    const model =
      await VehicleModel.findOne({
        slug: variant.modelSlug,
      });

    if (!model) {
      throw new Error(
        `Model not found: ${variant.modelSlug}`
      );
    }

    const fuelType =
      await VehicleFuelType.findOne({
        slug: variant.fuelType,
      });

    if (!fuelType) {
      throw new Error(
        `Fuel type not found: ${variant.fuelType}`
      );
    }

    const transmission =
      await VehicleTransmission.findOne({
        slug: variant.transmission,
      });

    if (!transmission) {
      throw new Error(
        `Transmission not found: ${variant.transmission}`
      );
    }

    variants.push({

      modelId: model._id,

      year: variant.year,

      slug: variant.slug,

      name: variant.name,

      fuelTypeId: fuelType._id,

      transmissionId:
        transmission._id,

      engineCc:
        variant.engineCc,

      mileage:
        variant.mileage,

      powerBhp:
        variant.powerBhp,

      torqueNm:
        variant.torqueNm,

      drivetrain:
        variant.drivetrain,

      exShowroomPriceLakh:
        variant.exShowroomPriceLakh,

      enabled: true,
    });
  }

  await VehicleVariant.insertMany(
    variants
  );

  console.log(
    "✓ Vehicle variants seeded"
  );
}
