import Fastify from "fastify";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import autoload from "@fastify/autoload";
import { registerPlugins } from "./plugins/sensible.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function buildApp(opts = {}) {
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

  // ── Plugins ────────────────────────────────────────────────────────────────
  await registerPlugins(app);

  // ── Routes (autoloaded from src/routes/) ──────────────────────────────────
  await app.register(autoload, {
    dir: join(__dirname, "routes"),
    options: { prefix: "/api" },
  });

  // ── Global 404 ────────────────────────────────────────────────────────────
  app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      statusCode: 404,
      error: "Not Found",
      message: `Route ${request.method} ${request.url} not found`,
    });
  });

  // ── Global error handler ───────────────────────────────────────────────────
  app.setErrorHandler((error, request, reply) => {
    if (error.validation) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Validation Error",
        message: error.message,
        details: error.validation,
      });
    }

    const statusCode = error.statusCode ?? 500;
    app.log.error({ err: error, req: request.id }, error.message);

    reply.code(statusCode).send({
      statusCode,
      error: error.name ?? "Internal Server Error",
      message: statusCode === 500 ? "An unexpected error occurred" : error.message,
    });
  });

  return app;
}