import { getUserById } from "../modules/auth/services/auth.service.js";

/**
 * Attaches req.user if a valid session exists. Does NOT block the request
 * if unauthenticated — use requireAuth for that. Useful for routes that
 * behave differently for logged-in vs anonymous users.
 */
export async function attachUser(req, _reply) {
  if (req.session?.userId) {
    const user = await getUserById(req.session.userId);
    req.user = user ?? null;
  } else {
    req.user = null;
  }
}

/**
 * Blocks the request unless the user has a valid session.
 * Use as a preHandler: { preHandler: app.requireAuth }
 */
export async function requireAuth(req, reply) {
  if (!req.session?.userId) {
    return reply.code(401).send({ success: false, message: "Authentication required" });
  }

  const user = await getUserById(req.session.userId);

  if (!user) {
    // session points to a user that no longer exists
    await req.session.destroy();
    return reply.code(401).send({ success: false, message: "Authentication required" });
  }

  req.user = user;
}

/**
 * Blocks the request unless the user is authenticated AND has the given role.
 * Use as a preHandler: { preHandler: app.requireRole("admin") }
 */
export function requireRole(role) {
  return async function (req, reply) {
    await requireAuth(req, reply);
    if (reply.sent) return; // requireAuth already responded with 401

    if (req.user.role !== role) {
      return reply.code(403).send({ success: false, message: "Insufficient permissions" });
    }
  };
}