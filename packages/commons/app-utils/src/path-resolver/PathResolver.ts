import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import type { ResolvedNode } from "./types";

export interface PathResolverConfig {
    docsDefinition: FernRegistryDocsRead.DocsDefinition;
}

/**
 * A slug is a string like `"introduction/getting-started"` with no leading `"/"`
 */
export type UrlSlug = string;

export class PathResolver {
    public constructor(public readonly config: PathResolverConfig) {}

    public resolveSlug(_: UrlSlug): ResolvedNode | undefined {
        return undefined;
    }

    public getAllSlugs(): UrlSlug[] {
        return [];
    }
}
