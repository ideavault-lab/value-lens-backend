import vehicleController from "./controllers/vehicle.controller.js";
import { getBrandModelsSchema, getBrandsSchema, getModelVariantsSchema, getVehicleTypesSchema } from "./vehicle.schema.js";
import kmDrivenController from "./controllers/km-driven.controller.js";
import draftController from "./controllers/draft-controller.js"

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

// Attach your auth preHandler here (e.g. { preHandler: [fastify.authenticate] })
    // const auth = { preHandler: [fastify.authenticate] }; // replace with your hook

    // // List all drafts for current user
    // app.get("/drafts", auth, draftController.getDrafts.bind(draftController));

    // List all drafts for current user
    app.get("/drafts", draftController.getDrafts);

    // Get a single draft  
    app.get("/drafts/:draftId", draftController.getDraft);

    // Save (create or update) — body includes optional `draftId`
    app.post("/drafts", draftController.saveDraft);

    // Delete one draft
    app.delete("/drafts/:draftId", draftController.deleteDraft);

    // Clear all drafts
    app.delete("/drafts", draftController.deleteAllDrafts);

}

export default vehicleRoutes;