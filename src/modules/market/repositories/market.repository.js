import { MarketListing } from "../models/market-listing.model.js";

class MarketRepository {

  async createMany(data) {

    return MarketListing.insertMany(data);
  }

  async findSimilarVehicles({
    brand,
    model,
    year,
    city,
  }) {

    return MarketListing.find({

      brand,

      model,

      year: {
        $gte: year - 1,
        $lte: year + 1,
      },

      ...(city
        ? { city }
        : {}),
    })
      .sort({
        price: 1,
      })
      .lean();
  }
}

export default new MarketRepository();