

import { notFound } from "../../../shared/utils/errors.js";
import { VehicleModel } from "../models/vehicle-model.model.js";
import { VehicleType } from "../models/vehicle-type.model.js";
import { VehicleBrand } from "../models/vehicle-brand.model.js";
import { VehicleVariant } from "../models/vehicle-variant.model.js";

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
          image: 1,
          segment: 1,
        })

        .sort({
          name: 1,
        })

        .lean();

    return res.map(
      ({
        _id,
        ...rest
      }) => ({
        id: _id,
        ...rest,
      })
    );
  }
  async getVariants(type, brandId, modelId, year, search = "") {
    const vehicleType = await VehicleType.findOne({
      slug: type,
      enabled: true,
    }).lean();

    if (!vehicleType) throw notFound("Vehicle type not found");

    const brand = await VehicleBrand.findOne({
      _id: brandId,
      vehicleTypeId: vehicleType._id,
      enabled: true,
    }).lean();

    if (!brand) throw notFound("Brand not found");

    const model = await VehicleModel.findOne({
      _id: modelId,
      brandId: brand._id,
      enabled: true,
    }).lean();

    if (!model) throw notFound("Model not found");

    /* ---------------- FILTER ---------------- */

    const match = {
      modelId: model._id,
      enabled: true,
    };

    const numYear = Number(year);
    if (year !== undefined && year !== null && year !== "" && !Number.isNaN(numYear)) {
      match.year = numYear;
    }

    const q = typeof search === "string" ? search.trim() : "";

    if (q) {
      match.name = {
        $regex: q,
        $options: "i",
      };
    }

    /* ---------------- AGGREGATION ---------------- */

    const res = await VehicleVariant.aggregate([
      { $match: match },

      /* Fuel Type join */
      {
        $lookup: {
          from: "vehiclefueltypes",
          localField: "fuelTypeId",
          foreignField: "_id",
          as: "fuelType",
        },
      },
      { $unwind: { path: "$fuelType", preserveNullAndEmptyArrays: true } },

      /* Transmission join */
      {
        $lookup: {
          from: "vehicletransmissions",
          localField: "transmissionId",
          foreignField: "_id",
          as: "transmission",
        },
      },
      { $unwind: { path: "$transmission", preserveNullAndEmptyArrays: true } },

      /* Sorting */
      { $sort: { year: -1, name: 1 } },
    ]);

    /* ---------------- RESPONSE MAP ---------------- */

    return res.map((v) => ({
      id: v._id,
      ...v,

      fuelType: v.fuelType
        ? {
          id: v.fuelType._id,
          slug: v.fuelType.slug,
          name: v.fuelType.name,
          icon: v.fuelType.icon,
          description: v.fuelType.description,
        }
        : null,

      transmission: v.transmission
        ? {
          id: v.transmission._id,
          slug: v.transmission.slug,
          name: v.transmission.name,
          icon: v.transmission.icon,
          description: v.transmission.description,
        }
        : null,
    }));
  }


  async getDraftMeta({
    vehicleType,
    brandId,
    modelId,
    variantId,
  }) {

    const type = await VehicleType.findOne({
      slug: vehicleType,
      enabled: true,
    }).lean();

    if (!type) {
      throw notFound("Vehicle type not found");
    }

    const [brand, model, variant] = await Promise.all([

      VehicleBrand.findOne({
        _id: brandId,
        vehicleTypeId: type._id,
        enabled: true,
      })
        .select("name logo")
        .lean(),

      VehicleModel.findOne({
        _id: modelId,
        brandId,
        enabled: true,
      })
        .select("name")
        .lean(),


      VehicleVariant.findById(variantId)
        .populate({
          path: "fuelTypeId",
          select: "name",
        })
        .populate({
          path: "transmissionId",
          select: "name",
        })
        .select("name year fuelTypeId transmissionId")
        .lean(),

    ]);

    return {

      brand: brand
        ? {
          id: brand._id,
          name: brand.name,
          logo: brand.logo,
        }
        : null,

      model: model
        ? {
          id: model._id,
          name: model.name,
        }
        : null,

      variant: variant
        ? {
          id: variant._id,
          name: variant.name,
          fuelType: variant.fuelTypeId
            ? variant.fuelTypeId.name

            : null,
          transmission: variant.transmissionId
            ?
            variant.transmissionId.name

            : null,
        }
        : null,

      year: variant?.year,
    };
  }

}

export default new VehicleRepository();