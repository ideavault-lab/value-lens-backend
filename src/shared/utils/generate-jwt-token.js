import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

const ACCESS_TOKEN_EXPIRES = "7d";

export function generateAccessToken(user) {

    return jwt.sign(
        {
            sub: user.id,
            role: user.role,
        },
        env.JWT_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRES,
        }
    );

}

export function verifyAccessToken(token) {

    return jwt.verify(
        token,
        env.JWT_SECRET
    );

}