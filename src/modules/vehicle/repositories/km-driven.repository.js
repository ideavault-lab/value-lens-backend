import { notFound } from "../../../shared/utils/errors.js";
import { VehicleModel } from "../models/vehicle-model.model.js";
import { VehicleVariant } from "../models/vehicle-variant.model.js";
import { VehicleFuelType } from "../models/vehicle-fuel-type.model.js";
import { VehicleTransmission } from "../models/vehicle-transmission.model.js";

class KMDrivenRepository {

  async getBaseData({ modelId, variantId }) {

    // Step 1 — get model + variant in parallel
    const [model, variant] = await Promise.all([
      VehicleModel.findOne({ _id: modelId, enabled: true }).lean(),
      VehicleVariant.findOne({ _id: variantId, enabled: true }).lean(),
    ]);

    if (!model)   throw notFound("Vehicle model not found");
    if (!variant) throw notFound("Vehicle variant not found");

    // Step 2 — get fuelType + transmission in parallel using IDs from variant
    const [fuelType, transmission] = await Promise.all([
      VehicleFuelType.findOne({ _id: variant.fuelTypeId, enabled: true }).lean(),
      VehicleTransmission.findOne({ _id: variant.transmissionId, enabled: true }).lean(),
    ]);

    if (!fuelType)     throw notFound("Fuel type not found");
    if (!transmission) throw notFound("Transmission not found");

    return { model, fuelType, transmission };
  }
}

export default new KMDrivenRepository();