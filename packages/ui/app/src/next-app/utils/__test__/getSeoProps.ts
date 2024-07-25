import { FernNavigation } from "@fern-api/fdr-sdk";
import { getSeoProps } from "../getSeoProp";

describe("getSeoProps", () => {
    it("seo disabled", () => {
        const props = getSeoProps(
            "host",
            { navigation: { items: [] } },
            {},
            {},
            {},
            {
                node: {
                    id: FernNavigation.NodeId("id"),
                    type: "page",
                    pageId: FernNavigation.PageId("pageId"),
                    title: "page",
                    slug: FernNavigation.Slug("slug"),
                    icon: undefined,
                    hidden: false,
                    noindex: undefined,
                },
                parents: [],
            },
            true,
        );
        expect(props.noindex).toBe(true);
        expect(props.nofollow).toBe(true);
    });
});
