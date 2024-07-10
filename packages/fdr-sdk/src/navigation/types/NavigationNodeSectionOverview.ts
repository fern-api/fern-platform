import { FernNavigation } from "../generated";
import { NavigationNode } from "./NavigationNode";
import { NavigationNodeSection, isSection } from "./NavigationNodeSection";

type WithRequiredOverviewPage<T extends FernNavigation.WithOverviewPage> = T & {
    overviewPageId: FernNavigation.PageId;
};

/**
 * A navigation node that isn't a leaf node and contains markdown content
 */
export type NavigationNodeSectionOverview = WithRequiredOverviewPage<NavigationNodeSection>;

export function isSectionOverview(node: NavigationNode): node is NavigationNodeSectionOverview {
    return isSection(node) && node.overviewPageId != null;
}
