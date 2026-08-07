const COOKIE_NAME = "accessToken";

export function setAuthCookie(
    reply,
    token
) {

    reply.setCookie(
        COOKIE_NAME,
        token,
        {
            httpOnly: true,

            secure:
                process.env.NODE_ENV === "production",

            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",

            path: "/",

            maxAge:
                60 * 60 * 24 * 7,
        }
    );

}

export function clearAuthCookie(
    reply
) {

    reply.clearCookie(
        COOKIE_NAME,
        {
            path: "/",
        }
    );

}