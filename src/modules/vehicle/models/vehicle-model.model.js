import mongoose from "mongoose";

const vehicleModelSchema =
  new mongoose.Schema(
    {
      brandId: {
        type:
          mongoose.Schema.Types.ObjectId,

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

      fuelTypes: [
        {
          type: String,
        },
      ],

      transmissions: [
        {
          type: String,
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

vehicleModelSchema.index({
  brandId: 1,
  slug: 1,
}, {
  unique: true,
});

export const VehicleModel =
  mongoose.model(
    "VehicleModel",
    vehicleModelSchema
  );