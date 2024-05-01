import { APIV1Read } from "@fern-api/fdr-sdk";
import { flattenApiDefinition } from "@fern-ui/fdr-utils";
import fs from "fs";
import path from "path";
import { DEFAULT_FEATURE_FLAGS } from "../../contexts/FeatureFlagContext";
import { ApiDefinitionResolver } from "../ApiDefinitionResolver";

describe("resolveApiDefinition", () => {
    it("should finish resolving", async () => {
        const fixturePath = path.join(__dirname, "fixtures/recursive-reference.json");
        const content = fs.readFileSync(fixturePath, "utf-8");

        const fixture = JSON.parse(content) as APIV1Read.ApiDefinition;
        const flattened = flattenApiDefinition(fixture, [], undefined, "docs.buildwithfern.com");
        const resolved = await ApiDefinitionResolver.resolve(
            "API Reference",
            flattened,
            {},
            undefined,
            DEFAULT_FEATURE_FLAGS,
        );
        expect(resolved).toMatchSnapshot();
    });
});
