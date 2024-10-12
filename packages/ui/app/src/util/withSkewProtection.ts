// const deploymentId = process.env.NEXT_DEPLOYMENT_ID;
// export function withSkewProtection(url: string): string {
//     if (!deploymentId) {
//         return url;
//     }

//     if (url.includes("?")) {
//         return `${url}&dpl=${deploymentId}`;
//     } else {
//         return `${url}?dpl=${deploymentId}`;
//     }
// }

const deploymentId = process.env.NEXT_DEPLOYMENT_ID;

// appears to be a browser bug where `Headers` object is not settable, so we will use a plain object instead
export function withSkewProtection(h?: Record<string, string>): HeadersInit | undefined {
    if (!deploymentId) {
        return h;
    }

    return new Headers({ ...h, "X-Deployment-Id": deploymentId });
}
