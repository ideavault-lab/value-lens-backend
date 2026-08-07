import {
  HTTP_STATUS,
  successResponse,
} from "../../../shared/utils/api-response.js";

import {
  registerUser,
  findOrCreateOAuthUser,
  loginUser,
} from "../services/auth.service.js";
import { createAuthSession } from "../utils/auth.util.js";

class AuthController {

  async register(request, reply) {

    let user = null;
    try {
      user = await registerUser(request.body);
      createAuthSession(reply, user);
      return reply
        .code(HTTP_STATUS.CREATED)
        .send(
          successResponse({
            data: user,
            message: "Account created successfully",
          })
        );

    } catch (error) {
      // Roll back only if user creation succeeded
      if (user?.id) {
        try {
          await rollbackUser(user.id);
        } catch (rollbackError) {
          request.log.error(
            rollbackError,
            "Failed to rollback registered user"
          );
        }
      }

      throw error;
    }
  }

  async login(request, reply) {

    console.log("LOGIN REQUEST BODY:", request.body);
    const user =
      await loginUser(request.body);

      console.log("LOGIN USER:", user);
    createAuthSession(
      reply,
      user
    );

    return reply.send(
      successResponse({
        data: user,
        message: "Login successful",
      })
    );

  }

  async logout(request, reply) {

    clearAuthCookie(reply);

    return reply.send(
      successResponse({
        message: "Logged out successfully",
      })
    );

  }

  async me(request, reply) {

    return reply.send(
      successResponse({
        data: request.user,
      })
    );

  }

  async googleCallback(request, reply) {
    // move your existing code here
  }

  async githubCallback(request, reply) {
    // move your existing code here
  }

}

export default new AuthController();