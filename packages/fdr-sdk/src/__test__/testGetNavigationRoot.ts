import { FernNavigation } from "..";
import { findNode } from "../navigation/utils";

export function testGetNavigationRoot(root: FernNavigation.RootNode, slug: string): void {
    it("gets navigation root for /" + slug, async () => {
        const found = findNode(root, FernNavigation.slugjoin(slug));

        if (found.type === "found") {
            expect(found.node).toMatchSnapshot();
            expect(found.currentVersion?.versionId).toMatchSnapshot();
            expect(found.currentTab?.slug).toMatchSnapshot();
        } else {
            expect(found).toMatchSnapshot();
        }
    });
}
