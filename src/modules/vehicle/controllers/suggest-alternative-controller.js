import { successResponse } from "../../../shared/utils/api-response.js";
import { suggestAlternatives } from "../../valuation/services/suggest-alternative.js";

class SuggestionController {
  async getSuggestedAlternatives(request, reply) {
    const data = await suggestAlternatives({
      currentModelId: request.query?.modelId,
      predictedValueLakh: request.query?.predictedPrice,
      vehicleAgeYears: request.query?.vehicleAgeYears,
    });
    return reply.send(
      successResponse({
        data,
        message: "Suggested alternatives retrieved successfully",
      })
    );
  }
}

export default new SuggestionController();