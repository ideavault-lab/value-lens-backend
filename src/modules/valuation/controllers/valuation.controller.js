import DraftService
  from "../../vehicle/services/draft-service.js";



import {
  successResponse,
} from "../../../shared/utils/api-response.js";

import estimatorService
  from "../services/valuation.service.js";
import valuationCacheService from "../services/valuation-cache.service.js";

class EstimatorController {

  async getValuation(request, reply) {
    const { draftId } = request.params;
    const userId = 1; // replace with real auth later

    // ── 1. Check MongoDB cache first ─────────────────────────────────────
    const cached = await valuationCacheService.get(draftId);
    if (cached) {
      return reply.send(
        successResponse({ data: cached, message: "Valuation retrieved from cache" })
      );
    }

    // ── 2. Load draft from Redis ──────────────────────────────────────────
    const draftService = new DraftService(request.server.redis);
    const draft = await draftService.getDraft(userId, draftId);

    if (!draft) {
      return reply.status(404).send({ status: false, message: "Draft not found" });
    }

    // ── 3. Run engine ─────────────────────────────────────────────────────
    const result = await estimatorService.estimateFromDraft(draft);

    // ── 4. Persist result ─────────────────────────────────────────────────
    await valuationCacheService.save({
      draftId,
     vehicleType: draft.vehicleType ?? "car",
      form: draft,
      engineResult:result,
    });

    return reply.send(
      successResponse({ data: result, message: "Valuation generated successfully" })
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