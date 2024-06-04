import { getAllUrlsFromDocsConfig } from "@fern-ui/fdr-utils";
import { Rule, RuleArgs, RuleResult } from "../runRules";

export class AllPagesLoadRule implements Rule {
    name = "all-pages-load";
    description = "Check that all URLs are reachable";

    public async run({ fdr, url }: RuleArgs): Promise<RuleResult> {
        const getDocsForUrlResponse = await fdr.docs.v2.read.getDocsForUrl({
            url,
        });
        if (!getDocsForUrlResponse.ok) {
            return {
                name: this.name,
                success: false,
                message: `Failed to load docs for ${url} from FDR`,
            };
        }
        const urls = getAllUrlsFromDocsConfig(
            getDocsForUrlResponse.body.baseUrl.domain,
            getDocsForUrlResponse.body.baseUrl.basePath,
            getDocsForUrlResponse.body.definition.config.navigation,
            getDocsForUrlResponse.body.definition.apis,
        );

        const responses = await Promise.all(
            urls.map(async (url) => {
                return {
                    res: await fetch(`https://${url}`, {
                        redirect: "manual",
                    }),
                    url,
                };
            }),
        );
        const failedURLs = responses.filter((promise) => promise.res.status >= 400).map((res) => res.url);

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
