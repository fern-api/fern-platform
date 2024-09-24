import { Slug } from ".";

export interface NavigationBreadcrumbItem {
    title: string;
    pointsTo: Slug | undefined;
}
