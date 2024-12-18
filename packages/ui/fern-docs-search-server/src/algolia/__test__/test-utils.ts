import { DocsV2Read } from "@fern-api/fdr-sdk";
import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { mapValues } from "es-toolkit/object";
import fs from "fs";
import path from "path";

const fixturesDir = path.join(__dirname, "../../../../../fdr-sdk/src/__test__/fixtures");

export function readFixture(fixture: string): [DocsV2Read.LoadDocsForUrlResponse, snapshotFilepath: string] {
    const fixturePath = path.join(fixturesDir, `${fixture}.json`);
    const content = fs.readFileSync(fixturePath, "utf-8");
    return [
        JSON.parse(content) as DocsV2Read.LoadDocsForUrlResponse,
        path.join(__dirname, `__snapshots__/${fixture}.json`),
    ];
}

export function readFixtureToRootNode(fixture: DocsV2Read.LoadDocsForUrlResponse): {
    root: FernNavigation.RootNode;
    apis: Record<string, ApiDefinition.ApiDefinition>;
    pages: Record<string, string>;
} {
    const root = FernNavigation.utils.toRootNode(fixture);
    const apis = Object.fromEntries(
        Object.values(fixture.definition.apis).map((api) => {
            return [
                api.id,
                ApiDefinition.ApiDefinitionV1ToLatest.from(api, {
                    useJavaScriptAsTypeScript: false,
                    alwaysEnableJavaScriptFetch: false,
                    usesApplicationJsonInFormDataValue: false,
                }).migrate(),
            ];
        }),
    );
    const pages = mapValues(fixture.definition.pages, (page) => page.markdown);
    return { root, apis, pages };
}
