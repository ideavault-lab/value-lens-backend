import { notFound } from "../../shared/utils/errors.js";
import {
  VEHICLE_DATA,
  VEHICLE_TYPES,
} from "./data/shared.data.js";



class VehicleRepository {
  async getVehicleTypes() {
    return VEHICLE_TYPES.sort(
      (a, b) => a.order - b.order
    );
  }

  async getBrands(type) {
    const vehicle = VEHICLE_DATA[type];

    if (!vehicle) {
      throw notFound("Vehicle type not found");
    }

    return vehicle.brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      country: brand.country,

      logo: {
        light: brand.logo.light,
        dark: brand.logo.dark,
      },
    }));
  }

  async getModels(type, brandId) {
    const vehicle = VEHICLE_DATA[type];

    if (!vehicle) {
      throw notFound("Vehicle type not found");
    }

    const brand = vehicle.brands.find(
      (item) => item.id === brandId
    );

    if (!brand) {
      throw notFound("Brand not found");
    }

    return brand.models.map((model) => ({
      id: model.id,
      name: model.name,
    }));
  }
}

export default new VehicleRepository();