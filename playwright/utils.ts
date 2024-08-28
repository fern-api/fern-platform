import * as fs from "fs";
import { once } from "lodash-es";

export const getPreviewDeploymentUrl = once((): string => {
    // TODO: use an environment variable instead of a file
    return fs.readFileSync("deployment-url.txt", "utf-8").trim();
});

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
        return `${deploymentUrl}${url}`;
    } else if (url.startsWith("/")) {
        return `${deploymentUrl}${url}`;
    }
    throw new Error(`Invalid URL: ${url}`);
}
