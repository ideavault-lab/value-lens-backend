import { VehicleType }
from "../modules/vehicle/models/vehicle-type.model.js";

import { VEHICLE_TYPES }
from "./data/vehicle-types.data.js";

export async function seedVehicleTypes() {

  await VehicleType.deleteMany();

  await VehicleType.insertMany(
    VEHICLE_TYPES.map((type) => ({
      slug:
        type.slug,

      label:
        type.label,

      shortLabel:
        type.shortLabel,

      description:
        type.description,

      icon:
        type.icon,

      enabled:
        type.enabled,

      popular:
        type.popular,

      order:
        type.order,

      cta:
        type.cta,

      stats:
        type.stats,

      seo:
        type.seo,
    }))
  );

  console.log(
    "✓ Vehicle types seeded"
  );
}