import { track } from "@vercel/analytics/server";

interface TrackOpts<T> {
    promise: Promise<T>;
    key: string;
    host: string;
    slug: string[];
    auth?: "workos" | "ory" | "custom";
}

export async function trackPromise<T>(opts: TrackOpts<T>): Promise<T> {
    const start = Date.now();
    const toRet = await opts.promise;
    const end = Date.now();
    await track(opts.key, {
        duration: end - start,
        host: opts.host,
        auth: opts.auth ?? null,
        slug: opts.slug.join("/"),
    });
    return toRet;
}
