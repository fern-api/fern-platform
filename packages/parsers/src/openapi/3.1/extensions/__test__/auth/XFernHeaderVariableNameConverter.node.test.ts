import { createMockContext } from "../../../../../__test__/createMockContext.util";
import { XFernHeaderVariableNameConverterNode } from "../../auth/XFernHeaderVariableNameConverter.node";

describe("XFernHeaderVariableNameConverterNode", () => {
    const mockContext = createMockContext();

    it("should parse header variable name", () => {
        const input = {
            "x-fern-header-variable-name": "myHeader",
        };

        const node = new XFernHeaderVariableNameConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        expect(node.headerVariableName).toBe("myHeader");
        expect(node.convert()).toBe("myHeader");
    });

    it("should handle missing header variable name", () => {
        const input = {};

        const node = new XFernHeaderVariableNameConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        expect(node.headerVariableName).toBeUndefined();
        expect(node.convert()).toBeUndefined();
    });
});
