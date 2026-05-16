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
}

export default new VehicleService();