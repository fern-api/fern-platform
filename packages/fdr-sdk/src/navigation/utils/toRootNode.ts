import { DocsV2Read, FernNavigation } from "../..";
import { FernNavigationV1ToLatest } from "../migrators/v1ToV2";
import { mutableUpdatePointsTo } from "./updatePointsTo";

export function toRootNode(
    docs: DocsV2Read.LoadDocsForUrlResponse,
    disableEndpointPairs: boolean = false,
    paginated?: boolean
): FernNavigation.RootNode {
    const v1 = FernNavigation.V1.toRootNode(
        docs,
        disableEndpointPairs,
        paginated
    );
    const latest = FernNavigationV1ToLatest.create().root(v1);
    // update all `pointsTo`
    mutableUpdatePointsTo(latest);
    return latest;
}
