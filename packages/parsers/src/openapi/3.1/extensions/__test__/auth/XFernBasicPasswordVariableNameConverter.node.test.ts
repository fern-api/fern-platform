import { createMockContext } from "../../../../../__test__/createMockContext.util";
import { XFernBasicPasswordVariableNameConverterNode } from "../../auth/XFernBasicPasswordVariableNameConverter.node";

describe("XFernBasicPasswordVariableNameConverterNode", () => {
    const mockContext = createMockContext();

    it("should parse password variable name", () => {
        const input = {
            "x-fern-password-variable-name": "myPassword",
        };

        const node = new XFernBasicPasswordVariableNameConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        expect(node.passwordVariableName).toBe("myPassword");
        expect(node.convert()).toBe("myPassword");
    });

    it("should handle missing password variable name", () => {
        const input = {};

        const node = new XFernBasicPasswordVariableNameConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        expect(node.passwordVariableName).toBeUndefined();
        expect(node.convert()).toBeUndefined();
    });
});
