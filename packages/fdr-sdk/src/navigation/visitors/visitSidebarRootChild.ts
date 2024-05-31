import { assertNever, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { FernNavigation } from "../generated";

interface RootChildVisitor<T> {
    sidebarGroup: (node: FernNavigation.SidebarGroupNode) => T;
    apiReference: (node: FernNavigation.ApiReferenceNode) => T;
    section: (node: FernNavigation.SectionNode) => T;
}

export function visitSidebarRootChild<T>(node: FernNavigation.SidebarRootChild, visitor: RootChildVisitor<T>): T {
    return visitDiscriminatedUnion(node, "type")._visit<T>({
        sidebarGroup: visitor.sidebarGroup,
        apiReference: visitor.apiReference,
        section: visitor.section,
        _other: (other) => assertNever(other as never),
    });
}
