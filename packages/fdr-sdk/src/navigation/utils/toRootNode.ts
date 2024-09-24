import { DocsV2Read, FernNavigation } from "../..";
import { FernNavigationV1ToLatest } from "../migrators/v1ToV2";

export function toRootNode(
    docs: DocsV2Read.LoadDocsForUrlResponse,
    disableEndpointPairs: boolean = false,
    paginated?: boolean,
): FernNavigation.RootNode {
    const v1 = FernNavigation.V1.toRootNode(docs, disableEndpointPairs, paginated);
    return new FernNavigationV1ToLatest().root(v1);
}
