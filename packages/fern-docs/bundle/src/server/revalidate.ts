import "server-only";

import { after } from "next/server";

import { DocsLoader } from "./docs-loader";

export function revalidate(loader: DocsLoader) {
  return after(async () => {
    const { domain, basePath } = await loader.getMetadata();
    await fetch(`https://${domain}${basePath}/api/fern-docs/revalidate`);
  });
}
