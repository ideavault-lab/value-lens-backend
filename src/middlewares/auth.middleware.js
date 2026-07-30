import { getUserById } from "../modules/auth/services/auth.service.js";
import { verifyAccessToken } from "../shared/utils/generate-jwt-token.js";


const COOKIE_NAME = "accessToken";


/**
 * Attach user if valid accessToken exists.
 * Does NOT block request.
 */
export async function attachUser(req, reply) {

  const token = req.cookies[COOKIE_NAME];


  if (!token) {
    req.user = null;
    return;
  }


  try {

    const payload = verifyAccessToken(token);


    const user = await getUserById(payload.sub);


    req.user = user ?? null;


  } catch (error) {

    req.user = null;

  }
}



/**
 * Block request if user is not authenticated.
 */
export async function requireAuth(req, reply) {


  await attachUser(req, reply);


  if (!req.user) {

    return reply.code(401).send({
      success: false,
      message: "Authentication required"
    });

  }

}



/**
 * Role based protection
 */
export function requireRole(role) {

  return async function (req, reply) {


    await requireAuth(req, reply);


    if (reply.sent) return;



    if (req.user.role !== role) {

      return reply.code(403).send({
        success: false,
        message: "Insufficient permissions"
      });

    }

  };

}