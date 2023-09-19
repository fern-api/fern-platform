import { DocsV1Db } from "../../api";
import { getReferencedApiDefinitionIds } from "../../converters/db/convertDocsDefinitionToDb";

it("definition register", async () => {
    const navigationConfig: DocsV1Db.NavigationConfig = {
        items: [
            {
                type: "api",
                title: "API Reference",
                api: "123405930",
                urlSlug: "myUrl",
                skipUrlSlug: false,
                showErrors: true,
            },
        ],
    };
    const referencedApiDefinitionIds = getReferencedApiDefinitionIds(navigationConfig);
    expect(referencedApiDefinitionIds).toEqual(["123405930"]);
});
