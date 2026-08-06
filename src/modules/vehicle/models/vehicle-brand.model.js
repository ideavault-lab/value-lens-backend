// vehicle-brand.model.js

import mongoose from "mongoose";

const vehicleBrandSchema =
  new mongoose.Schema(
    {
      vehicleTypeId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "VehicleType",

        required: true,
      },

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

      shortName: String,

      country: String,

      logo: {
        light: String,
        dark: String,
      },

      featured: Boolean,

      popularityScore: Number,

      segment: String,

      resaleStrength: String,

      serviceNetwork: String,

      enabled: Boolean,

      seo: {
        slug: String,
        title: String,
      },
    },
    {
      timestamps: true,
    }
  );

export const VehicleBrand =
  mongoose.model(
    "VehicleBrand",
    vehicleBrandSchema
  );