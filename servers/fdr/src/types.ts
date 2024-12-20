import { FdrAPI } from "@fern-api/fdr-sdk";

export interface DocsVersion {
    id: FdrAPI.VersionId;
    urlSlug?: string;
}
