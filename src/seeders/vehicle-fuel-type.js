import { VehicleFuelType }
from "../modules/vehicle/models/vehicle-fuel-type.model.js";
import { VEHICLE_FUEL_TYPES } from "./data/vehicle-fuel-type.data.js";


export async function seedVehicleFuelTypes() {

  await VehicleFuelType.deleteMany();

  await VehicleFuelType.insertMany(
    VEHICLE_FUEL_TYPES
  );

  console.log(
    "✓ Vehicle fuel types seeded"
  );
}
