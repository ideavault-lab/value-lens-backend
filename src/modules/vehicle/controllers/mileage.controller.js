

import { successResponse } from "../../../shared/utils/api-response.js";
import MileageService
from "../services/mileage.service.js";

class MileageController {

  async getMileageInsights(
    request,
    reply
  ) {

    const payload =
      request.query;

    const data =
      await MileageService
        .getMileageInsights(
          payload
        );

    return reply.send(
      successResponse({
        data,
        message:
          "Mileage insights retrieved successfully",
      })
    );
  }
}

export default new MileageController();