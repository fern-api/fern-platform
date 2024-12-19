import { prunetree } from "../prunetree";
import { DeleterAction } from "../types";
import { FIXTURE, Record } from "./fixture";

const DELETER = (parent: Record | undefined, child: Record): DeleterAction => {
    if (parent == null) {
        return "deleted";
    }
    parent.children = parent.children.filter((c) => c.id !== child.id);

    if (parent.children.length === 0) {
        return "should-delete-parent";
    }

    return "deleted";
};

const testPruner = (
    predicate: (node: Record) => boolean
): Record | undefined => {
    const [pruned] = prunetree<Record, Record, Record, number>(
        structuredClone(FIXTURE),
        {
            predicate,
            getChildren: (node) => node.children,
            deleter: DELETER,
            getPointer: (node) => node.id,
        }
    );
    return pruned;
};

describe("prunetree", () => {
    it("should return the same tree if the predicate returns true for all nodes", () => {
        const pruned = testPruner(() => {
            return true;
        });
        expect(pruned).toStrictEqual(FIXTURE);
    });

    it("should return undefined if the predicate returns false for all nodes", () => {
        const pruned = testPruner(() => {
            return false;
        });
        expect(pruned).toBeUndefined();
    });

    it("should prune the tree if the predicate returns false for some nodes", () => {
        const pruned = testPruner((node) => {
            return node.id !== 1;
        });
        expect(pruned).toStrictEqual({
            id: 0,
            children: [
                {
                    id: 6,
                    children: [
                        {
                            id: 7,
                            children: [],
                        },
                    ],
                },
            ],
        });
    });

    it("should prune parents that don't have children, but not leaf nodes", () => {
        const pruned = testPruner((node) => {
            return node.id !== 7 && node.id !== 3;
        });
        expect(pruned).toStrictEqual({
            id: 0,
            children: [
                {
                    id: 1,
                    children: [
                        {
                            id: 4,
                            children: [
                                {
                                    id: 5,
                                    children: [],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });
});
