import { getUnversionedSlug } from "../getUnversionedSlug.js";

describe("getUnversionedSlug", () => {
    it("should return the slug without the current version", () => {
        expect(getUnversionedSlug(["docs", "v1", "foo"], ["v1"], ["docs"])).toEqual(["v1", "foo"]);

        expect(getUnversionedSlug(["docs", "v1", "foo", "bar"], ["docs", "v1"], ["docs"])).toEqual(["foo", "bar"]);

        expect(getUnversionedSlug(["docs", "v1", "foo"], ["v1"], ["docs"])).toEqual(["v1", "foo"]);

        expect(getUnversionedSlug(["docs", "v1", "foo", "bar"], ["docs", "v1"], ["docs"])).toEqual(["foo", "bar"]);

        expect(getUnversionedSlug(["docs", "v1", "foo", "bar"], ["docs", "v1", "foo"], ["docs"])).toEqual(["bar"]);

        expect(getUnversionedSlug(["docs", "v1", "foo", "bar"], ["docs", "v2", "foo"], ["docs"])).toEqual([
            "v1",
            "foo",
            "bar",
        ]);

        expect(getUnversionedSlug(["docs", "v1", "foo", "bar"], [], [])).toEqual(["docs", "v1", "foo", "bar"]);

        expect(getUnversionedSlug(["docs", "v1", "foo", "bar"], [], ["docs"])).toEqual(["v1", "foo", "bar"]);
    });
});
