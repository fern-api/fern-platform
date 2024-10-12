const deploymentId = process.env.NEXT_DEPLOYMENT_ID;
export function withSkewProtection(headers?: HeadersInit): HeadersInit | undefined {
    if (!deploymentId) {
        return headers;
    }

    const h = new Headers(headers);
    h.set("x-deployment-id", deploymentId);
    return h;
}
