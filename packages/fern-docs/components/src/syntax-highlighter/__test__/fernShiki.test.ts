import { Root } from "hast";
import { visit } from "unist-util-visit";

import { getHighlighterInstance, highlightTokens } from "../fernShiki";

describe("fernShiki", () => {
  it("should highlight diff", async () => {
    const highlighter = await getHighlighterInstance("diff");
    expect(highlighter.getLoadedLanguages()).toContain("diff");
    const result = highlightTokens(
      highlighter,
      `*** file1.txt   Thu Jan 11 08:52:37 2018                                                                                                         
--- file2.txt   Thu Jan 11 08:53:01 2018                                                                                                         
***************                                                                                                                                  
*** 1,4 ****                                                                                                                                     
  cat                                                                                                                                            
- mv                                                                                                                                             
- comm                                                                                                                                           
  cp                                                                                                                                             
--- 1,4 ----                                                                                                                                     
  cat                                                                                                                                            
  cp                                                                                                                                             
+ diff                                                                                                                                           
+ comm`,
      "diff"
    );
    expect(result).toMatchSnapshot();
  });

  it("should highlight ts", async () => {
    const highlighter = await getHighlighterInstance("typescript");
    const result = highlightTokens(highlighter, "const a = 1", "typescript");
    expect(result).toMatchSnapshot();
  });
});

function collectTemplates(hast: Root): string[] {
  const templates: string[] = [];
  visit(hast, "element", (node) => {
    if (node.properties?.["data-template"]) {
      const template = node.properties["data-template"];
      if (typeof template === "string") {
        templates.push(template);
      }
    }
  });
  return templates;
}

describe("template", () => {
  it("should detect template for typescript", async () => {
    const highlighter = await getHighlighterInstance("typescript");
    const result = highlightTokens(
      highlighter,
      "{{a}}",
      "typescript",
      new Set(["a"])
    );

    const templates = collectTemplates(result.hast);
    expect(templates).toContain("a");
    expect(templates.length).toBe(1);
  });

  it("should detect template in bash", async () => {
    const highlighter = await getHighlighterInstance("bash");
    const result = highlightTokens(
      highlighter,
      "{{a}}",
      "bash",
      new Set(["a"])
    );
    const templates = collectTemplates(result.hast);
    expect(templates).toContain("a");
    expect(templates.length).toBe(1);
  });

  it("should detect template for plaintext", async () => {
    const highlighter = await getHighlighterInstance("plaintext");
    const result = highlightTokens(
      highlighter,
      "{{a}}",
      "plaintext",
      new Set(["a"])
    );
    const templates = collectTemplates(result.hast);
    expect(templates).toContain("a");
  });

  it("should detect template for swift", async () => {
    const highlighter = await getHighlighterInstance("swift");
    const result = highlightTokens(
      highlighter,
      "{{a}}",
      "swift",
      new Set(["a"])
    );
    const templates = collectTemplates(result.hast);
    expect(templates).toContain("a");
  });

  it("should detect template for python", async () => {
    const highlighter = await getHighlighterInstance("python");
    const result = highlightTokens(
      highlighter,
      "{{a}}",
      "python",
      new Set(["a"])
    );
    const templates = collectTemplates(result.hast);
    expect(templates).toContain("a");
  });

  it("should detect multiple templates for python", async () => {
    const highlighter = await getHighlighterInstance("python");
    const result = highlightTokens(
      highlighter,
      "{{a}} {{b}}",
      "python",
      new Set(["a", "b"])
    );
    const templates = collectTemplates(result.hast);
    expect(templates).toContain("a");
    expect(templates).toContain("b");
    expect(templates.length).toBe(2);
  });

  it("should detect multiple templates for javascript", async () => {
    const highlighter = await getHighlighterInstance("javascript");
    const result = highlightTokens(
      highlighter,
      "{{a}} {{b}}",
      "javascript",
      new Set(["a", "b"])
    );
    const templates = collectTemplates(result.hast);
    expect(templates).toContain("a");
    expect(templates).toContain("b");
    expect(templates.length).toBe(2);
  });

  it("should avoid false positives", async () => {
    const highlighter = await getHighlighterInstance("javascript");
    const result = highlightTokens(
      highlighter,
      "{{a}} {{b}}",
      "javascript",
      new Set(["a"])
    );
    const templates = collectTemplates(result.hast);
    expect(templates).not.toContain("b");
    expect(templates.length).toBe(1);
  });

  it("should inject templates in a complex bash script", async () => {
    const highlighter = await getHighlighterInstance("bash");
    const result = highlightTokens(
      highlighter,
      `echo "Hello, {{name}}!"`,
      "bash",
      new Set(["name"])
    );
    const templates = collectTemplates(result.hast);
    expect(templates).toContain("name");
    expect(templates.length).toBe(1);
  });

  it("should preserve text surrounding a template in TypeScript", async () => {
    const highlighter = await getHighlighterInstance("typescript");
    const code = `console.log("prefix{{var}}suffix")`;
    const result = highlightTokens(
      highlighter,
      code,
      "typescript",
      new Set(["var"])
    );

    const templates = collectTemplates(result.hast);
    expect(templates).toContain("var");
    expect(templates.length).toBe(1);

    let textContent = "";
    visit(result.hast, "text", (node) => {
      textContent += node.value;
    });

    expect(textContent).toContain("console.log");
    expect(textContent).toContain("prefix");
    expect(textContent).toContain("suffix");
  });

  it("should preserve text surrounding a template in JavaScript string literals", async () => {
    const highlighter = await getHighlighterInstance("javascript");
    const code = `const message = \`Hello, {{name}}! Welcome to {{location}}.\``;
    const result = highlightTokens(
      highlighter,
      code,
      "javascript",
      new Set(["name", "location"])
    );

    const templates = collectTemplates(result.hast);
    expect(templates).toContain("name");
    expect(templates).toContain("location");
    expect(templates.length).toBe(2);

    let textContent = "";
    visit(result.hast, "text", (node) => {
      textContent += node.value;
    });

    expect(textContent).toContain("const message");
    expect(textContent).toContain("Hello,");
    expect(textContent).toContain("Welcome to");
  });

  it("should preserve surrounding text in multiline code blocks", async () => {
    const highlighter = await getHighlighterInstance("typescript");
    const code = `function greet() {
  // This function uses a template variable
  return \`Hello, {{name}}!\`;
}`;
    const result = highlightTokens(
      highlighter,
      code,
      "typescript",
      new Set(["name"])
    );

    const templates = collectTemplates(result.hast);
    expect(templates).toContain("name");
    expect(templates.length).toBe(1);

    let textContent = "";
    visit(result.hast, "text", (node) => {
      textContent += node.value;
    });

    expect(textContent).toContain("function greet()");
    expect(textContent).toContain("// This function uses a template variable");
    expect(textContent).toContain("return");
    expect(textContent).toContain("Hello,");
  });
});
