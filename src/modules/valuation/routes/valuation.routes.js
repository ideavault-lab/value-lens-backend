import valuationController from "../controllers/valuation.controller.js";

async function valuationRoutes(app) {

  app.get(
    "/drafts/:draftId/estimate",
    valuationController.getValuation
  );

  app.get(
    "/drafts/:draftId/meta",
    valuationController.getValuationMeta
  );
}

export default valuationRoutes;