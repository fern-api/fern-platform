import { getReferencedApiDefinitionIds } from "../../controllers/docs/transformDocsDefinitionToDb";
import * as FernRegistryDocsDb from "../../generated/api/resources/docs/resources/v1/resources/db";

it("definition register", async () => {
    const navigationConfig: FernRegistryDocsDb.NavigationConfig = {
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
