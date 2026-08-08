import fp from "fastify-plugin";
import session from "@fastify/session";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import connectRedis from "connect-redis";
import { env } from "../config/env.js";

export default fp(async function sessionPlugin(app) {
  const redisClient = app.redis;

  const RedisStore = connectRedis(session);

  // app.register(cookie);

  app.register(session, {
    secret: env.SESSION_SECRET, // must be >= 32 chars
    cookieName: "sessionId",
    store: new RedisStore({ client: redisClient, prefix: "sess:" }),
    cookie: {
      secure: env.NODE_ENV === "production",
      httpOnly: true,
     sameSite:
        env.NODE_ENV === "production"
          ? "none"
          : "lax",

      domain:
        env.NODE_ENV === "production"
          ? env.COOKIE_DOMAIN
          : undefined,

      path: "/",

      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
    saveUninitialized: false,
  });

  // Decorate app with reusable auth guards so routes can do:
  // { preHandler: app.requireAuth } or { preHandler: app.requireRole("admin") }
  app.decorate("requireAuth", requireAuth);
  app.decorate("requireRole", requireRole);

  app.addHook("onClose", async () => {
    await redisClient.quit();
  });
});