import { notFound }
from "../../../shared/utils/errors.js";

import { VehicleModel }
from "../models/vehicle-model.model.js";

import { VehicleFuelType }
from "../models/vehicle-fuel-type.model.js";

import { VehicleTransmission }
from "../models/vehicle-transmission.model.js";

class MileageRepository {

  async getMileageBaseData({
    modelId,
    fuelTypeId,
    transmissionId,
  }) {

    const model =
      await VehicleModel
        .findOne({
          _id: modelId,
          enabled: true,
        })
        .lean();

    if (!model) {

      throw notFound(
        "Vehicle model not found"
      );
    }

    const fuelType =
      await VehicleFuelType
        .findOne({
          _id: fuelTypeId,
          enabled: true,
        })
        .lean();

    if (!fuelType) {

      throw notFound(
        "Fuel type not found"
      );
    }

    const transmission =
      await VehicleTransmission
        .findOne({
          _id: transmissionId,
          enabled: true,
        })
        .lean();

    if (!transmission) {

      throw notFound(
        "Transmission not found"
      );
    }

    return {
      model,
      fuelType,
      transmission,
    };
  }
}

export default new MileageRepository();