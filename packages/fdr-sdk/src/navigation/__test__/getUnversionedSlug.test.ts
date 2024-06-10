import urljoin from "url-join";
import { getUnversionedSlug } from "../utils/getUnversionedSlug";

describe("getUnversionedSlug", () => {
    it("should return the slug without the current version", () => {
        expect(getUnversionedSlug(urljoin(["docs", "v1", "foo"]), "v1", "docs")).toEqual(urljoin(["v1", "foo"]));

        expect(getUnversionedSlug(urljoin(["docs", "v1", "foo", "bar"]), urljoin(["docs", "v1"]), "docs")).toEqual(
            urljoin(["foo", "bar"]),
        );

        expect(getUnversionedSlug(urljoin(["docs", "v1", "foo"]), "v1", "docs")).toEqual(urljoin(["v1", "foo"]));

        expect(getUnversionedSlug(urljoin(["docs", "v1", "foo", "bar"]), urljoin(["docs", "v1"]), "docs")).toEqual(
            urljoin(["foo", "bar"]),
        );

        expect(
            getUnversionedSlug(urljoin(["docs", "v1", "foo", "bar"]), urljoin(["docs", "v1", "foo"]), "docs"),
        ).toEqual("bar");

        expect(
            getUnversionedSlug(urljoin(["docs", "v1", "foo", "bar"]), urljoin(["docs", "v2", "foo"]), "docs"),
        ).toEqual(urljoin(["v1", "foo", "bar"]));

        expect(getUnversionedSlug(urljoin(["docs", "v1", "foo", "bar"]), "", "")).toEqual(
            urljoin(["docs", "v1", "foo", "bar"]),
        );

        expect(getUnversionedSlug(urljoin(["docs", "v1", "foo", "bar"]), "", "docs")).toEqual(
            urljoin(["v1", "foo", "bar"]),
        );
    });
});
