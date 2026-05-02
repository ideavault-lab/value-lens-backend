export default async function healthRoutes(app) {
  // Fastify autoload sets prefix "/api" but health should be at root.
  // We override with { prefix: "" } via the plugin options below.
  app.get("/health", {
    config: { rateLimit: { max: 300 } }, // looser limit for uptime checks
    schema: {
      tags: ["health"],
      summary: "API health check",
      response: {
        200: {
          type: "object",
          properties: {
            status:    { type: "string" },
            timestamp: { type: "string" },
            uptime_s:  { type: "number" },
            version:   { type: "string" },
          },
        },
      },
    },
    handler: async () => ({
      status:    "ok",
      timestamp: new Date().toISOString(),
      uptime_s:  Math.round(process.uptime()),
      version:   "1.0.0",
    }),
  });
}

// Tell autoload to mount this plugin at root (not /api)
healthRoutes[Symbol.for("skip-override")] = true;
export const autoConfig = { prefix: "" };