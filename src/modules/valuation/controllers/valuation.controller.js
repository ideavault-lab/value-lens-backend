import { successResponse }
  from "../../../shared/utils/api-response.js";
import valuationService from "../services/valuation.service.js";


class EstimatorController {

  async estimate(request, reply) {

   const form =
    request.body;

  const data =
    await valuationService
      .estimate(form);

    return reply.send(
      successResponse({

        data,

        message:
          "Vehicle resale value estimated successfully",
      })
    );
  }
}

export default new EstimatorController();