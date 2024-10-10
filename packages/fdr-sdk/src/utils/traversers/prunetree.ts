import { bfs } from "./bfs";
import { DeleterAction } from "./types";

interface PruneTreeOptions<NODE, PARENT extends NODE = NODE, POINTER = NODE> {
    /**
     * @param node the node to check
     * @returns **false** if the node SHOULD be deleted
     */
    predicate: (node: NODE, parents: readonly PARENT[]) => boolean;
    getChildren: (node: PARENT) => readonly NODE[];

    /**
     * @param parent the parent node
     * @param child the child that should be deleted
     * @returns the pointer to the child node, or **null** if the child cannot be deleted
     */
    deleter: (parent: PARENT | undefined, child: NODE) => DeleterAction;

    /**
     * If there are circular references, we can use this function to get a unique identifier for the node.
     *
     * @param node
     * @returns the unique identifier for the node
     * @default node => node as unknown as POINTER (the reference itself is used as the identifier)
     */
    getPointer?: (node: NODE) => POINTER;
}

export function prunetree<NODE, ROOT extends NODE = NODE, PARENT extends NODE = NODE, POINTER = NODE>(
    root: ROOT,
    opts: PruneTreeOptions<NODE, PARENT, POINTER>,
): [result: ROOT | undefined, deleted: ReadonlySet<POINTER>] {
    const { predicate, getChildren, deleter, getPointer = (node) => node as unknown as POINTER } = opts;

    const deleted = new Set<POINTER>();

    const nodes: [NODE, readonly PARENT[]][] = [];

    bfs(
        root,
        (node, parents) => {
            nodes.unshift([node, parents]);
        },
        getChildren,
    );

    nodes.forEach(([node, parents]) => {
        const order = [...parents, node];
        const deletedIdx = order.findIndex((n) => deleted.has(getPointer(n)));
        if (deletedIdx !== -1) {
            order.slice(deletedIdx).forEach((n) => deleted.add(getPointer(n)));
            return;
        }

        // continue traversal if the node is not to be deleted
        if (predicate(node, parents)) {
            return;
        }
        const ancestors = [...parents];
        const parent = ancestors.pop();

        let action = deleter(parent, node);
        let toDelete = node;

        while (action === "should-delete-parent" && parent != null) {
            deleted.add(getPointer(toDelete));
            toDelete = parent;
            action = deleter(ancestors.pop(), parent);
        }

        if (action === "deleted") {
            deleted.add(getPointer(toDelete));
        }
    });

    if (deleted.has(getPointer(root))) {
        return [undefined, deleted];
    }

    return [root, deleted];
}
