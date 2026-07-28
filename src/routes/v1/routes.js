import marketRoutes from "../../modules/market/routes/market.routes.js";
import valuationRoutes from "../../modules/valuation/routes/valuation.routes.js";
import vehicleRoutes from "../../modules/vehicle/vehicle.routes.js";
import authRoutes from "../../modules/auth/routes/auth.routes.js";
// import predictionRoutes from "./prediction/prediction.route.js";

export default async function v1Routes(app) {

  // HEALTH CHECK
  app.get("/health", async () => {
    return {
      success: true,
      message: "API running",
    };
  });

  //AUTH
  app.register(authRoutes, {
    prefix: "/auth",
  });
  
  // VEHICLE
  app.register(vehicleRoutes, {
    prefix: "/vehicles",
  });

  app.register(marketRoutes, {
    prefix: "/market",
  });
   app.register(valuationRoutes, {
    prefix: "/valuation",
  });


  // PREDICTION
//   app.register(predictionRoutes, {
//     prefix: "/predictions",
//   });
}