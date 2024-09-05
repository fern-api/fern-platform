import { noop } from "ts-essentials";
import { visitDiscriminatedUnion } from "../../utils";
import { hasMetadata, isLeaf, type NavigationBreadcrumbItem, type NavigationNode } from "../types";

export function createBreadcrumbs(nodes: NavigationNode[]): readonly NavigationBreadcrumbItem[] {
    const breadcrumb: NavigationBreadcrumbItem[] = [];
    nodes.forEach((node) => {
        if (!hasMetadata(node) || isLeaf(node)) {
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
                    pointsTo: section.pointsTo,
                });
            },
            apiReference: (apiReference) => {
                if (!apiReference.hideTitle) {
                    breadcrumb.push({
                        title: apiReference.title,
                        pointsTo: apiReference.pointsTo,
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
                    pointsTo: apiPackage.pointsTo,
                });
            },
        });
    });

    return breadcrumb;
}
