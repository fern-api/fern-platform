import { ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { DocsLoader } from "@fern-docs/cache";
import { mapValues } from "es-toolkit/object";

interface LoadDocsWithUrlResponse {
  org_id: string;
  root: FernNavigation.RootNode;
  pages: Record<FernNavigation.PageId, string>;
  apis: Record<ApiDefinition.ApiDefinitionId, ApiDefinition.ApiDefinition>;
  domain: string;
}

export async function loadDocsWithUrl(
  loader: DocsLoader
): Promise<LoadDocsWithUrlResponse> {
  const org_id = await loader.getMetadata().then((metadata) => metadata?.orgId);

  if (!org_id) {
    throw new Error("No org id found");
  }

  const domain = new URL(withDefaultProtocol(loader.domain));

  const root = await loader.unprunedRoot();

  if (!root) {
    throw new Error("No root found");
  }

  // migrate pages
  const pages = mapValues(await loader.getAllPages(), (page) => page.markdown);

  // migrate apis
  const apis = await loader.loadAllApis();

  return { org_id, root, pages, apis, domain: domain.host };
}
