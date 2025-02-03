import { FernNavigation } from "@fern-api/fdr-sdk";
import { getNodesUnderCurrentVersionAscending } from "../withVersionSwitcherInfo";

describe("getNodesUnderCurrentVersionAscending", () => {
  it("should return nodes under the current version in ascending order", () => {
    const { version, nodes } = getNodesUnderCurrentVersionAscending<
      { type: FernNavigation.NavigationNode["type"]; id: string },
      { type: FernNavigation.VersionNode["type"]; id: string }
    >({ type: "page", id: "a" }, [
      { type: "version", id: "d" },
      { type: "tab", id: "c" },
      { type: "section", id: "b" },
    ]);

    expect(version).toEqual({ type: "version", id: "d" });
    expect(nodes.map((node) => node.id)).toEqual(["a", "b", "c"]);
  });

  it("should return nothing if a version node is not found", () => {
    const { version, nodes } = getNodesUnderCurrentVersionAscending<
      { type: FernNavigation.NavigationNode["type"]; id: string },
      { type: FernNavigation.VersionNode["type"]; id: string }
    >({ type: "page", id: "a" }, [
      { type: "tab", id: "c" },
      { type: "section", id: "b" },
    ]);

    expect(version).toBeUndefined();
    expect(nodes.map((node) => node.id)).toEqual([]);
  });
});
