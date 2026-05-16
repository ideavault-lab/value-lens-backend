

import { notFound } from "../../../shared/utils/errors.js";
import { VehicleModel } from "../models/vehicle-model.model.js";
import { VehicleType } from "../models/vehicle-type.model.js";
import { VehicleBrand } from "../models/vehicle-brand.model.js";

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

  const res =
    await VehicleModel
      .find(filter)

      .select({
        _id: 1,

        name: 1,

        slug: 1,

        launchYear: 1,

        fuelTypeIds: 1,

        transmissionIds: 1,
      })

      .populate({
        path: "fuelTypeIds",

      select: "_id slug name icon description",
      })

      .populate({
        path: "transmissionIds",

        select: "_id slug name icon description",
      })

      .sort({
        name: 1,
      })

      .lean();

  const models = res.map(
    ({
      _id,

      fuelTypeIds,

      transmissionIds,

      ...rest
    }) => ({

      id: _id,

      ...rest,

      fuelTypes:
        fuelTypeIds.map(
          (fuel) => ({
            id: fuel._id,

            slug:
              fuel.slug,

            name:
              fuel.name,

            icon:
              fuel.icon,

            description:
              fuel.description,
          })
        ),

      transmissions:
        transmissionIds.map(
          (transmission) => ({
            id: transmission._id,

            slug:
              transmission.slug,

            name:
              transmission.name,

            icon:
              transmission.icon,

            description:
              transmission.description,
          })
        ),
    })
  );

  return models;
}
}

export default new VehicleRepository();