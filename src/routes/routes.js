import v1Routes from "./v1/routes.js";

export default async function routes(app) {
  app.register(v1Routes, {
    prefix: "/v1",
  });
}