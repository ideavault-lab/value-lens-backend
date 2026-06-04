import { MarketListing }
  from "../../market/models/market-listing.model.js";

class ValuationRepository {

  async findComparableVehicles({

    brand,
    model,
    fuelType,
    transmission,
    year,
  }) {

    return MarketListing.find({

      brand,

      model,

      fuelType,

      transmission,

      year: {
        $gte: year - 2,
        $lte: year + 1,
      },

      price: {
        $gt: 100000,
      },
    }).lean();
  }
}

export default new ValuationRepository();