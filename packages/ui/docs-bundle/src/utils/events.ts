import { track } from "@vercel/analytics/server";

export async function trackPromiseDuration<T>(promise: Promise<T>, eventName: string, url: string): Promise<T> {
    const start = Date.now();
    try {
        return await promise;
    } finally {
        const duration = Date.now() - start;
        await track(eventName, { url, duration });
    }
}
