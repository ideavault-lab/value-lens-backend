import DraftService
  from "../../vehicle/services/draft-service.js";



import {
  successResponse,
} from "../../../shared/utils/api-response.js";

import estimatorService
  from "../services/valuation.service.js";

class EstimatorController {

  async getValuation(request, reply) {

    const { draftId } =
      request.params;

    const userId = 1;

    const draftService =
      new DraftService(
        request.server.redis
      );

    const draft =
      await draftService.getDraft(
        userId,
        draftId
      );

    if (!draft) {

      return reply.status(404).send({
        status: false,
        message: "Draft not found",
      });
    }

    const valuation =
      await estimatorService
        .estimateFromDraft(
          draft
        );

    return reply.send(
      successResponse({
        data: valuation,
        message:
          "Valuation generated successfully",
      })
    );
  }

  async estimate(request, reply) {

    const valuation =
      await estimatorService
        .estimate(
          request.body
        );

    return reply.send(
      successResponse({
        data: valuation,
        message:
          "Vehicle resale value estimated successfully",
      })
    );
  }
}

export default new EstimatorController();