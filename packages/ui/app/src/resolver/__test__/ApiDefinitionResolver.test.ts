import { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import fs from "fs";
import path from "path";
import { DEFAULT_FEATURE_FLAGS } from "../../atoms";
import { ApiTypeResolver } from "../ApiTypeResolver";
import { ApiDefinitionResolver } from "../resolveApiDefinition";
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
            {},
            {},
            FernNavigation.SlugGenerator.init(""),
        );
        const collector = FernNavigation.NodeCollector.collect(node);

        const resolved = await ApiDefinitionResolver.resolve(
            collector,
            node,
            holder,
            typeResolver,
            {},
            undefined,
            DEFAULT_FEATURE_FLAGS,
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
            {},
            {},
            FernNavigation.SlugGenerator.init(""),
        );
        const collector = FernNavigation.NodeCollector.collect(node);

        const resolved = await ApiDefinitionResolver.resolve(
            collector,
            node,
            holder,
            typeResolver,
            {},
            undefined,
            DEFAULT_FEATURE_FLAGS,
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
