import { assertNever, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { FernNavigation } from "../generated";

interface TabChildVisitor<T> {
    tab(node: FernNavigation.TabNode): T;
    link(node: FernNavigation.LinkNode): T;
    changelog(node: FernNavigation.ChangelogNode): T;
}

export function visitTabChild<T>(node: FernNavigation.TabChild, visitor: TabChildVisitor<T>): T {
    return visitDiscriminatedUnion(node, "type")._visit<T>({
        tab: visitor.tab,
        link: visitor.link,
        changelog: visitor.changelog,
        _other: (other) => assertNever(other as never),
    });
}
