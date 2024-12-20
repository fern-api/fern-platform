import { DocsLoader } from "@fern-ui/fern-docs-server";

export interface OrgMetadata {
    orgId: string;
    isPreviewUrl: boolean;
}

export async function getOrgMetadataForDomain(domain: string): Promise<OrgMetadata | undefined> {
    if (!domain || typeof domain !== "string") {
        return undefined;
    }

    try {
        const docsLoader = DocsLoader.create(domain).withEnvironment(process.env.NEXT_PUBLIC_FDR_ORIGIN);
        const metadata = await docsLoader.getMetadata();
        return metadata ?? undefined;
    } catch (error) {
        return undefined;
    }
}
