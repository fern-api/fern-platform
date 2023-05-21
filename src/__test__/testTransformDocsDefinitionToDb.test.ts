import * as FernRegistryDocsRead from "../generated/api/resources/docs/resources/v1/resources/read";
import { getReferencedApiDefinitionIds } from "../services/docs/transformDocsDefinitionToDb";

it("definition register", async () => {
    const navigationConfig: FernRegistryDocsRead.NavigationConfig = {
        items: [
            {
                type: "api",
                title: "API Reference",
                api: "123405930",
                urlSlug: "myUrl",
            },
        ],
    };
    const referencedApiDefinitionIds = getReferencedApiDefinitionIds(navigationConfig);
    expect(referencedApiDefinitionIds).toEqual(["123405930"]);
});
