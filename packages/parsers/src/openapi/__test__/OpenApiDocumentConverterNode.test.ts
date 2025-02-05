import * as fs from "fs";
import yaml from "js-yaml";
import { OpenAPIV3_1 } from "openapi-types";
import * as path from "path";
import { describe, expect, it } from "vitest";
import { ApiDefinitionId } from "../../client/generated/api";
import { ErrorCollector } from "../../ErrorCollector";
import { OpenApiDocumentConverterNode } from "../3.1/OpenApiDocumentConverter.node";
import { BaseOpenApiV3_1ConverterNodeContext } from "../BaseOpenApiV3_1Converter.node";

function replaceEndpointUUIDs(json: string): string | undefined {
  return json?.replace(
    /"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"/g,
    '"test-uuid-replacement"'
  );
}

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
      const errors = [];
      const warnings = [];

      // expect(parsed.components?.schemas).toBeDefined();

      const converter = new OpenApiDocumentConverterNode({
        input: parsed,
        context,
        accessPath: [],
        pathId: undefined,
      });
      errors.push(...converter.errors());
      warnings.push(...converter.warnings());
      const converted = converter.convert();

      if (errors.length > 0) {
        await expect(errors).toMatchFileSnapshot(
          `./__snapshots__/pathing/errors/${directory}.txt`
        );
      }
      if (warnings.length > 0) {
        await expect(warnings).toMatchFileSnapshot(
          `./__snapshots__/pathing/warnings/${directory}.txt`
        );
      }

      if (converted) {
        converted.id = ApiDefinitionId("test-uuid-replacement");
      }
      await expect(
        replaceEndpointUUIDs(JSON.stringify(converted, null, 2))
      ).toMatchFileSnapshot(`./__snapshots__/${directory}.json`);
    });
  });
});
