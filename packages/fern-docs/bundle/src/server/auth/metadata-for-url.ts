import "server-only";

import { DocsLoader } from "@fern-docs/cache";

export interface OrgMetadata {
  orgId: string;
  isPreviewUrl: boolean;
}

export async function getOrgMetadataForDomain(
  domain: string
): Promise<OrgMetadata | undefined> {
  if (!domain || typeof domain !== "string") {
    return undefined;
  }

  try {
    const loader = DocsLoader.create(domain).withEnvironment(
      process.env.NEXT_PUBLIC_FDR_ORIGIN
    );
    const metadata = await loader.getMetadata();
    return metadata ?? undefined;
  } catch (_) {
    return undefined;
  }
}
