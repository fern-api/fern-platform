import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import type { ResolvedNode, UrlSlug } from "./types";

export interface PathResolverConfig {
    docsDefinition: FernRegistryDocsRead.DocsDefinition;
}

export class PathResolver {
    public constructor(public readonly config: PathResolverConfig) {}

    public resolveSlug(_: UrlSlug): ResolvedNode | undefined {
        return undefined;
    }

    public getAllSlugs(): UrlSlug[] {
        return [];
    }
}
