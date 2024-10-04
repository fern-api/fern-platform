import { prunetree } from "../prunetree";
import { FIXTURE, Record } from "./fixture";

describe("prunetree", () => {
    it("should return the same tree if the predicate returns true for all nodes", () => {
        const [pruned] = prunetree<Record, Record, Record, number>(structuredClone(FIXTURE), {
            predicate: () => {
                return true;
            },
            getChildren: (node) => node.children,
            deleter: (parent, child) => {
                parent.children = parent.children.filter((c) => c.id !== child.id);
                return child.id;
            },
            getPointer: (node) => node.id,
        });
        expect(pruned).toStrictEqual(FIXTURE);
    });

    it("should return undefined if the predicate returns false for all nodes", () => {
        const [pruned] = prunetree<Record, Record, Record, number>(structuredClone(FIXTURE), {
            predicate: () => {
                return false;
            },
            getChildren: (node) => node.children,
            deleter: (parent, child) => {
                parent.children = parent.children.filter((c) => c.id !== child.id);
                return child.id;
            },
            getPointer: (node) => node.id,
        });
        expect(pruned).toBeUndefined();
    });

    it("should prune the tree if the predicate returns false for some nodes", () => {
        const [pruned] = prunetree<Record, Record, Record, number>(structuredClone(FIXTURE), {
            predicate: (node) => {
                return node.id !== 1;
            },
            getChildren: (node) => node.children,
            deleter: (parent, child) => {
                parent.children = parent.children.filter((c) => c.id !== child.id);
                return child.id;
            },
            getPointer: (node) => node.id,
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
        const [pruned] = prunetree<Record, Record, Record, number>(structuredClone(FIXTURE), {
            predicate: (node) => {
                return node.id !== 7 && node.id !== 3;
            },
            getChildren: (node) => node.children,
            deleter: (parent, child) => {
                parent.children = parent.children.filter((c) => c.id !== child.id);
                return child.id;
            },
            getPointer: (node) => node.id,
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
