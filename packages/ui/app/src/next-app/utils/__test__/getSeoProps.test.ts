import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
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
                currentVersion: undefined,
                root: { slug: FernNavigation.Slug("") } as FernNavigation.RootNode,
            },
            true,
        );
        expect(props.noindex).toBe(true);
        expect(props.nofollow).toBe(true);
    });
});
