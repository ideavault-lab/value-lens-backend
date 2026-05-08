import vehicleController from "./vehicle.controller.js";
import { getBrandModelsSchema, getBrandsSchema, getVehicleTypesSchema } from "./vehicle.schema.js";

async function vehicleRoutes(app) {
  app.get(
    "/types",
    {
        schema: getVehicleTypesSchema,
    },
    vehicleController.getVehicleTypes
  );

// BRAND LIST
  app.get(
    "/:type/brands",
    {
      schema: getBrandsSchema,
    },
    vehicleController.getBrands
  );

  // MODEL LIST
  app.get(
    "/:type/brands/:brandId/models",
    {
      schema: getBrandModelsSchema,
    },
    vehicleController.getModels
  );
}

export default vehicleRoutes;