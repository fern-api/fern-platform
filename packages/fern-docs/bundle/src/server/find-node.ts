import "server-only";

import { FernNavigation } from "@fern-api/fdr-sdk";

import { DocsLoader } from "./docs-loader";

export function createFindNode(loader: DocsLoader) {
  return async (slug: FernNavigation.Slug) => {
    const root = await loader.getRoot();
    const node = FernNavigation.utils.findNode(root, slug);
    if (node.type === "found") {
      return node.node;
    }
    return undefined;
  };
}
