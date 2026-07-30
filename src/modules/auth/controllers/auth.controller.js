import {
    HTTP_STATUS,
  successResponse,
} from "../../../shared/utils/api-response.js";

import {
  registerUser,
  verifyCredentials,
  findOrCreateOAuthUser,
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

    const user =
      await verifyCredentials(request.body);

    request.session.userId = user.id;

    return reply.send(
      successResponse({
        data: user,
        message: "Login successful",
      })
    );
  }

  async logout(request, reply) {

    await request.session.destroy();

    reply.clearCookie("sessionId");

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