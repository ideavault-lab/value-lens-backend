import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

export async function registerPlugins(app) {
  // ── Security ───────────────────────────────────────────────────────────────
  await app.register(helmet, {
    contentSecurityPolicy: false, // disabled so swagger-ui works
  });

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? "*",
    methods: ["GET", "POST", "OPTIONS"],
  });

  await app.register(rateLimit, {
    max: parseInt(process.env.RATE_LIMIT_MAX ?? "100", 10),
    timeWindow: "1 minute",
    errorResponseBuilder: (request, context) => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: `Rate limit exceeded. Try again in ${context.after}.`,
    }),
  });

  // ── API docs (Swagger / OpenAPI) ───────────────────────────────────────────
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Car Prediction API",
        description:
          "Predict used car resale values in the Indian market. " +
          "Prices are in ₹ Lakhs. Factor impacts are percentage points vs neutral baseline.",
        version: "1.0.0",
      },
      tags: [
        { name: "prediction", description: "Resale value prediction endpoints" },
        { name: "reference",  description: "Brand and location reference data" },
        { name: "health",     description: "Health and status" },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list", deepLinking: true },
  });
}