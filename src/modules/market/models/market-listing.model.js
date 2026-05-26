import mongoose from "mongoose";

const marketListingSchema =
  new mongoose.Schema(
    {
      vehicleType: {
        type: String,
        required: true,
        index: true,
      },

      source: {
        type: String,
        required: true,
      },

      brand: {
        type: String,
        required: true,
        index: true,
      },

      model: {
        type: String,
        required: true,
        index: true,
      },

      variant: {
        type: String,
      },

      year: {
        type: Number,
        default: null,
      },

      kmDriven: {
        type: Number,
        default: null,
      },

      fuelType: {
        type: String,
      },

      transmission: {
        type: String,
      },

      ownership: {
        type: String,
      },

      city: {
        type: String,
        index: true,
      },

      price: {
        type: Number,
        required: true,
        index: true,
      },

      listingUrl: {
        type: String,
      },

      scrapedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

export const MarketListing =
  mongoose.model(
    "MarketListing",
    marketListingSchema
  );