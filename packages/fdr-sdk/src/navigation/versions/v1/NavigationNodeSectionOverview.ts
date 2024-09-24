import type { PageId, WithOverviewPage } from ".";
import type { NavigationNode } from "./NavigationNode";
import { isSection, type NavigationNodeSection } from "./NavigationNodeSection";

type WithRequiredOverviewPage<T extends WithOverviewPage> = T & {
    overviewPageId: PageId;
};

/**
 * A navigation node that isn't a leaf node and contains markdown content
 */
export type NavigationNodeSectionOverview = WithRequiredOverviewPage<NavigationNodeSection>;

export function isSectionOverview(node: NavigationNode): node is NavigationNodeSectionOverview {
    return isSection(node) && node.overviewPageId != null;
}
