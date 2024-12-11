import { createMockContext } from "../../../../../__test__/createMockContext.util";
import { XFernBearerTokenVariableNameConverterNode } from "../../auth/XFernBearerTokenVariableNameConverter.node";

describe("XFernBearerTokenVariableNameConverterNode", () => {
    const mockContext = createMockContext();

    it("should parse token variable name", () => {
        const input = {
            "x-fern-token-variable-name": "myToken",
        };

        const node = new XFernBearerTokenVariableNameConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        expect(node.tokenVariableName).toBe("myToken");
        expect(node.convert()).toBe("myToken");
    });

    it("should handle missing token variable name", () => {
        const input = {};

        const node = new XFernBearerTokenVariableNameConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        expect(node.tokenVariableName).toBeUndefined();
        expect(node.convert()).toBeUndefined();
    });
});
