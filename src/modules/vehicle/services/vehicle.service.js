import vehicleRepository from "../repositories/vehicle.repository.js";

class VehicleService {
    async getVehicleTypes() {
        return vehicleRepository.getVehicleTypes();
    }
    async getBrands(type, search) {
        return vehicleRepository.getBrands(
            type,
            search
        );
    }

    async getModels(type, brandId, search) {
        return vehicleRepository.getModels(type, brandId , search);
    }

    async getVariants(
  type,
  brandId,
  modelId,
  year,
  search
) {

  return vehicleRepository.getVariants(
    type,
    brandId,
    modelId,
    year,
    search
  );
}
}

export default new VehicleService();