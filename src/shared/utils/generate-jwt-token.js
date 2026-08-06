import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES = "7d";

export function generateAccessToken(user) {

    return jwt.sign(
        {
            sub: user.id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRES,
        }
    );

}

export function verifyAccessToken(token) {

    return jwt.verify(
        token,
        process.env.JWT_SECRET
    );

}