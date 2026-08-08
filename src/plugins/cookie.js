import fp from "fastify-plugin";
import cookie from "@fastify/cookie";
import { env } from "../config/env.js";

async function cookiePlugin(app) {
  await app.register(cookie, {
    secret: env.COOKIE_SECRET,
    hook: "onRequest",
  });
}

export default fp(cookiePlugin);