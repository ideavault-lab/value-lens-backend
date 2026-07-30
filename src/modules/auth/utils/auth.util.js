import { setAuthCookie } from "../../../shared/utils/cookie.util.js";
import { generateAccessToken } from "../../../shared/utils/generate-jwt-token.js";


export function createAuthSession(
    reply,
    user
) {

    const token =
        generateAccessToken(user);

    setAuthCookie(
        reply,
        token
    );

    return token;

}