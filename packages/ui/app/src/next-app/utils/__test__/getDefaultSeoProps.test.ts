import { FernNavigation } from "@fern-api/fdr-sdk";
import { getDefaultSeoProps } from "../getSeoProp";

describe("getDefaultSeoProps", () => {
    it("seo disabled", () => {
        const props = getDefaultSeoProps(
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
                },
                parents: [],
            },
            true,
        );
        expect(props.noindex).toBe(true);
        expect(props.nofollow).toBe(true);
    });
});
