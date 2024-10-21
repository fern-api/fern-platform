import { mdastToMarkdown, toTree } from "../../parse.js";
import { preSanitizeAcorn, remarkSanitizeAcorn } from "../remark-sanitize-acorn.js";

function sanitizeAcorns(content: string, allowedIdentifiers: string[] = []) {
    const sanitized = preSanitizeAcorn(content);
    console.log("BEFORE", content);
    console.log("AFTER", sanitized);
    const tree = toTree(sanitized);
    remarkSanitizeAcorn({ allowedIdentifiers })(tree.mdast);
    return mdastToMarkdown(tree.mdast);
}

describe("remarkSanitizeAcorn", () => {
    it("should escape incomplete expressions", () => {
        const result = sanitizeAcorns("# hi {there");

        expect(result).toBe("# hi \\{there\n");
    });

    it("should escape incomplete expressions with multiple braces", () => {
        const result = sanitizeAcorns("# hi {there {foo}");

        expect(result).toBe("# hi \\{there \\{foo}\n");
    });

    it("should allow identifiers", () => {
        const result = sanitizeAcorns("# hi {foo}", ["foo"]);
        expect(result).toBe("# hi {foo}\n");
    });

    // this is currently not supported because <div style={{ color: foo }} /> would be escaped
    it.skip("should escape identifiers with multiple braces", () => {
        // while foo and bar are allowed, the inner braces are not
        const result = sanitizeAcorns("# hi {foo {bar}}", ["foo", "bar"]);
        expect(result).toBe("# hi \\{foo \\{bar}}\n");
    });

    it("should not fail on multiple end braces", () => {
        const result = sanitizeAcorns("}}");
        expect(result).toBe("}}\n");
    });

    it("should only escape expressions not in the allowlist, when evaluating multiple expressions", () => {
        const result = sanitizeAcorns("# hi {foo} {bar} {baz}", ["foo", "baz"]);
        expect(result).toBe("# hi {foo} \\{bar} {baz}\n");
    });

    it("should not escape expressions that are math expressions", () => {
        const result = sanitizeAcorns("# hi {1 + 1} {2 * 2}", ["foo", "baz"]);
        expect(result).toBe("# hi {1 + 1} {2 * 2}\n");
    });

    it("should not escape boolean, null, and number literals", () => {
        const result = sanitizeAcorns("# hi {true} {false} {null} {1} {2} {3.14}");
        expect(result).toBe("# hi {true} {false} {null} {1} {2} {3.14}\n");
    });

    it("should not escape Math.PI", () => {
        const result = sanitizeAcorns("# hi {Math.PI}");
        expect(result).toBe("# hi {Math.PI}\n");
    });

    it("should not escape Date.now()", () => {
        const result = sanitizeAcorns("# hi {Date.now()}");
        expect(result).toBe("# hi {Date.now()}\n");
    });

    it("should escape Promises", () => {
        const result = sanitizeAcorns("# hi {Promise.resolve(1)}");
        expect(result).toBe("# hi \\{Promise.resolve(1)}\n");

        const result2 = sanitizeAcorns("# hi {Promise.resolve(1).then(() => {})}");
        expect(result2).toBe("# hi \\{Promise.resolve(1).then(() => \\{})}\n");

        const result3 = sanitizeAcorns("# hi {await new Promise((resolve) => setTimeout(resolve, 1))}");
        expect(result3).toBe("# hi \\{await new Promise((resolve) => setTimeout(resolve, 1))}\n");

        const result4 = sanitizeAcorns("# hi {new Promise((resolve) => setTimeout(resolve, 1))}");
        expect(result4).toBe("# hi \\{new Promise((resolve) => setTimeout(resolve, 1))}\n");

        const result5 = sanitizeAcorns("# hi {await something()}");
        expect(result5).toBe("# hi \\{await something()}\n");
    });

    it("should not escape ESM identifiers", () => {
        const result = sanitizeAcorns("export const foo = 1;\n\n# hi {foo}");
        expect(result).toBe("export const foo = 1;\n\n# hi {foo}\n");

        const result2 = sanitizeAcorns("export const foo = 1;\n\n# hi {foo} {bar}");
        expect(result2).toBe("export const foo = 1;\n\n# hi {foo} \\{bar}\n");

        const result3 = sanitizeAcorns("export const foo = 1;\n\n# hi {foo + 1}");
        expect(result3).toBe("export const foo = 1;\n\n# hi {foo + 1}\n");
    });

    it("should never escape JSX", () => {
        const result = sanitizeAcorns("<div {...props}>hi</div>");
        expect(result).toMatchInlineSnapshot(`
          "<div {...props}>
            hi
          </div>
          "
        `);

        const result2 = sanitizeAcorns("<div {...props}>hi {foo}</div>", ["foo"]);
        expect(result2).toMatchInlineSnapshot(`
          "<div {...props}>
            hi 

            {foo}
          </div>
          "
        `);

        const result3 = sanitizeAcorns("<div {...props}>hi {foo + 1}</div>");
        expect(result3).toMatchInlineSnapshot(`
          "<div {...props}>
            hi 

            \\{foo + 1}
          </div>
          "
        `);

        const result4 = sanitizeAcorns("<div prop={foo}>hi {foo + 1}</div>");
        expect(result4).toMatchInlineSnapshot(`
          "<div prop={foo}>
            hi 

            {foo + 1}
          </div>
          "
        `);

        const result5 = sanitizeAcorns("<div style={{ color: foo }}>hi {foo + 1}</div>");
        expect(result5).toMatchInlineSnapshot(`
          "<div style={{ color: foo }}>
            hi 

            {foo + 1}
          </div>
          "
        `);

        const result6 = sanitizeAcorns("{<div style={{ color: foo }} />}");
        expect(result6).toMatchInlineSnapshot(`
          "{<div style={{ color: foo }} />}
          "
        `);

        // {foo} is not escaped later because it was already escaped by the JSX attribute
        const result7 = sanitizeAcorns("{<div style={{ color: foo }} />} {foo + 1}");
        expect(result7).toMatchInlineSnapshot(`
          "{<div style={{ color: foo }} />}

          {foo + 1}
          "
        `);

        const result8 = sanitizeAcorns(`
            <Steps>

            ### Step 1

            {foo && <MyComponent />}

            </Steps>
        `);
        expect(result8).toMatchInlineSnapshot(`
          "<Steps>
            ### Step 1

            {foo && <MyComponent />}
          </Steps>
          "
        `);
    });

    it("should not escape string literals wrapped in braces", () => {
        const result = sanitizeAcorns("# hi {`foo is {bar}`}");
        expect(result).toBe("# hi {`foo is {bar}`}\n");
    });

    it("should escape multi-word strings that are wrapped in braces", () => {
        const result = sanitizeAcorns("# hi {foo is bar}");
        expect(result).toBe("# hi \\{foo is bar}\n");
    });

    it("should not escape spread operator", () => {
        const result = sanitizeAcorns("import props from './props';\nexport const foo = { ...props };");
        expect(result).toMatchInlineSnapshot(`
          "import props from './props';
          export const foo = { ...props };
          "
        `);

        const result2 = sanitizeAcorns("export const foo = { ...props };");
        expect(result2).toMatchInlineSnapshot(`
          "export const foo = { ...props };
          "
        `);

        const result3 = sanitizeAcorns("export const foo = { ...props, ...props2 };");
        expect(result3).toMatchInlineSnapshot(`
          "export const foo = { ...props, ...props2 };
          "
        `);
    });

    it("should escape lonely bang and question mark", () => {
        const result = sanitizeAcorns("# hi {!} {?}");
        expect(result).toBe("# hi \\{!} \\{?}\n");
    });

    it("should escape improper spread operator", () => {
        // export should work OK
        const result = sanitizeAcorns("export const foo = {...props,n}");
        expect(result).toMatchInlineSnapshot(`
          "export const foo = {...props,n}
          "
        `);

        // import should throw
        const result2 = sanitizeAcorns("<a {...b,c} d>");
        expect(result2).toMatchInlineSnapshot(`
          "\\<a \\{...b,c} d>
          "
        `);
    });
});
