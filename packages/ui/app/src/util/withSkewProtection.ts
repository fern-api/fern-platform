const deploymentId = process.env.NEXT_DEPLOYMENT_ID;
export function withSkewProtection(url: string): string {
    if (!deploymentId) {
        return url;
    }

    if (url.includes("?")) {
        return `${url}&dpl=${deploymentId}`;
    } else {
        return `${url}?dpl=${deploymentId}`;
    }
}
