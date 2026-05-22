import { VehicleTransmission }
from "../modules/vehicle/models/vehicle-transmission.model.js";
import { VEHICLE_TRANSMISSIONS } from "./data/vehicle-transmission.data.js";


export async function seedVehicleTransmissions() {

  await VehicleTransmission.deleteMany();

  await VehicleTransmission.insertMany(
    VEHICLE_TRANSMISSIONS
  );

  console.log(
    "✓ Vehicle transmissions seeded"
  );
}
