import { OpenAPIV3_1 } from "openapi-types";
import { ServerObjectConverterNode } from "../../../3.1/paths/ServerObjectConverter.node";
import { createMockContext } from "../../../__test__/createMockContext.util";
import { coalesceServers } from "../../3.1/coalesceServers";

describe("coalesceServers", () => {
  const mockContext = createMockContext();

  it("should return empty array when both inputs are undefined", () => {
    const result = coalesceServers(undefined, undefined, mockContext, []);
    expect(result).toEqual([]);
  });

  it("should return existing servers when no new servers to add", () => {
    const existingServer = new ServerObjectConverterNode({
      input: { url: "https://existing.com" },
      context: mockContext,
      accessPath: [],
      pathId: "servers[0]",
    });
    const result = coalesceServers(
      [existingServer],
      undefined,
      mockContext,
      []
    );
    expect(result).toEqual([existingServer]);
  });

  it("should return new servers when no existing servers", () => {
    const newServers: OpenAPIV3_1.ServerObject[] = [
      { url: "https://new1.com" },
      { url: "https://new2.com" },
    ];
    const result = coalesceServers(undefined, newServers, mockContext, []);
    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(ServerObjectConverterNode);
    expect(result[1]).toBeInstanceOf(ServerObjectConverterNode);
  });

  it("should combine existing and new servers", () => {
    const existingServer = new ServerObjectConverterNode({
      input: { url: "https://existing.com" },
      context: mockContext,
      accessPath: [],
      pathId: "servers[0]",
    });
    const newServers: OpenAPIV3_1.ServerObject[] = [{ url: "https://new.com" }];
    const result = coalesceServers(
      [existingServer],
      newServers,
      mockContext,
      []
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(existingServer);
    expect(result[1]).toBeInstanceOf(ServerObjectConverterNode);
  });

  it("should not add new servers containing an existing url", () => {
    const existingServer = new ServerObjectConverterNode({
      input: { url: "https://existing.com" },
      context: mockContext,
      accessPath: [],
      pathId: "servers[0]",
    });
    const newServers: OpenAPIV3_1.ServerObject[] = [
      { url: "https://existing.com" },
      { url: "https://new.com" },
    ];
    const result = coalesceServers(
      [existingServer],
      newServers,
      mockContext,
      []
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(existingServer);
    expect(result[1].url).toBe("https://new.com");
  });
});
