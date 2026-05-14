import mongoose from "mongoose";

// ✅ IMPORTANT
// import models so mongoose registers them
import "./vehicle-fuel-type.model.js";
import "./vehicle-transmission.model.js";

const vehicleModelSchema =
  new mongoose.Schema(
    {
      brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VehicleBrand",
        required: true,
      },

      slug: {
        type: String,
        required: true,
        trim: true,
      },

      name: {
        type: String,
        required: true,
      },

      description: {
        type: String,
      },

      image: {
        type: String,
      },

      segment: {
        type: String,
      },

      launchYear: {
        type: Number,
      },

      discontinued: {
        type: Boolean,
        default: false,
      },

      // ✅ CORRECT REF NAME
      fuelTypeIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "VehicleFuelType",
        },
      ],

      // ✅ CORRECT REF NAME
      transmissionIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "VehicleTransmission",
        },
      ],

      ownershipLimit: {
        type: Number,
        default: 4,
      },

      mileageRange: {
        min: Number,
        max: Number,
      },

      resaleDemand: {
        type: Number,
        default: 1,
      },

      basePriceLakh: {
        type: Number,
      },

      enabled: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

vehicleModelSchema.index(
  {
    brandId: 1,
    slug: 1,
  },
  {
    unique: true,
  }
);

export const VehicleModel =
  mongoose.model(
    "VehicleModel",
    vehicleModelSchema
  );