import fp from "fastify-plugin";
import oauthPlugin from "@fastify/oauth2";
import { env } from "../config/env.js";

export default fp(async function oauthPlugins(app) {
  app.register(oauthPlugin, {
    name: "googleOAuth2",
    scope: ["profile", "email"],
    credentials: {
      client: {
        id: env.GOOGLE_CLIENT_ID,
        secret: env.GOOGLE_CLIENT_SECRET,
      },
      auth: oauthPlugin.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: "/api/auth/google",
    callbackUri: env.GOOGLE_CALLBACK_URL, // e.g. http://localhost:3001/api/auth/google/callback
  });

  app.register(oauthPlugin, {
    name: "githubOAuth2",
    scope: ["user:email"],
    credentials: {
      client: {
        id: env.GITHUB_CLIENT_ID,
        secret: env.GITHUB_CLIENT_SECRET,
      },
      auth: oauthPlugin.GITHUB_CONFIGURATION,
    },
    startRedirectPath: "/api/auth/github",
    callbackUri: env.GITHUB_CALLBACK_URL, // e.g. http://localhost:3001/api/auth/github/callback
  });
});