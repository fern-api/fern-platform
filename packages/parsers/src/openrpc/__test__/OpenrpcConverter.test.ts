import { OpenrpcDocument } from "@open-rpc/meta-schema";
import * as fs from "fs";
import yaml from "js-yaml";
import * as path from "path";
import { describe, expect, it } from "vitest";

import { OpenrpcDocumentConverterNode } from "../1.x/OpenrpcDocumentConverter.node";
import { createMockContext } from "./createMockContext.util";

function replaceEndpointUUIDs(json: string): string {
  return json.replace(
    /"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"/g,
    '"test-uuid-replacement"'
  );
}

describe("OpenRPC converter", () => {
  const fixturesDir = path.join(__dirname, "fixtures");
  const files = fs.readdirSync(fixturesDir);

  files.forEach((directory) => {
    it(`generates snapshot for ${directory}`, async () => {
      // Read and parse YAML file
      const filePath = path.join(fixturesDir, directory, "openrpc.json");
      const fileContents = fs.readFileSync(filePath, "utf8");
      const parsed = yaml.load(fileContents) as OpenrpcDocument;

      // Convert components if they exist
      let converted;
      const errors = [];
      const warnings = [];

      if (parsed.components?.schemas) {
        const converter = new OpenrpcDocumentConverterNode({
          input: parsed,
          context: createMockContext(parsed),
          accessPath: [],
          pathId: directory,
        });
        errors.push(...converter.errors());
        warnings.push(...converter.warnings());
        converted = converter.convert();
      }

      // Create snapshot
      if (errors.length > 0) {
        // console.error("errors:", errors);
      }
      // expect(errors).toHaveLength(0);
      if (warnings.length > 0) {
        // console.warn("warnings:", warnings);
      }
      await expect(
        replaceEndpointUUIDs(JSON.stringify(converted, null, 2))
      ).toMatchFileSnapshot(`./__snapshots__/${directory}.json`);
    });
  });
});
