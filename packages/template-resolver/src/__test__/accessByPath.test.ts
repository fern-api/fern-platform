import { accessByPath } from "../accessByPath";

describe("accessByPath", () => {
    it("basic", async () => {
        const object = { a: [{ b: { c: 3 } }] };
        expect(accessByPath(object, "a[0].b.c")).toEqual(3);
        expect(accessByPath(object, ["a", "0", "b", "c"])).toEqual(3);
    });
});
