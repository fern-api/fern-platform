import { createMockContext } from "../../../../__test__/createMockContext.util";
import { XFernBasePathConverterNode } from "../XFernBasePathConverter.node";

describe("XFernGroupNameConverterNode", () => {
    const mockContext = createMockContext();

    describe("parse", () => {
        it("sets basePath from x-fern-base-path when present", () => {
            const converter = new XFernBasePathConverterNode({
                input: { "x-fern-base-path": "/v1" },
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.basePath).toBe("v1");
        });

        it("properly formats x-fern-base-path with slashes", () => {
            const converter = new XFernBasePathConverterNode({
                input: { "x-fern-base-path": "/v1/" },
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.basePath).toBe("v1");
        });

        it("sets basePath to undefined when x-fern-base-path is not present", () => {
            const converter = new XFernBasePathConverterNode({
                input: { "": "" },
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
                input: { "x-fern-base-path": "/v1" },
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.convert()).toBe("v1");
        });

        it("returns undefined when basePath is not set", () => {
            const converter = new XFernBasePathConverterNode({
                input: {},
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.convert()).toBeUndefined();
        });
    });
});
