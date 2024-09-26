import urljoin from "url-join";
import { FernNavigation } from "../..";
import { NodeCollector } from "../NodeCollector";

export function testGetAllUrlsFromDocsConfig(root: FernNavigation.RootNode, domain: string): void {
    it("gets all urls from docs config", async () => {
        const slugCollector = NodeCollector.collect(root);
        const urls = slugCollector.pageSlugs.map((slug) => urljoin(domain, slug));
        expect(urls).toMatchSnapshot();
    });
}
