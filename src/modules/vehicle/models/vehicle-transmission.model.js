import mongoose from "mongoose";

const transmissionSchema =
  new mongoose.Schema(
    {
      slug: {
        type: String,
        required: true,
        unique: true,
      },

      name: {
        type: String,
        required: true,
      },

      icon: String,

      description: String,

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

export const VehicleTransmission =
  mongoose.model(
    "VehicleTransmission",
    transmissionSchema
  );