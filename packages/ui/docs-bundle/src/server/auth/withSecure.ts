import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const DEFAULT_EXPIRES = 30 * 24 * 60 * 60 * 1000; // 30 days

export const withSecureCookie = (opts?: Partial<ResponseCookie>): Partial<ResponseCookie> => ({
    expires: DEFAULT_EXPIRES,
    ...opts,
    secure: true,
    httpOnly: true,
    sameSite: true,
});
