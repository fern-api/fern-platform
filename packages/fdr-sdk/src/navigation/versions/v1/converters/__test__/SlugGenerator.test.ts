import { SlugGenerator } from "../SlugGenerator";

describe("SlugGenerator", () => {
    it("should throw error if version is already set", () => {
        expect(() => {
            SlugGenerator.init("base")
                .setVersionSlug("version")
                .setVersionSlug("version2");
        }).toThrowError("Version already set");
    });

    it("should append slug", () => {
        const slug = SlugGenerator.init("base").append("slug");
        expect(slug.get()).toBe("base/slug");
    });

    it("should append basepath to set slug", () => {
        const slug = SlugGenerator.init("base").set("slug");
        expect(slug.get()).toBe("base/slug");
    });

    it("should not append basepath to set slug if basepath is present", () => {
        const slug = SlugGenerator.init("base").set("base/slug");
        expect(slug.get()).toBe("base/slug");
    });

    it("should append version to set slug", () => {
        const slug = SlugGenerator.init("base")
            .setVersionSlug("version")
            .set("slug");
        expect(slug.get()).toBe("base/version/slug");
    });

    it("should not append version to set slug if version is present", () => {
        const slug = SlugGenerator.init("base")
            .setVersionSlug("version")
            .set("base/version/slug");
        expect(slug.get()).toBe("base/version/slug");
    });

    it("should insert version slug to set slug if basepath is present", () => {
        const slug = SlugGenerator.init("base")
            .setVersionSlug("version")
            .set("base/slug");
        expect(slug.get()).toBe("base/version/slug");
    });

    it("should handle malformed path", () => {
        const slug = SlugGenerator.init("/base")
            .setVersionSlug("version ")
            .append("//slug");
        expect(slug.get()).toBe("base/version/slug");
    });
});
