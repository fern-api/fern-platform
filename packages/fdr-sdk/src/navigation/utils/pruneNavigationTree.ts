import structuredClone from "@ungap/structured-clone";
import { FernNavigation } from "../..";
import { prunetree } from "../../utils/traversers/prunetree";
import { mutableDeleteChild } from "./deleteChild";
import { mutableUpdatePointsTo } from "./updatePointsTo";

type Predicate<T extends FernNavigation.NavigationNode = FernNavigation.NavigationNode> = (
    node: T,
    parents: readonly FernNavigation.NavigationNodeParent[],
) => boolean;

export class Pruner<ROOT extends FernNavigation.NavigationNode> {
    public static from<ROOT extends FernNavigation.NavigationNode>(tree: ROOT): Pruner<ROOT> {
        return new Pruner(tree);
    }

    private tree: ROOT | undefined;
    private constructor(tree: ROOT) {
        this.tree = structuredClone(tree) as ROOT;
    }

    public keep(predicate: Predicate): this {
        if (this.tree == null) {
            return this;
        }
        const [result] = prunetree(this.tree, {
            predicate,
            getChildren: FernNavigation.getChildren,
            getPointer: (node) => node.id,
            deleter: mutableDeleteChild,
        });
        this.tree = result;
        return this;
    }

    public remove(predicate: Predicate): this {
        return this.keep((node, parents) => !predicate(node, parents));
    }

    public hide(predicate: Predicate<FernNavigation.NavigationNodeWithMetadata>): this {
        if (this.tree == null) {
            return this;
        }
        FernNavigation.traverseBF(this.tree, (node, parents) => {
            if (FernNavigation.hasMetadata(node)) {
                node.hidden = predicate(node, parents) ? true : undefined;
            }
        });
        return this;
    }

    public authed(predicate: Predicate<FernNavigation.NavigationNodeWithMetadata>): this {
        if (this.tree == null) {
            return this;
        }
        FernNavigation.traverseBF(this.tree, (node, parents) => {
            if (FernNavigation.hasMetadata(node)) {
                node.authed = predicate(node, parents) ? true : undefined;
            }
        });
        return this;
    }

    public get(): ROOT | undefined {
        if (this.tree == null) {
            return undefined;
        }
        mutableUpdatePointsTo(this.tree);
        return this.tree;
    }
}
