import valuationController from "../controllers/valuation.controller.js";

async function valuationRoutes(app) {

  app.post(
    "/estimate",
    valuationController.estimate
  );
}

export default valuationRoutes;