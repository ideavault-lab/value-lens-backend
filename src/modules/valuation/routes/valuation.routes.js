import valuationController from "../controllers/valuation.controller.js";

async function valuationRoutes(app) {

  app.get(
    "/drafts/:draftId/estimate",
    valuationController.getValuation
  );
}

export default valuationRoutes;