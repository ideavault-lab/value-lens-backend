import vehicleController from "./controllers/vehicle.controller.js";
import { getBrandModelsSchema, getBrandsSchema, getModelVariantsSchema, getVehicleTypesSchema } from "./vehicle.schema.js";
import kmDrivenController from "./controllers/km-driven.controller.js";
import draftController from "./controllers/draft-controller.js";

async function vehicleRoutes(app) {
  // ---------- PUBLIC ROUTES ----------
  // No auth hook in this scope — anyone can call these
  app.get(
    "/types",
    { schema: getVehicleTypesSchema },
    vehicleController.getVehicleTypes
  );

  // ---------- PROTECTED ROUTES ----------
  // Wrapped in a nested app.register() to create a separate encapsulation
  // context. Fastify hooks apply to the whole plugin scope they're added
  // in, not just routes declared after them — so putting requireAuth here
  // (instead of on the outer `app`) keeps it from leaking onto /types above.
  app.register(async function protectedRoutes(protectedApp) {
    // All routes below require an authenticated user
    protectedApp.addHook("preHandler", protectedApp.requireAuth);

    // BRAND LIST
    protectedApp.get(
      "/:type/brands",
      { schema: getBrandsSchema },
      vehicleController.getBrands
    );

    // MODEL LIST
    protectedApp.get(
      "/:type/brands/:brandId/models",
      { schema: getBrandModelsSchema },
      vehicleController.getModels
    );

    // VARIANT LIST
    protectedApp.get(
      "/:type/brands/:brandId/models/:modelId/variants",
      { schema: getModelVariantsSchema },
      vehicleController.getVariants
    );

    // KM DRIVEN INSIGHTS
    protectedApp.get("/km-driven-insights", kmDrivenController.getInsights);

    // // List all drafts for current user
    protectedApp.get("/drafts", draftController.getDrafts);

    // Get a single draft 
    protectedApp.get("/drafts/:draftId", draftController.getDraft);

    // Save (create or update) — body includes optional `draftId`
    protectedApp.post("/drafts", draftController.saveDraft);

    // Delete one draft
    protectedApp.delete("/drafts/:draftId", draftController.deleteDraft);

    // Clear all drafts
    protectedApp.delete("/drafts", draftController.deleteAllDrafts);

     // Get the suggested alternatives for a given model
    protectedApp.get("/alternatives", suggestionController.getSuggestedAlternatives);
  });
}

export default vehicleRoutes;