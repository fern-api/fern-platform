import { bfs } from "./bfs";

interface PruneTreeOptions<NODE, PARENT extends NODE = NODE, POINTER = NODE> {
    /**
     * @param node the node to check
     * @returns **false** if the node SHOULD be deleted
     */
    predicate: (node: NODE) => boolean;
    getChildren: (node: PARENT) => readonly NODE[];

    /**
     * @param parent the parent node
     * @param child the child that should be deleted
     * @returns the pointer to the child node, or **null** if the child cannot be deleted
     */
    deleter: (parent: PARENT, child: NODE) => POINTER | null;

    /**
     * After the child is deleted, we can check if the parent should be deleted too,
     * e.g. if the parent has no children left.
     *
     * @param parent node
     * @returns **true** if the node should be deleted
     * @default parent => getChildren(parent).length === 0
     */
    shouldDeleteParent?: (parent: PARENT) => boolean;

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
    const {
        predicate,
        getChildren,
        deleter,
        shouldDeleteParent = (parent) => getChildren(parent).length === 0,
        getPointer = (node) => node as unknown as POINTER,
    } = opts;

    const deleted = new Set<POINTER>();

    const visitor = (node: NODE, parents: readonly PARENT[]) => {
        // if the node or its parents was already deleted, we don't need to traverse it
        if ([...parents, node].some((parent) => deleted.has(getPointer(parent)))) {
            return "skip";
        }

        // continue traversal if the node is not to be deleted
        if (predicate(node)) {
            return;
        }

        deleteChildAndMaybeParent(node, parents, {
            deleter,
            shouldDeleteParent,
            getPointer,
        }).forEach((id) => {
            deleted.add(id);
        });

        // since the node was deleted, its children are deleted too
        // we don't need to traverse them, nor do we need to keep them in the tree.
        // note: the deleted set will NOT contain the children of this node
        return "skip";
    };

    bfs(root, visitor, getChildren);

    if (deleted.has(getPointer(root))) {
        return [undefined, deleted];
    }

    return [root, deleted];
}

interface DeleteChildOptions<NODE, PARENT extends NODE = NODE, POINTER = NODE> {
    deleter: (parent: PARENT, child: NODE) => POINTER | null;
    shouldDeleteParent: (parent: PARENT) => boolean;
    getPointer: (node: NODE) => POINTER;
}

function deleteChildAndMaybeParent<NODE, PARENT extends NODE = NODE, POINTER = NODE>(
    node: NODE,
    parents: readonly PARENT[],
    opts: DeleteChildOptions<NODE, PARENT, POINTER>,
): POINTER[] {
    const { deleter, shouldDeleteParent, getPointer } = opts;

    const ancestors = [...parents];
    const parent = ancestors.pop();

    // if the parent is the root, we cannot delete it here
    // so we mark it as deleted and the parent function will be responsible for deleting it
    if (parent == null) {
        return [getPointer(node)];
    }

    const deleted = deleter(parent, node);

    // if the node was not deletable, then we need to delete the parent too
    if (deleted == null) {
        return [getPointer(node), ...deleteChildAndMaybeParent(parent, ancestors, opts)];
    }

    // traverse up the tree and delete the parent if necessary
    if (shouldDeleteParent(parent)) {
        return [getPointer(node), deleted, ...deleteChildAndMaybeParent(parent, ancestors, opts)];
    }

    return [getPointer(node), deleted];
}
