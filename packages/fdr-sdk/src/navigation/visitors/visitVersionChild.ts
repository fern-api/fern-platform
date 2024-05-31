import { assertNever, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { FernNavigation } from "../generated";

interface VersionChildVisitor<T> {
    tabbed(node: FernNavigation.TabbedNode): T;
    sidebarRoot(node: FernNavigation.SidebarRootNode): T;
}

export function visitVersionChild<T>(node: FernNavigation.VersionChild, visitor: VersionChildVisitor<T>): T {
    return visitDiscriminatedUnion(node, "type")._visit<T>({
        tabbed: visitor.tabbed,
        sidebarRoot: visitor.sidebarRoot,
        _other: (other) => assertNever(other as never),
    });
}
