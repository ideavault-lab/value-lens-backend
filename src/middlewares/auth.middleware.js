import {
  getUserById,
} from "../modules/auth/services/auth.service.js";

import {
  verifyAccessToken,
} from "../shared/utils/generate-jwt-token.js";

import {
  errorResponse,
  HTTP_STATUS,
} from "../shared/utils/api-response.js";
import { env } from "../config/env.js";

const COOKIE_NAME = env.COOKIE_NAME || "accessToken";

// ======================================================
// Attach authenticated user (optional)
// ======================================================

export async function attachUser(request) {

  const token =
    request.cookies?.[COOKIE_NAME];

  if (!token) {
    request.user = null;
    return;
  }

  try {

    const payload =
      verifyAccessToken(token);

    const user =
      await getUserById(payload.sub);

    request.user =
      user ?? null;

  } catch {

    request.user = null;

  }

}

// ======================================================
// Require Authentication
// ======================================================

export async function requireAuth(
  request,
  reply
) {

  await attachUser(request);

  if (request.user) {
    return;
  }

  return reply
    .code(
      HTTP_STATUS.UNAUTHORIZED
    )
    .send(
      errorResponse({
        statusCode:
          HTTP_STATUS.UNAUTHORIZED,

        error: "Unauthorized",

        message:
          "Authentication required",
      })
    );

}

// ======================================================
// Require Role
// ======================================================

export function requireRole(...roles) {

  return async function (
    request,
    reply
  ) {

    await requireAuth(
      request,
      reply
    );

    if (reply.sent) {
      return;
    }

    if (
      !roles.includes(
        request.user.role
      )
    ) {

      return reply
        .code(
          HTTP_STATUS.FORBIDDEN
        )
        .send(
          errorResponse({
            statusCode:
              HTTP_STATUS.FORBIDDEN,

            error: "Forbidden",

            message:
              "You do not have permission to perform this action.",
          })
        );

    }

  };

}