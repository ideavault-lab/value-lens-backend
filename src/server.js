import { buildApp } from "./app.js";
import { env } from "./config/env.js";

const PORT = parseInt(env.PORT ?? "3001", 10);
const HOST = env.HOST ?? "0.0.0.0";

const app = await buildApp();

try {
  await app.listen({ port: PORT, host: HOST });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}