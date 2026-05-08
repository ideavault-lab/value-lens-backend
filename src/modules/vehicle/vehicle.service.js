import vehicleRepository from "./vehicle.repository.js";

class VehicleService {
    async getVehicleTypes() {
        return vehicleRepository.getVehicleTypes();
    }
    async getBrands(type) {
        return vehicleRepository.getBrands(type);
    }

    async getModels(type, brandId) {
        return vehicleRepository.getModels(type, brandId);
    }
}

export default new VehicleService();