import vehicleController from "./controllers/vehicle.controller.js";
import { getBrandModelsSchema, getBrandsSchema, getModelVariantsSchema, getVehicleTypesSchema } from "./vehicle.schema.js";
import kmDrivenController from "./controllers/km-driven.controller.js";

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

  app.get(
    "/:type/brands/:brandId/models/:modelId/variants",
    {
      schema: getModelVariantsSchema,
    },
    vehicleController.getVariants
  );

app.get("/km-driven-insights", kmDrivenController.getInsights);

// app.post("/assessment/create-draft", vehicleController.createDraftAssessment);

// app.get("/get-valuation", vehicleController.getValuation);
}

export default vehicleRoutes;