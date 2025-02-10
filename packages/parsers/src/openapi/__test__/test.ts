import * as fs from "fs";
import yaml from "js-yaml";
import { OpenAPIV3_1 } from "openapi-types";

import { OpenApiDocumentConverterNode } from "../3.1/OpenApiDocumentConverter.node";
import { ErrorCollector } from "../../ErrorCollector";
import { BaseOpenApiV3_1ConverterNodeContext } from "../BaseOpenApiV3_1Converter.node";

const fileContents = fs.readFileSync(
  "/Users/rohinbhargava/fern-platform/packages/parsers/src/openapi/__test__/fixtures/monite/openapi.yml",
  "utf8"
);
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

if (parsed.components?.schemas) {
  const converter = new OpenApiDocumentConverterNode({
    input: parsed,
    context,
    accessPath: ["monite"],
    pathId: undefined,
  });
  errors.push(...converter.errors());
  warnings.push(...converter.warnings());
  converter.convert();
}

// Create snapshot
if (errors.length > 0) {
  // console.error("errors:", errors);
}
// expect(errors).toHaveLength(0);
if (warnings.length > 0) {
  // console.warn("warnings:", warnings);
}
