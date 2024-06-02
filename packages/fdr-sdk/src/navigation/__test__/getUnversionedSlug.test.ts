import urljoin from "url-join";

function getUnversionedSlug(
    slug: string,
    currentVersionSlug: string | undefined,
    basePathSlug: string | undefined,
): string {
    if (
        currentVersionSlug != null &&
        slug.startsWith(currentVersionSlug) &&
        (slug.length === currentVersionSlug.length || slug[currentVersionSlug.length] === "/")
    ) {
        return slug.slice(currentVersionSlug.length);
    }

    if (
        basePathSlug != null &&
        slug.startsWith(basePathSlug) &&
        (slug.length === basePathSlug.length || slug[basePathSlug.length] === "/")
    ) {
        return slug.slice(basePathSlug.length);
    }

    return slug;
}

describe("getUnversionedSlug", () => {
    it("should return the slug without the current version", () => {
        expect(getUnversionedSlug(urljoin(["docs", "v1", "foo"]), "v1", "docs")).toEqual(urljoin(["v1", "foo"]));

        expect(getUnversionedSlug(urljoin(["docs", "v1", "foo", "bar"]), urljoin(["docs", "v1"]), "docs")).toEqual(
            urljoin(["foo", "bar"]),
        );

        expect(getUnversionedSlug(urljoin(["docs", "v1", "foo"]), "v1", "docs")).toEqual(["v1", "foo"]);

        expect(getUnversionedSlug(urljoin(["docs", "v1", "foo", "bar"]), urljoin(["docs", "v1"]), "docs")).toEqual([
            "foo",
            "bar",
        ]);

        expect(
            getUnversionedSlug(urljoin(["docs", "v1", "foo", "bar"]), urljoin(["docs", "v1", "foo"]), "docs"),
        ).toEqual(["bar"]);

        expect(
            getUnversionedSlug(urljoin(["docs", "v1", "foo", "bar"]), urljoin(["docs", "v2", "foo"]), "docs"),
        ).toEqual(["v1", "foo", "bar"]);

        expect(getUnversionedSlug(urljoin(["docs", "v1", "foo", "bar"]), "", "")).toEqual(["docs", "v1", "foo", "bar"]);

        expect(getUnversionedSlug(urljoin(["docs", "v1", "foo", "bar"]), "", "docs")).toEqual(["v1", "foo", "bar"]);
    });
});
