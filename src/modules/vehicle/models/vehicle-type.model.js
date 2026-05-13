import mongoose from "mongoose";

const vehicleTypeSchema =
  new mongoose.Schema(
    {
      slug: {
        type: String,

        required: true,

        unique: true,

        trim: true,
      },

      label: {
        type: String,

        required: true,
      },

      shortLabel: String,

      description: String,

      icon: String,

      enabled: Boolean,

      popular: Boolean,

      order: Number,

      cta: String,

      stats: {
        supportedBrands: Number,

        activeListings: String,
      },

      seo: {
        title: String,

        slug: String,
      },
    },
    {
      timestamps: true,
    }
  );

export const VehicleType =
  mongoose.model(
    "VehicleType",
    vehicleTypeSchema
  );