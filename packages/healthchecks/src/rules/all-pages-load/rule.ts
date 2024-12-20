import { FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import { Rule, RuleArgs, RuleResult } from "../runRules";

export class AllPagesLoadRule implements Rule {
  name = "all-pages-load";
  description = "Check that all URLs are reachable";

  public async run({ fdr, url }: RuleArgs): Promise<RuleResult> {
    const getDocsForUrlResponse = await fdr.docs.v2.read.getDocsForUrl({
      url: FdrAPI.Url(url),
    });
    if (!getDocsForUrlResponse.ok) {
      return {
        name: this.name,
        success: false,
        message: `Failed to load docs for ${url} from FDR`,
      };
    }
    const node = FernNavigation.utils.toRootNode(getDocsForUrlResponse.body);
    const collector = FernNavigation.NodeCollector.collect(node);
    const urls = collector.staticPageSlugs.map(
      (slug) => `${getDocsForUrlResponse.body.baseUrl.domain}/${slug}`
    );

    const responses = await Promise.all(
      urls.map(async (url) => {
        return {
          res: await fetch(`https://${url}`, {
            redirect: "manual",
          }),
          url,
        };
      })
    );
    const failedURLs = responses
      .filter((promise) => promise.res.status >= 400)
      .map((res) => res.url);

    if (failedURLs.length > 0) {
      return {
        name: this.name,
        success: false,
        message: `The following URLs do not load: ${failedURLs.join(", ")}`,
      };
    }

    return {
      name: this.name,
      success: true,
      message: "All URLs are reachable",
    };
  }
}
