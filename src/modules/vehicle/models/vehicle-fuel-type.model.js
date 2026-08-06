import mongoose from "mongoose";

const fuelTypeSchema =
  new mongoose.Schema(
    {
      slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },

      name: {
        type: String,
        required: true,
      },

      icon: {
        type: String,
      },

      description: {
        type: String,
      },

      enabled: {
        type: Boolean,
        default: true,
      },

      sortOrder: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
    }
  );

export const VehicleFuelType =
  mongoose.model(
    "VehicleFuelType",
    fuelTypeSchema
  );