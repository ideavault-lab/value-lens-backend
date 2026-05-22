import { successResponse } from "../../../shared/utils/api-response.js";
import kmDrivenService from "../services/km-driven.service.js";

class KMDrivenController {
  async getInsights(request, reply) {
    const data = await kmDrivenService.getKMDrivenInsights(request.query);
    return reply.send(
      successResponse({
        data,
        message: "KM driven insights retrieved successfully",
      })
    );
  }
}

export default new KMDrivenController();