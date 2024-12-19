import { dfs } from "../dfs";
import { FIXTURE } from "./fixture";

describe("dfs", () => {
    it("should traverse the tree in breadth-first order", () => {
        const visited: [number, number[]][] = [];

        dfs(
            FIXTURE,
            (n, p) => {
                visited.push([n.id, p.map((n) => n.id)]);
            },
            (n) => n.children
        );

        expect(visited).toStrictEqual([
            [0, []],
            [1, [0]],
            [2, [0, 1]],
            [3, [0, 1, 2]],
            [4, [0, 1]],
            [5, [0, 1, 4]],
            [6, [0]],
            [7, [0, 6]],
        ]);
    });

    it("should skip nodes if the visitor returns 'skip'", () => {
        const visited: [number, number[]][] = [];
        dfs(
            FIXTURE,
            (n, p) => {
                visited.push([n.id, p.map((n) => n.id)]);
                if (n.id === 1) {
                    return "skip";
                }
                return;
            },
            (p) => p.children
        );

        expect(visited).toStrictEqual([
            [0, []],
            [1, [0]],
            [6, [0]],
            [7, [0, 6]],
        ]);
    });

    it("should stop traversal if the visitor returns false", () => {
        const visited: [number, number[]][] = [];
        dfs(
            FIXTURE,
            (n, p) => {
                visited.push([n.id, p.map((n) => n.id)]);
                if (n.id === 1) {
                    return false;
                }
                return;
            },
            (p) => p.children
        );

        expect(visited).toStrictEqual([
            [0, []],
            [1, [0]],
        ]);
    });
});
