import { env } from "../../config/env.js";

const COOKIE_NAME = env.COOKIE_NAME || "accessToken";

export function setAuthCookie(reply, token) {
    const isProd = env.NODE_ENV === "production";

    reply.setCookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        domain: isProd
            ? env.COOKIE_DOMAIN
            : undefined,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });
}

export function clearAuthCookie(reply) {
    const isProd = env.NODE_ENV === "production";

    reply.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        domain: isProd
            ? env.COOKIE_DOMAIN
            : undefined,
        path: "/",
    });
}