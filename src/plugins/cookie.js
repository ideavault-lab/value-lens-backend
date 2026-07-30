import fp from "fastify-plugin";
import cookie from "@fastify/cookie";

async function cookiePlugin(app) {
  await app.register(cookie, {
    secret: process.env.COOKIE_SECRET,
    hook: "onRequest",
  });
}

export default fp(cookiePlugin);