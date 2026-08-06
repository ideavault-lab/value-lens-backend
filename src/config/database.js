import mongoose from "mongoose";

import { env } from "./env.js";

export async function connectDatabase() {
  try {
    await mongoose.connect(
      env.MONGO_URI,
      {
        dbName: env.MONGO_DB_NAME,
      }
    );

    console.log(
      "MongoDB connected successfully"
    );
  } catch (error) {
    console.error(
      "MongoDB connection failed",
      error
    );

    process.exit(1);
  }
}