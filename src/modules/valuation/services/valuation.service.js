import { badRequest }
  from "../../../shared/utils/errors.js";

import carEngine
  from "../engines/car.engine.js";

import draftMapper from "../mappers/draft.mapper.js";


class EstimatorService {

  /*
   * Used when form already exists
   */
  async estimate(form) {

    const engine =
      this.resolveEngine(
        form.vehicleType
      );

    return engine.calculate(form);
  }

  /*
   * Used when valuation starts from Redis draft
   */
  async estimateFromDraft(draft) {

    const form =
      await draftMapper.toEngineInput(
        draft
      );

    console.log("EstimatorService: estimateFromDraft: form:", form);

    return this.estimate(form);
  }


  resolveEngine(vehicleType) {

    const slug =
      vehicleType?.slug ??
      vehicleType;

    switch (slug) {

      case "car":
        return carEngine;

      // case "bike":
      //   return bikeEngine;

      // case "truck":
      //   return truckEngine;

      default:

        throw badRequest(
          `Unsupported vehicle type: ${slug}`
        );
    }
  }
}

export default new EstimatorService();