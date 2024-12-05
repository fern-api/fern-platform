import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { basePathExtensionKey } from "../../../types/extension.types";
import { XFernBasePathConverterNode } from "../XFernBasePathConverter.node";

describe("XFernGroupNameConverterNode", () => {
    const mockContext = createMockContext();

    describe("parse", () => {
        it(`sets basePath from ${basePathExtensionKey} when present`, () => {
            const converter = new XFernBasePathConverterNode({
                input: { [basePathExtensionKey]: "/v1" } as unknown as OpenAPIV3_1.Document,
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.basePath).toBe("v1");
        });

        it(`properly formats ${basePathExtensionKey} with slashes`, () => {
            const converter = new XFernBasePathConverterNode({
                input: { [basePathExtensionKey]: "/v1/" } as unknown as OpenAPIV3_1.Document,
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.basePath).toBe("v1");
        });

        it(`sets basePath to undefined when ${basePathExtensionKey} is not present`, () => {
            const converter = new XFernBasePathConverterNode({
                input: {} as unknown as OpenAPIV3_1.Document,
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.basePath).toBeUndefined();
        });

        it(`sets basePath to undefined when ${basePathExtensionKey} is explicitly null`, () => {
            const converter = new XFernBasePathConverterNode({
                input: { [basePathExtensionKey]: null } as unknown as OpenAPIV3_1.Document,
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.basePath).toBeUndefined();
        });
    });

    describe("convert", () => {
        it("returns the basePath value", () => {
            const converter = new XFernBasePathConverterNode({
                input: { [basePathExtensionKey]: "/v1" } as unknown as OpenAPIV3_1.Document,
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.convert()).toBe("v1");
        });

        it("returns undefined when basePath is not set", () => {
            const converter = new XFernBasePathConverterNode({
                input: {} as unknown as OpenAPIV3_1.Document,
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.convert()).toBeUndefined();
        });
    });
});
