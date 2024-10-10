import structuredClone from "@ungap/structured-clone";
import { FernNavigation } from "../..";
import { bfs } from "../../utils/traversers/bfs";
import { prunetree } from "../../utils/traversers/prunetree";
import { mutableDeleteChild } from "./deleteChild";
import { mutableUpdatePointsTo } from "./updatePointsTo";

export class Pruner<ROOT extends FernNavigation.NavigationNode> {
    public static from<ROOT extends FernNavigation.NavigationNode>(tree: ROOT): Pruner<ROOT> {
        return new Pruner(tree);
    }

    private tree: ROOT | undefined;
    private constructor(tree: ROOT) {
        this.tree = structuredClone(tree) as ROOT;
    }

    public keep(predicate: (node: FernNavigation.NavigationNode) => boolean): this {
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

    public hide(predicate: (node: FernNavigation.NavigationNodeWithMetadata) => boolean): this {
        if (this.tree == null) {
            return this;
        }
        bfs(
            this.tree,
            (node) => {
                if (FernNavigation.hasMarkdown(node) && predicate(node)) {
                    node.hidden = true;
                }
            },
            FernNavigation.getChildren,
        );
        return this;
    }

    public authed(predicate: (node: FernNavigation.NavigationNodeWithMetadata) => boolean): this {
        if (this.tree == null) {
            return this;
        }
        bfs(
            this.tree,
            (node) => {
                if (FernNavigation.hasMarkdown(node) && predicate(node)) {
                    node.authed = true;
                }
            },
            FernNavigation.getChildren,
        );
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
