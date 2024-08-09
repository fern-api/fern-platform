import { EnvironmentId } from "@fern-api/fdr-sdk/navigation";
import { useNavigationNodes, useResolvedPath } from "../atoms";

export function usePlaygroundSettings(): EnvironmentId[] | undefined {
    let depth = 0;

    const resolvedPath = useResolvedPath();
    const navigationNodes = useNavigationNodes();
    const slug = resolvedPath.slug;
    let cursor = navigationNodes.slugMap.get(slug);
    while (cursor && cursor.slug && depth < 100) {
        if (cursor && (cursor.type === "endpoint" || cursor.type === "webSocket" || cursor.type === "apiPackage")) {
            return cursor.playground?.allowedEnvironments;
        }
        const newSlug = slug.split("/");
        newSlug.pop();
        cursor = navigationNodes.slugMap.get(newSlug.join("/"));
        depth += 1;
    }
    return;
}
