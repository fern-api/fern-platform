import * as fs from "fs";
import yaml from "js-yaml";
import { OpenAPIV3_1 } from "openapi-types";
import * as path from "path";
import { describe, expect, it } from "vitest";
import { ErrorCollector } from "../ErrorCollector";
import { OpenApiDocumentConverterNode } from "../openapi/3.1/schemas/OpenApiDocumentConverter.node";
import { BaseOpenApiV3_1ConverterNodeContext } from "../openapi/BaseOpenApiV3_1Converter.node";

describe("OpenAPI snapshot tests", () => {
    const fixturesDir = path.join(__dirname, "fixtures");
    const files = fs.readdirSync(fixturesDir);

    files.forEach((directory) => {
        it(`generates snapshot for ${directory}`, async () => {
            // Read and parse YAML file
            const filePath = path.join(fixturesDir, directory, "openapi.yml");
            const fileContents = fs.readFileSync(filePath, "utf8");
            const parsed = yaml.load(fileContents) as OpenAPIV3_1.Document;

            // Create converter context
            const context: BaseOpenApiV3_1ConverterNodeContext = {
                document: parsed,
                logger: {
                    info: () => undefined,
                    warn: () => undefined,
                    error: () => undefined,
                    debug: () => undefined,
                    log: () => undefined,
                },
                errors: new ErrorCollector(),
            };

            // Convert components if they exist
            let converted;
            const errors = [];
            const warnings = [];

            expect(parsed.components?.schemas).toBeDefined();

            if (parsed.components?.schemas) {
                const converter = new OpenApiDocumentConverterNode({
                    input: parsed,
                    context,
                    accessPath: [],
                    pathId: "test",
                });
                errors.push(...converter.errors());
                warnings.push(...converter.warnings());
                converted = converter.convert();
            }

            // Create snapshot
            expect(errors).toHaveLength(0);
            if (warnings.length > 0) {
                // eslint-disable-next-line no-console
                console.warn("warnings:", warnings);
            }
            // @ts-expect-error id is not part of the expected output
            converted.id = "test-uuid-replacement";
            await expect(JSON.stringify(converted, null, 2)).toMatchFileSnapshot(
                `./__snapshots__/openapi/${directory}.json`,
            );
        });
    });
});
