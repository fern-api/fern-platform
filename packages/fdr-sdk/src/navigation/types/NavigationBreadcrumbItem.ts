import type { FernNavigation } from "../generated";

export interface NavigationBreadcrumbItem {
    title: string;
    pointsTo: FernNavigation.Slug | undefined;
}
