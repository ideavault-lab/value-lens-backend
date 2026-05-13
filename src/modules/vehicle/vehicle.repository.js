

import { notFound } from "../../shared/utils/errors.js";
import { VehicleModel } from "./models/vehicle-model.model.js";
import { VehicleType } from "./models/vehicle-type.model.js";
import { VehicleBrand } from "./models/vehicle-brand.model.js";

class VehicleRepository {

  //vehicle types
  async getVehicleTypes() {
    const res = await VehicleType
      .find()
      .sort({
        order: 1,
      })
      .lean();

    return res.map(({ _id, ...rest }) => ({
      id: _id,
      ...rest,
    }));
  }

  // brands
  async getBrands(type, search = "") {

    const vehicleType =
      await VehicleType.findOne({
        slug: type,
        enabled: true,
      }).lean();

    if (!vehicleType) {
      throw notFound(
        "Vehicle type not found"
      );
    }

    const query = {
      vehicleTypeId: vehicleType._id,
      enabled: true,
    };

    // SEARCH
    if (search?.trim()) {
      query.name = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    const brands =
      await VehicleBrand.find(query)
        .select({
          slug: 1,
          name: 1,
          country: 1,
          logo: 1,
        })
        .sort({
          popularityScore: -1,
        })
        .lean();

    return brands.map(
      ({ _id, ...rest }) => ({
        id: _id.toString(),
        ...rest,
      })
    );
  }


  // models
  async getModels(
    type,
    brandId,
    search = ""
  ) {

    const vehicleType =
      await VehicleType
        .findOne({
          slug: type,
          enabled: true,
        })
        .lean();

    if (!vehicleType) {

      throw notFound(
        "Vehicle type not found"
      );
    }

    const brand =
      await VehicleBrand
        .findOne({
          _id: brandId,

          vehicleTypeId:
            vehicleType._id,

          enabled: true,
        })
        .lean();

    if (!brand) {

      throw notFound(
        "Brand not found"
      );
    }

    const filter = {

      brandId: brand._id,

      enabled: true,

      ...(search?.trim()
        ? {
          name: {
            $regex:
              search.trim(),

            $options: "i",
          },
        }
        : {}),
    };

    const models =
      await VehicleModel
        .find(filter)

        .select({
          _id: 1,
          name: 1,
          slug: 1,
        })

        .sort({
          name: 1,
        })

        .lean();

    return models.map(
      ({ _id, ...rest }) => ({
        id: _id,
        ...rest,
      })
    );
  }
}

export default new VehicleRepository();