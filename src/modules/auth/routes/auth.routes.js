import {
  registerUser,
  verifyCredentials,
  findOrCreateOAuthUser,
  getUserById,
} from "../services/auth.service.js";

const registerSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 8 },
      name: { type: "string" },
    },
  },
};

const loginSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string" },
    },
  },
};

export default async function authRoutes(app) {
  // ─────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────
  app.post("/register", { schema: registerSchema }, async (req, reply) => {
    const { email, password, name } = req.body;
    const user = await registerUser({ email, password, name });

    // log them in immediately after registering
    req.session.userId = user.id;

    return reply.code(201).send({ success: true, user });
  });

  // ─────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────
  app.post("/login", { schema: loginSchema }, async (req, reply) => {
    const { email, password } = req.body;
    const user = await verifyCredentials({ email, password });

    req.session.userId = user.id;

    return reply.send({ success: true, user });
  });

  // ─────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────
  app.post("/logout", async (req, reply) => {
    await req.session.destroy();
    reply.clearCookie("sessionId", { path: "/" });
    return reply.send({ success: true, message: "Logged out" });
  });

  // ─────────────────────────────────────────────
  // CURRENT USER
  // ─────────────────────────────────────────────
  app.get("/me", { preHandler: app.requireAuth }, async (req, reply) => {
    return reply.send({ success: true, user: req.user });
  });

  // ─────────────────────────────────────────────
  // GOOGLE OAUTH CALLBACK
  // ─────────────────────────────────────────────
  app.get("/google/callback", async (req, reply) => {
    const { token } = await app.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const profile = await userInfoRes.json();

    const user = await findOrCreateOAuthUser({
      provider: "google",
      providerId: profile.sub,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture,
    });

    req.session.userId = user.id;

    return reply.redirect(process.env.OAUTH_SUCCESS_REDIRECT ?? "/");
  });

  // ─────────────────────────────────────────────
  // GITHUB OAUTH CALLBACK
  // ─────────────────────────────────────────────
  app.get("/github/callback", async (req, reply) => {
    const { token } = await app.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);

    const userInfoRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "User-Agent": "fastify-app",
      },
    });
    const profile = await userInfoRes.json();

    let email = profile.email;
    if (!email) {
      // GitHub may not return a public email; fetch the email list explicitly
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          "User-Agent": "fastify-app",
        },
      });
      const emails = await emailsRes.json();
      const primary = Array.isArray(emails)
        ? emails.find((e) => e.primary) ?? emails[0]
        : null;
      email = primary?.email ?? null;
    }

    const user = await findOrCreateOAuthUser({
      provider: "github",
      providerId: String(profile.id),
      email,
      name: profile.name ?? profile.login,
      avatarUrl: profile.avatar_url,
    });

    req.session.userId = user.id;

    return reply.redirect(process.env.OAUTH_SUCCESS_REDIRECT ?? "/");
  });
}