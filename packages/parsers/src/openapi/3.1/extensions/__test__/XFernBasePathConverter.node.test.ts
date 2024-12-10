import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { XFernBasePathConverterNode } from "../XFernBasePathConverter.node";
import { xFernBasePathKey } from "../fernExtension.consts";

describe("XFernGroupNameConverterNode", () => {
    const mockContext = createMockContext();

    describe("parse", () => {
        it(`sets basePath from ${xFernBasePathKey} when present`, () => {
            const converter = new XFernBasePathConverterNode({
                input: { [xFernBasePathKey]: "/v1" } as unknown as OpenAPIV3_1.Document,
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.basePath).toBe("v1");
        });

        it(`properly formats ${xFernBasePathKey} with slashes`, () => {
            const converter = new XFernBasePathConverterNode({
                input: { [xFernBasePathKey]: "/v1/" } as unknown as OpenAPIV3_1.Document,
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.basePath).toBe("v1");
        });

        it(`sets basePath to undefined when ${xFernBasePathKey} is not present`, () => {
            const converter = new XFernBasePathConverterNode({
                input: {} as unknown as OpenAPIV3_1.Document,
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.basePath).toBeUndefined();
        });

        it(`sets basePath to undefined when ${xFernBasePathKey} is explicitly null`, () => {
            const converter = new XFernBasePathConverterNode({
                input: { [xFernBasePathKey]: null } as unknown as OpenAPIV3_1.Document,
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
                input: { [xFernBasePathKey]: "/v1" } as unknown as OpenAPIV3_1.Document,
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
