
import mongoose from "mongoose";

const vehicleVariantSchema =
  new mongoose.Schema(
    {
      modelId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "VehicleModel",

        required: true,
      },

      year: {
        type: Number,
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

      fuelTypeId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "VehicleFuelType",

        required: true,
      },

      transmissionId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "VehicleTransmission",

        required: true,
      },

      engineCc: {
        type: Number,
      },

      mileage: {
        type: Number,
      },

      powerBhp: {
        type: Number,
      },

      torqueNm: {
        type: Number,
      },

      drivetrain: {
        type: String,
      },

      exShowroomPriceLakh: {
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

vehicleVariantSchema.index(
  {
    modelId: 1,
    slug: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

export const VehicleVariant =
  mongoose.model(
    "VehicleVariant",
    vehicleVariantSchema
  );