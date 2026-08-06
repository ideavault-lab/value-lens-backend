import mongoose from "mongoose";

import { env } from "../config/env.js";


import { seedVehicleTypes }
  from "./seed-vehicle-types.js";

import { seedVehicleBrands }
  from "./seed-vehicle-brands.js";

import { seedVehicleModels }
  from "./seed-vehicle-models.js";

import { seedVehicleVariants } from "./seed-vehicle-variants.js";
import { seedVehicleFuelTypes } from "./vehicle-fuel-type.js";
import { seedVehicleTransmissions } from "./vehicle-transmission.js";



async function runSeeders() {

  try {

    await mongoose.connect(
      env.MONGO_URI,
      {
        dbName:
          env.MONGO_DB_NAME,
      }
    );

    console.log(
      "MongoDB connected"
    );
    // MASTER DATA
    await seedVehicleFuelTypes(); 
    await seedVehicleTransmissions(); 
    await seedVehicleTypes(); 
    await seedVehicleBrands(); 
    // DEPENDENT DATA 
    await seedVehicleModels(); 
    await seedVehicleVariants();

    console.log(
      "All seeders completed"
    );

    process.exit(0);

  } catch (error) {

    console.error(error);

    process.exit(1);
  }
}

runSeeders();