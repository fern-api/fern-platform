import { APIV1Read, FernNavigation } from "@fern-api/fdr-sdk";
import fs from "fs";
import path from "path";
import { DEFAULT_FEATURE_FLAGS } from "../../contexts/FeatureFlagContext";
import { ApiDefinitionResolver } from "../ApiDefinitionResolver";
import { ApiTypeResolver } from "../ApiTypeResolver";

describe("resolveApiDefinition", () => {
    it("should finish resolving", async () => {
        const fixturePath = path.join(__dirname, "fixtures/recursive-reference.json");
        const content = fs.readFileSync(fixturePath, "utf-8");

        const fixture = JSON.parse(content) as APIV1Read.ApiDefinition;
        const holder = FernNavigation.ApiDefinitionHolder.create(fixture);
        const typeResolver = new ApiTypeResolver(fixture.types);

        // mocked node
        const node = FernNavigation.ApiReferenceNavigationConverter.convert(
            {
                title: "API Reference",
                api: fixture.id,
                skipUrlSlug: false,
                showErrors: true,
                urlSlug: "api-reference",
            },
            fixture,
            "",
            "",
        );

        const resolved = await ApiDefinitionResolver.resolve(
            node,
            holder,
            typeResolver,
            {},
            undefined,
            DEFAULT_FEATURE_FLAGS,
            "fern.docs.buildwithfern.com",
        );
        expect(resolved).toMatchSnapshot();
    });
});
