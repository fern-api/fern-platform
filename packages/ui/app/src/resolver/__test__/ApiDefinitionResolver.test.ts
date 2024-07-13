import { DEFAULT_FEATURE_FLAGS } from "@/atoms";
import { APIV1Read, FernNavigation } from "@fern-api/fdr-sdk";
import fs from "fs";
import path from "path";
import { ApiDefinitionResolver } from "../ApiDefinitionResolver";
import { ApiTypeResolver } from "../ApiTypeResolver";
import { ResolvedEndpointDefinition } from "../types";

describe("resolveApiDefinition", () => {
    it("should finish resolving", async () => {
        const fixturePath = path.join(__dirname, "fixtures/recursive-reference.json");
        const content = fs.readFileSync(fixturePath, "utf-8");

        const fixture = JSON.parse(content) as APIV1Read.ApiDefinition;
        const holder = FernNavigation.ApiDefinitionHolder.create(fixture);
        const typeResolver = new ApiTypeResolver(fixture.types, undefined);

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
            FernNavigation.SlugGenerator.init(""),
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

    it("should resolve authed and unauthed endpoints", async () => {
        const fixturePath = path.join(__dirname, "fixtures/authed.json");
        const content = fs.readFileSync(fixturePath, "utf-8");

        const fixture = JSON.parse(content) as APIV1Read.ApiDefinition;
        const holder = FernNavigation.ApiDefinitionHolder.create(fixture);
        const typeResolver = new ApiTypeResolver(fixture.types, undefined);

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
            FernNavigation.SlugGenerator.init(""),
        );

        const resolved = await ApiDefinitionResolver.resolve(
            node,
            holder,
            typeResolver,
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
