import { APIV1Read } from "@fern-api/fdr-sdk";
import { flattenApiDefinition } from "@fern-ui/fdr-utils";
import fs from "fs";
import path from "path";
import { DEFAULT_FEATURE_FLAGS } from "../../contexts/FeatureFlagContext";
import { ApiDefinitionResolver } from "../ApiDefinitionResolver";
import { ResolvedEndpointDefinition } from "../types";

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
            "fern.docs.buildwithfern.com",
        );
        expect(resolved).toMatchSnapshot();
    });

    it("should resolve authed and unauthed endpoints", async () => {
        const fixturePath = path.join(__dirname, "fixtures/authed.json");
        const content = fs.readFileSync(fixturePath, "utf-8");

        const fixture = JSON.parse(content) as APIV1Read.ApiDefinition;
        const flattened = flattenApiDefinition(fixture, [], undefined, "documentation.sayari.com");
        const resolved = await ApiDefinitionResolver.resolve(
            "API Reference",
            flattened,
            {},
            undefined,
            DEFAULT_FEATURE_FLAGS,
            "documentation.sayari.com",
        );
        expect(resolved).toMatchSnapshot();
        expect((resolved.items[0] as ResolvedEndpointDefinition).auth).toBeUndefined();
        expect((resolved.items[1] as ResolvedEndpointDefinition).auth?.type).toBe("bearerAuth");
        expect((resolved.items[2] as ResolvedEndpointDefinition).auth).toEqual({
            type: "header",
            headerWireValue: "test-api-key",
        });
    });
});
