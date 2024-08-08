import { EnvironmentId } from "@fern-api/fdr-sdk/navigation";
import { useNavigationNodes, useResolvedPath } from "../../atoms";

export function usePlaygroundSettings(): EnvironmentId[] | undefined {
    const resolvedPath = useResolvedPath();
    const navigationNodes = useNavigationNodes();
    const slug = resolvedPath.slug;
    let cursor = navigationNodes.slugMap.get(slug);
    while (cursor && cursor.slug) {
        if (cursor && (cursor.type === "endpoint" || cursor.type === "webSocket" || cursor.type === "apiPackage")) {
            return cursor.playground?.allowedEnvironments;
        }
        const newSlug = slug.split("/");
        newSlug.pop();
        cursor = navigationNodes.slugMap.get(newSlug.join("/"));
    }
    return;
}
