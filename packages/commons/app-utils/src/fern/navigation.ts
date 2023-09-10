import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { assertNeverNoThrow } from "@fern-ui/core-utils";

export function getFirstNavigatableItem(
    item: FernRegistryDocsRead.NavigationItem,
    slugPrefix?: string
): string | undefined {
    switch (item.type) {
        case "api":
        case "page": {
            const parts: string[] = [];
            if (slugPrefix != null) {
                parts.push(slugPrefix);
            }
            parts.push(item.urlSlug);
            return parts.join("/");
        }
        case "section": {
            const section = item;
            const [firstChildItem] = section.items;
            if (firstChildItem == null) {
                return undefined;
            }
            const parts: string[] = [section.urlSlug];
            if (slugPrefix != null) {
                parts.push(slugPrefix);
            }
            return getFirstNavigatableItem(firstChildItem, parts.join("/"));
        }
        default:
            assertNeverNoThrow(item);
    }

    return undefined;
}
