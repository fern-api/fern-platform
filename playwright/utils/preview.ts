import { BrowserContext } from "@playwright/test";

// let previewDeploymentUrl: string | null = null;
export const getPreviewDeploymentUrl = (): string => {
  if (!process.env.DEPLOYMENT_URL) {
    throw new Error("DEPLOYMENT_URL environment variable is not set.");
  }
  return process.env.DEPLOYMENT_URL;
};

export interface PreviewContext {
  originalUrl: string;
  previewUrl: string; // url to visit

  originalHost: string; // set to _fern_docs_preview
  deploymentHost: string; // set to the deployment host

  createPreviewUrl(url: string): string;
}

export function generatePreviewContext(uri: string): PreviewContext {
  const deploymentUrl = new URL(getPreviewDeploymentUrl());
  const url = new URL(uri);
  return {
    originalUrl: uri,
    previewUrl: toPreviewUrl(deploymentUrl.host, uri),
    originalHost: url.host,
    deploymentHost: deploymentUrl.host,
    createPreviewUrl: (url: string) => toPreviewUrl(deploymentUrl.host, url),
  };
}

export function addPreviewCookie(
  context: BrowserContext,
  previewContext: PreviewContext
): Promise<void> {
  return context.addCookies([
    {
      name: "_fern_docs_preview",
      value: previewContext.originalHost,
      domain: previewContext.deploymentHost,
      path: "/",
    },
  ]);
}

export function toPreviewUrl(deploymentHost: string, url: string): string {
  const urlObj = new URL(url, url.startsWith("/") ? "https://n" : undefined);
  urlObj.host = deploymentHost;
  return urlObj.toString();
}
