import urljoin from "url-join";
import { FernNavigation } from "..";
import { NodeCollector } from "../navigation/NodeCollector";

export function testGetAllUrlsFromDocsConfig(
    root: FernNavigation.RootNode,
    domain: string
): void {
    it("gets all urls from docs config", async () => {
        const collector = NodeCollector.collect(root);
        const urls = collector.staticPageSlugs.map((slug) =>
            urljoin(domain, slug)
        );
        expect(urls).toMatchSnapshot();
    });
}
