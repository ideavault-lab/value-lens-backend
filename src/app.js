import Fastify from "fastify";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { registerPlugins } from "./plugins/sensible.js";
import routes from "./routes/routes.js";

import {
  errorResponse,
  HTTP_STATUS,
} from "./shared/utils/api-response.js";
import { connectDatabase } from "./config/database.js";

const __dirname = dirname(
  fileURLToPath(import.meta.url)
);

export async function buildApp(opts = {}) {


  // CONNECT DATABASE
  await connectDatabase();

  const app = Fastify({
    logger: opts.logger ?? {
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
    },

    ajv: {
      customOptions: {
        removeAdditional: "all",
        coerceTypes: true,
        allErrors: true,
      },
    },

    ...opts,
  });

  // ─────────────────────────────────────────────
  // Register Plugins
  // ─────────────────────────────────────────────
  await registerPlugins(app);

  // ─────────────────────────────────────────────
  // Register API Routes
  // FINAL PREFIX:
  // /api/v1/*
  // ─────────────────────────────────────────────
  await app.register(routes, {
    prefix: "/api",
  });

  // ─────────────────────────────────────────────
  // Global 404 Handler
  // ─────────────────────────────────────────────
  app.setNotFoundHandler(
    async (request, reply) => {
      return reply
        .code(HTTP_STATUS.NOT_FOUND)
        .send(
          errorResponse({
            statusCode:
              HTTP_STATUS.NOT_FOUND,

            error: "Not Found",

            message: `Route ${request.method} ${request.url} not found`,
          })
        );
    }
  );

  // ─────────────────────────────────────────────
  // Global Error Handler
  // ─────────────────────────────────────────────
  app.setErrorHandler(
    async (error, request, reply) => {

      // AJV VALIDATION ERRORS
      if (error.validation) {
        return reply
          .code(HTTP_STATUS.BAD_REQUEST)
          .send(
            errorResponse({
              statusCode:
                HTTP_STATUS.BAD_REQUEST,

              error: "Validation Error",

              message: error.message,

              details: error.validation,
            })
          );
      }

      const statusCode =
        error.statusCode ??
        HTTP_STATUS.INTERNAL_SERVER_ERROR;

      // LOG ERROR
      app.log.error({
        reqId: request.id,
        method: request.method,
        url: request.url,
        error,
      });

      return reply
        .code(statusCode)
        .send(
          errorResponse({
            statusCode,

            error:
              error.error ||
              error.name ||
              "Internal Server Error",

            message:
              statusCode ===
              HTTP_STATUS.INTERNAL_SERVER_ERROR
                ? "An unexpected error occurred"
                : error.message,

            details:
              error.details || null,
          })
        );
    }
  );

  return app;
}