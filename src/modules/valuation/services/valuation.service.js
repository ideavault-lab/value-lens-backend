import { badRequest } from "../../../shared/utils/errors.js";
import carEngine from "../engines/car.engine.js";

/**
 * ValuationService
 *
 * Routes to the correct engine by vehicleType.
 * Adding bike or truck is one new import + one new case.
 */
class ValuationService {
  async estimate(form) {
    const engine = this.resolveEngine(form.vehicleType);
    return engine.calculate(form);
  }

  resolveEngine(vehicleType) {
    const slug = vehicleType?.slug ?? vehicleType;

    switch (slug) {
      case "car":
        return carEngine;

      // case "bike":
      //   return bikeEngine;

      // case "truck":
      //   return truckEngine;

      default:
        throw badRequest(`Unsupported vehicle type: ${slug}`);
    }
  }
}

export default new ValuationService();