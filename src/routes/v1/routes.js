import vehicleRoutes from "../../modules/vehicle/vehicle.routes.js";
// import predictionRoutes from "./prediction/prediction.route.js";

export default async function v1Routes(app) {

  // HEALTH CHECK
  app.get("/health", async () => {
    return {
      success: true,
      message: "API running",
    };
  });

  // VEHICLE
  app.register(vehicleRoutes, {
    prefix: "/vehicles",
  });

  // PREDICTION
//   app.register(predictionRoutes, {
//     prefix: "/predictions",
//   });
}