import marketController from "../controllers/market.controller.js";


async function marketRoutes(
  app
) {

  app.post(
    "/scrape",
    marketController.scrape
  );

  app.get(
    "/average",
    marketController.getAverage
  );
}

export default marketRoutes;