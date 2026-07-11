import { badRequest }
  from "../../../shared/utils/errors.js";
import vehicleRepository from "../../vehicle/repositories/vehicle.repository.js";
import DraftService from "../../vehicle/services/draft-service.js";

import carEngine
  from "../engines/car.engine.js";

import draftMapper from "../mappers/draft.mapper.js";
import valuationCacheService from "./valuation-cache.service.js";


class EstimatorService {

 async getDraftMeta({
  userId,
  draftId,
  redis,
}) {

  //
  // 1. Try Redis Draft
  //

  try {

    const draftService = new DraftService(redis);

    const draft = await draftService.getDraft(
      userId,
      draftId
    );

    if (draft) {

      const vehicle =
        await vehicleRepository.getDraftMeta({

          vehicleType:
            draft.vehicleType,

          brandId:
            draft.brandId,

          modelId:
            draft.modelId,

          variantId:
            draft.variantId,
        });

      console.log("EstimatorService: getDraftMeta: vehicle:", vehicle);

      return {

        ...vehicle,
        brand:{
          id: vehicle.brand?.id,
          name: vehicle.brand?.name,
          logo: vehicle.brand?.logo?.light,
        },
        variant: {
          id: draft.variantId,
          name: vehicle.variant?.name,
          fuelType: vehicle.variant?.fuelType,
          transmission: vehicle.variant?.transmission,
        },
        year:
          draft.year ??
          vehicle.year,

        ownerType:
          draft.ownership,

        condition: draft.condition,

        location: draft.city,
      };
    }
  } catch (_) {}

  //
  // 2. Fallback to Mongo Cache
  //

  return valuationCacheService.getMeta(draftId);
}
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