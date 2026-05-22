import { successResponse } from "../../../shared/utils/api-response.js";
import vehicleService from "../services/vehicle.service.js";

class VehicleController {
    async getVehicleTypes(request, reply) {
        const data = await vehicleService.getVehicleTypes();

        return reply.send(successResponse({ data, message: "Vehicle types retrieved successfully" }));
    }

    async getBrands(request, reply) {
        const { type } = request.params;

        const { search = "" } =
            request.query;

        const data =
            await vehicleService.getBrands(
                type,
                search
            );

        return reply.send(successResponse({ data, message: "Brands retrieved successfully" }));
    }

    async getModels(request,reply) {

        const {
            type,
            brandId,
        } = request.params;

        const {
            search,
        } = request.query;

        const data =
            await vehicleService.getModels(
                type,
                brandId,
                search
            );

        return reply.send(successResponse({ data,message:"Models retrieved successfully",})
        );
    }

    async getVariants(request, reply) {

  const {
    type,
    brandId,
    modelId,
  } = request.params;

  const {
    year,
    search,
  } = request.query;

  const data =
    await vehicleService.getVariants(
      type,
      brandId,
      modelId,
      year,
      search
    );

  return reply.send(
    successResponse({
      data,
      message:
        "Variants retrieved successfully",
    })
  );
}
}

export default new VehicleController();