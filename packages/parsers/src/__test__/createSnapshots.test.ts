import * as fs from "fs";
import yaml from "js-yaml";
import { OpenAPIV3_1 } from "openapi-types";
import * as path from "path";
import { describe, expect, it } from "vitest";
import { BaseAPIConverterNodeContext } from "../BaseApiConverter.node";
import { ErrorCollector } from "../ErrorCollector";
import { ComponentsConverterNode } from "../openapi/3.1/schemas/ComponentsConverter.node";

describe("OpenAPI snapshot tests", () => {
    const fixturesDir = path.join(__dirname, "fixtures");
    const files = fs.readdirSync(fixturesDir).filter((file) => file.endsWith(".yml"));

    files.forEach((file) => {
        it(`generates snapshot for ${file}`, () => {
            // Read and parse YAML file
            const filePath = path.join(fixturesDir, file);
            const fileContents = fs.readFileSync(filePath, "utf8");
            const parsed = yaml.load(fileContents) as OpenAPIV3_1.Document;

            // Create converter context
            const context: BaseAPIConverterNodeContext = {
                logger: {
                    info: () => {},
                    warn: () => {},
                    error: () => {},
                    debug: () => {},
                    log: () => {},
                },
                errors: new ErrorCollector(),
            };

            // Convert components if they exist
            let converted;
            if (parsed.components?.schemas) {
                const converter = new ComponentsConverterNode(parsed.components, context, [], "test");
                console.log("errors", converter.errors());
                console.log("warnings", converter.warnings());
                converted = converter.convert();
            }

            // Create snapshot
            expect(converted).toMatchSnapshot();
        });
    });
});
