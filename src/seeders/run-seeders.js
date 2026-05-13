import mongoose from "mongoose";

import { env } from "../config/env.js";


import { seedVehicleTypes }
from "./seed-vehicle-types.js";

import { seedVehicleBrands }
from "./seed-vehicle-brands.js";

import { seedVehicleModels }
from "./seed-vehicle-models.js";

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

    await seedVehicleTypes();

    await seedVehicleBrands();

    await seedVehicleModels();

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