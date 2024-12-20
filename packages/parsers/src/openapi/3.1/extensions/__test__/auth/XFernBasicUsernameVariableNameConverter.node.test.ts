import { createMockContext } from "../../../../../__test__/createMockContext.util";
import { XFernBasicUsernameVariableNameConverterNode } from "../../auth/XFernBasicUsernameVariableNameConverter.node";

describe("XFernBasicUsernameVariableNameConverterNode", () => {
  const mockContext = createMockContext();

  it("should parse username variable name", () => {
    const input = {
      "x-fern-username-variable-name": "myUsername",
    };

    const node = new XFernBasicUsernameVariableNameConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(node.usernameVariableName).toBe("myUsername");
    expect(node.convert()).toBe("myUsername");
  });

  it("should handle missing username variable name", () => {
    const input = {};

    const node = new XFernBasicUsernameVariableNameConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(node.usernameVariableName).toBeUndefined();
    expect(node.convert()).toBeUndefined();
  });
});
