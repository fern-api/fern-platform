import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const withSecureCookie = (opts?: Partial<ResponseCookie>): Partial<ResponseCookie> => ({
    ...opts,
    secure: true,
    httpOnly: true,
    sameSite: true,
});
