import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import { noop } from "ts-essentials";
import { FernNavigation } from "../..";

export function createBreadcrumbs(nodes: readonly FernNavigation.NavigationNode[]): FernNavigation.BreadcrumbItem[] {
    const breadcrumb: FernNavigation.BreadcrumbItem[] = [];
    nodes.forEach((node) => {
        if (!FernNavigation.hasMetadata(node) || FernNavigation.isLeaf(node)) {
            return;
        }
        visitDiscriminatedUnion(node)._visit({
            root: noop,
            version: noop,
            tab: noop,
            product: noop,
            section: (section) => {
                breadcrumb.push({
                    title: section.title,
                    pointsTo: section.overviewPageId != null ? section.slug : section.pointsTo,
                });
            },
            apiReference: (apiReference) => {
                if (!apiReference.hideTitle) {
                    breadcrumb.push({
                        title: apiReference.title,
                        pointsTo: apiReference.overviewPageId != null ? apiReference.slug : apiReference.pointsTo,
                    });
                }
            },
            changelog: (changelog) => {
                breadcrumb.push({
                    title: changelog.title,
                    pointsTo: changelog.slug,
                });
            },
            changelogYear: (changelogYear) => {
                breadcrumb.push({
                    title: changelogYear.title,
                    pointsTo: changelogYear.slug,
                });
            },
            changelogMonth: (changelogMonth) => {
                breadcrumb.push({
                    title: changelogMonth.title,
                    pointsTo: changelogMonth.slug,
                });
            },
            apiPackage: (apiPackage) => {
                breadcrumb.push({
                    title: apiPackage.title,
                    pointsTo: apiPackage.overviewPageId != null ? apiPackage.slug : apiPackage.pointsTo,
                });
            },
        });
    });

    // Remove breadcrumbs with empty titles
    return breadcrumb.filter((item) => item.title.trim().length > 0);
}
