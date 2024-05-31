import { assertNever, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { FernNavigation } from "../generated";

interface NavigationChildVisitor<T> {
    apiReference(node: FernNavigation.ApiReferenceNode): T;
    section(node: FernNavigation.SectionNode): T;
    page(node: FernNavigation.PageNode): T;
    link(node: FernNavigation.LinkNode): T;
    changelog(node: FernNavigation.ChangelogNode): T;
}

export function visitNavigationChild<T>(node: FernNavigation.NavigationChild, visitor: NavigationChildVisitor<T>): T {
    return visitDiscriminatedUnion(node, "type")._visit<T>({
        apiReference: visitor.apiReference,
        section: visitor.section,
        page: visitor.page,
        link: visitor.link,
        changelog: visitor.changelog,
        _other: (other) => assertNever(other as never),
    });
}
