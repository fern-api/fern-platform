export function withSkewProtection(headers?: HeadersInit): HeadersInit | undefined {
    if (process.env.NEXT_DEPLOYMENT_ID == null) {
        return headers;
    }

    const h = new Headers(headers);
    h.set("x-deployment-id", process.env.NEXT_DEPLOYMENT_ID);
    return h;
}
