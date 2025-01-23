import { DocsLoaderImpl } from "../DocsLoaderImpl";

export interface OrgMetadata {
  orgId: string;
  isPreviewUrl: boolean;
}

export async function getOrgMetadataForDomain(
  domain: string,
  host: string,
  fernToken?: string
): Promise<OrgMetadata | undefined> {
  if (!domain || typeof domain !== "string") {
    return undefined;
  }

  try {
    const docsLoader = DocsLoaderImpl.for(domain, host, fernToken);
    const metadata = await docsLoader.getMetadata();
    return metadata ?? undefined;
  } catch (_) {
    return undefined;
  }
}
