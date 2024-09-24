import type { FernNavigation } from "../..";

export interface NavigationBreadcrumbItem {
    title: string;
    pointsTo: FernNavigation.Slug | undefined;
}
