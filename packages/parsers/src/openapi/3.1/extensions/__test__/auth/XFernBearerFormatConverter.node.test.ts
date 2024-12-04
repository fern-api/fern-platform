import { createMockContext } from "../../../../../__test__/createMockContext.util";
import { XFernBearerFormatConverterNode } from "../../auth/XFernBearerFormatConverter.node";

describe("XFernBearerFormatConverterNode", () => {
    const mockContext = createMockContext();

    it("should parse bearer format", () => {
        const input = {
            "x-bearer-format": "JWT",
        };

        const node = new XFernBearerFormatConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        expect(node.bearerFormat).toBe("JWT");
        expect(node.convert()).toBe("JWT");
    });

    it("should handle missing bearer format", () => {
        const input = {};

        const node = new XFernBearerFormatConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        expect(node.bearerFormat).toBeUndefined();
        expect(node.convert()).toBeUndefined();
    });
});
