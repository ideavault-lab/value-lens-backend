import mileageRepository
from "../repositories/mileage.repository.js";

import mileageGenerator
from "../generators/mileage.generator.js";

class MileageService {

  async getMileageInsights(
    payload
  ) {

    const baseData =
      await mileageRepository
        .getMileageBaseData(
          payload
        );

    return mileageGenerator
      .generate({

        model:
          baseData.model,

        fuelType:
          baseData.fuelType,

        transmission:
          baseData.transmission,

        year:
          payload.year,
      });
  }
}

export default new MileageService();