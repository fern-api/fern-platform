import { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { DEFAULT_FEATURE_FLAGS } from "@fern-ui/fern-docs-utils";
import fs from "fs";
import path from "path";
import { serializeMdx } from "../../mdx/bundlers/next-mdx-remote";
import { ApiDefinitionResolver } from "../ApiDefinitionResolver";
import { ResolvedEndpointDefinition } from "../types";

describe("resolveApiDefinition", () => {
    it("should finish resolving", async () => {
        const fixturePath = path.join(__dirname, "fixtures/recursive-reference.json");
        const content = fs.readFileSync(fixturePath, "utf-8");

        const fixture = JSON.parse(content) as APIV1Read.ApiDefinition;
        const holder = FernNavigation.ApiDefinitionHolder.create(fixture);

        // mocked node
        const v1 = FernNavigation.V1.ApiReferenceNavigationConverter.convert(
            {
                title: "API Reference",
                api: fixture.id,
                skipUrlSlug: false,
                showErrors: true,
                urlSlug: "api-reference",
                artifacts: undefined,
                changelog: undefined,
                navigation: undefined,
                longScrolling: undefined,
                flattened: undefined,
                icon: undefined,
                hidden: undefined,
                fullSlug: undefined,
            },
            fixture,
        );
        const node = FernNavigation.migrate.FernNavigationV1ToLatest.create().apiReference(v1, []);
        const collector = FernNavigation.NodeCollector.collect(node);

        const resolved = await ApiDefinitionResolver.resolve(
            collector,
            node,
            holder,
            {},
            undefined,
            DEFAULT_FEATURE_FLAGS,
            serializeMdx,
        );
        expect(resolved).toMatchSnapshot();
    });

    it("should resolve authed and unauthed endpoints", async () => {
        const fixturePath = path.join(__dirname, "fixtures/authed.json");
        const content = fs.readFileSync(fixturePath, "utf-8");

        const fixture = JSON.parse(content) as APIV1Read.ApiDefinition;
        const holder = FernNavigation.ApiDefinitionHolder.create(fixture);

        // mocked node
        const v1 = FernNavigation.V1.ApiReferenceNavigationConverter.convert(
            {
                title: "API Reference",
                api: fixture.id,
                skipUrlSlug: false,
                showErrors: true,
                urlSlug: "api-reference",
                artifacts: undefined,
                changelog: undefined,
                navigation: undefined,
                longScrolling: undefined,
                flattened: undefined,
                icon: undefined,
                hidden: undefined,
                fullSlug: undefined,
            },
            fixture,
        );
        const node = FernNavigation.migrate.FernNavigationV1ToLatest.create().apiReference(v1, []);
        const collector = FernNavigation.NodeCollector.collect(node);

        const resolved = await ApiDefinitionResolver.resolve(
            collector,
            node,
            holder,
            {},
            undefined,
            DEFAULT_FEATURE_FLAGS,
            serializeMdx,
        );
        expect(resolved).toMatchSnapshot();
        // eslint-disable-next-line deprecation/deprecation
        expect((resolved.items[0] as ResolvedEndpointDefinition).auth).toBeUndefined();
        // eslint-disable-next-line deprecation/deprecation
        expect((resolved.items[1] as ResolvedEndpointDefinition).auth?.type).toBe("bearerAuth");
        // eslint-disable-next-line deprecation/deprecation
        expect((resolved.items[2] as ResolvedEndpointDefinition).auth).toEqual({
            type: "header",
            headerWireValue: "test-api-key",
        });
    });
});
