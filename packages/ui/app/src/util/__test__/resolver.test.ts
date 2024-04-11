import { APIV1Read } from "@fern-api/fdr-sdk";
import { flattenApiDefinition } from "@fern-ui/fdr-utils";
import fs from "fs";
import path from "path";
import { resolveApiDefinition } from "../resolver";

describe("resolveApiDefinition", () => {
    it("should finish resolving", async () => {
        const fixturePath = path.join(__dirname, "fixtures/kardfinancialapi.json");
        const content = fs.readFileSync(fixturePath, "utf-8");

        const fixture = JSON.parse(content) as APIV1Read.ApiDefinition;
        const flattened = flattenApiDefinition(fixture, [], undefined);
        expect(resolveApiDefinition("API Reference", flattened, {}, undefined)).toMatchSnapshot();
    });
});
