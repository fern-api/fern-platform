import { FernNavigation } from "../../generated";
import { toDefaultSlug } from "../pruneVersionNode";

describe("toDefaultSlug", () => {
    it("should return the default slug", () => {
        expect(
            toDefaultSlug(
                FernNavigation.Slug("basepath/version/page"),
                FernNavigation.Slug("basepath"),
                FernNavigation.Slug("basepath/version"),
            ),
        ).toEqual(FernNavigation.Slug("basepath/page"));
    });

    it("should be noop if the slug doesn't start with the version slug", () => {
        expect(
            toDefaultSlug(
                FernNavigation.Slug("basepath/page"),
                FernNavigation.Slug("basepath"),
                FernNavigation.Slug("basepath/version"),
            ),
        ).toEqual(FernNavigation.Slug("basepath/page"));
    });
});
