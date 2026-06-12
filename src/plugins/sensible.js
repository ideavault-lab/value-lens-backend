import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import redis from "@fastify/redis";

import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import { env } from "../config/env.js";

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
    max: parseInt(env.RATE_LIMIT_MAX ?? "100", 10),
    timeWindow: "1 minute",
    errorResponseBuilder: (request, context) => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: `Rate limit exceeded. Try again in ${context.after}.`,
    }),
  });

   // ====================== REDIS SETUP ======================
    // We check if REDIS_URL exists in environment variables
    if (env.REDIS_URL) {
      try {
        await app.register(redis, {
          url: env.REDIS_URL,     // Render will give you this
          // You can add more options if needed:
          // maxRetriesPerRequest: 3,
          // connectTimeout: 5000,
        });
        
        console.log("✅ Redis connected successfully");
      } catch (err) {
        console.error("❌ Redis connection failed:", err.message);
        // Don't crash the app if Redis fails (good practice)
      }
    } else {
      console.warn("⚠️ REDIS_URL is not set. Redis is disabled.");
    }

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