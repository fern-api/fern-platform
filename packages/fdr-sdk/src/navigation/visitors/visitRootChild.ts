import { assertNever, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { FernNavigation } from "../generated";

interface RootChildVisitor<T> {
    versioned(node: FernNavigation.VersionedNode): T;
    tabbed(node: FernNavigation.TabbedNode): T;
    sidebarRoot(node: FernNavigation.SidebarRootNode): T;
}

export function visitRootChild<T>(node: FernNavigation.RootChild, visitor: RootChildVisitor<T>): T {
    return visitDiscriminatedUnion(node, "type")._visit<T>({
        versioned: visitor.versioned,
        tabbed: visitor.tabbed,
        sidebarRoot: visitor.sidebarRoot,
        _other: (other) => assertNever(other as never),
    });
}
