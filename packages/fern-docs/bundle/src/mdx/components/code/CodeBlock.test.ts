import { applyTemplates } from "./CodeBlock";

describe("applyTemplates", () => {
  it("should apply templates", () => {
    expect(applyTemplates("Hello, {{name}}!", { name: "World" })).toBe(
      "Hello, World!"
    );
  });

  it("should handle multiple templates", () => {
    expect(
      applyTemplates("Hello, {{name}}! How are you {{name}}?", {
        name: "World",
      })
    ).toBe("Hello, World! How are you World?");
  });

  it("should handle multiple templates with different keys", () => {
    expect(
      applyTemplates("Hello, {{name}}! How are you {{age}}?", {
        name: "World",
        age: "20",
      })
    ).toBe("Hello, World! How are you 20?");
  });
});
