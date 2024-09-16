// let previewDeploymentUrl: string | null = null;
export const getPreviewDeploymentUrl = (): string => {
    if (!process.env.DEPLOYMENT_URL) {
        throw new Error("DEPLOYMENT_URL environment variable is not set.");
    }
    return process.env.DEPLOYMENT_URL;
};

export interface PreviewContext {
    /**
     * The original URL to be previewed.
     */
    url: string;

    /**
     * The URL to navigate to after setting the preview cookie.
     */
    previewUrl: string;

    /**
     * The api route that will set the _fern_docs_preview=<<host>> cookie.
     */
    previewCookieApiRoute: string;

    /**
     * The preview deployment URL, which will be used to replace the host of the original URL.
     */
    deploymentUrl: string;

    createPreviewUrl(url: string): string;
}

export function generatePreviewContext(url: string): PreviewContext {
    const deploymentUrl = getPreviewDeploymentUrl();
    return {
        url,
        previewUrl: toPreviewUrl(deploymentUrl, url),
        previewCookieApiRoute: `${deploymentUrl}/api/fern-docs/preview?host=${encodeURIComponent(new URL(url).host)}`,
        deploymentUrl,
        createPreviewUrl: (url: string) => toPreviewUrl(deploymentUrl, url),
    };
}

export function toPreviewUrl(deploymentUrl: string, url: string): string {
    if (url.startsWith("http")) {
        return `${deploymentUrl}${new URL(url).pathname}`;
    } else if (url.startsWith("/")) {
        return `${deploymentUrl}${url}`;
    }
    throw new Error(`Invalid URL: ${url}`);
}
