import { mdastToMarkdown, toTree } from "../../parse.js";

function sanitizeAcorns(content: string, allowedIdentifiers: string[] = []) {
    return mdastToMarkdown(toTree(content, { allowedIdentifiers }).mdast);
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

    it("should escape identifiers with multiple braces", () => {
        // while foo and bar are allowed, the inner braces are not
        const result = sanitizeAcorns("# hi {foo {bar}}", ["foo", "bar"]);
        expect(result).toBe("# hi \\{foo \\{bar}}\n");
    });

    it("should escape identifiers with multiple nested braces", () => {
        const result2 = sanitizeAcorns("# hi {foo {bar} {baz}}", ["foo", "baz"]);
        expect(result2).toBe("# hi \\{foo \\{bar} \\{baz}}\n");
    });

    it("should not escape objects in JSX attributes", () => {
        const reactStyles = sanitizeAcorns("<div style={{ color: foo }} />");
        expect(reactStyles).toBe("<div style={{ color: foo }} />\n");
    });

    it("should not escape, nor fail, on multiple end braces", () => {
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
    });

    it("should escape await expressions", () => {
        const result5 = sanitizeAcorns("# hi {await something()}");
        expect(result5).toBe("# hi \\{await something()}\n");
    });

    it("should escape await expressions even when the function is allowed", () => {
        const result5 = sanitizeAcorns("# hi {await something()}", ["something"]);
        expect(result5).toBe("# hi \\{await something()}\n");
    });

    it("should not escape ESM identifiers", () => {
        const result = sanitizeAcorns("export const foo = 1;\n\n# hi {foo}");
        expect(result).toBe("export const foo = 1;\n\n# hi {foo}\n");
    });

    it("should continue to escape identifiers that are not allowed by esm", () => {
        const result2 = sanitizeAcorns("export const foo = 1;\n\n# hi {foo} {bar}");
        expect(result2).toBe("export const foo = 1;\n\n# hi {foo} \\{bar}\n");
    });

    it("should not escape identifiers from esmjs, even when used in an expression", () => {
        const result3 = sanitizeAcorns("export const foo = 1;\n\n# hi {foo + 1}");
        expect(result3).toBe("export const foo = 1;\n\n# hi {foo + 1}\n");
    });

    it("should escape identifiers that are not allowed by esm, even when used in an expression", () => {
        const result3 = sanitizeAcorns("export const foo = 1;\n\n# hi {foo + 1 + bar}");
        expect(result3).toBe("export const foo = 1;\n\n# hi \\{foo + 1 + bar}\n");
    });

    it("should never escape JSX", () => {
        const result = sanitizeAcorns("<div {...otherProps}>hi</div>");
        expect(result).toMatchInlineSnapshot(`
          "<div {...otherProps}>
            hi
          </div>
          "
        `);
    });

    it("should escape identifiers inside JSX children", () => {
        const result2 = sanitizeAcorns("<div {...otherProps}>hi {foo}</div>", ["foo"]);
        expect(result2).toMatchInlineSnapshot(`
          "<div {...otherProps}>
            hi 

            {foo}
          </div>
          "
        `);

        const result3 = sanitizeAcorns("<div {...otherProps}>hi {foo + 1}</div>");
        expect(result3).toMatchInlineSnapshot(`
          "<div {...otherProps}>
            hi 

            \\{foo + 1}
          </div>
          "
        `);
    });

    it("should not escape identifiers that had been used in JSX attributes", () => {
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
    });

    it("should escape JSX inside expressions, if any identifiers are not allowed", () => {
        const result6 = sanitizeAcorns("{<div style={{ color: foo }} />}");
        expect(result6).toMatchInlineSnapshot(`
          "\\{<div style={{ color: foo }} />}
          "
        `);

        const result8 = sanitizeAcorns(`
            <Steps>

            ### Step 1

            \\{foo && <MyComponent />}

            </Steps>
        `);
        expect(result8).toMatchInlineSnapshot(`
          "<Steps>
            ### Step 1

            \\{foo && <MyComponent />}
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
        const result = sanitizeAcorns("import props from './props';\nexport const foo = { ...otherProps };");
        expect(result).toMatchInlineSnapshot(`
          "import props from './props';
          export const foo = { ...otherProps };
          "
        `);

        const result2 = sanitizeAcorns("export const foo = { ...otherProps };");
        expect(result2).toMatchInlineSnapshot(`
          "export const foo = { ...otherProps };
          "
        `);

        const result3 = sanitizeAcorns("export const foo = { ...otherProps, ...otherProps2 };");
        expect(result3).toMatchInlineSnapshot(`
          "export const foo = { ...otherProps, ...otherProps2 };
          "
        `);
    });

    it("should escape lonely bang and question mark", () => {
        const result = sanitizeAcorns("# hi {!} {?}");
        expect(result).toBe("# hi \\{!} \\{?}\n");
    });

    it("should escape improper spread operator", () => {
        // export should work OK
        const result = sanitizeAcorns("export const foo = {...otherProps,n}");
        expect(result).toMatchInlineSnapshot(`
          "export const foo = {...otherProps,n}
          "
        `);

        // import should throw
        const result2 = sanitizeAcorns("<a {...b,c} d>");
        expect(result2).toMatchInlineSnapshot(`
          "\\<a \\{...b,c} d>
          "
        `);
    });

    it("should ignore code blocks", () => {
        const result = sanitizeAcorns("```js\n{foo}\n```");
        expect(result).toBe("```js\n{foo}\n```\n");

        const result2 = sanitizeAcorns("```js\n{foo}\n```\n\n# hi {foo}");
        expect(result2).toBe("```js\n{foo}\n```\n\n# hi \\{foo}\n");

        const result3 = sanitizeAcorns(
            "<CodeBlock>\n```\n const props = { foo: 1 };\n\n <{...anything} />\n```\n</CodeBlock>\n\n# hi {foo}",
        );
        expect(result3).toMatchInlineSnapshot(`
          "<CodeBlock>
            \`\`\`
             const props = { foo: 1 };

             <{...anything} />
            \`\`\`
          </CodeBlock>

          # hi \\{foo}
          "
        `);
    });

    it("should allow regex literals", () => {
        const result = sanitizeAcorns("# hi {/foo/}");
        expect(result).toBe("# hi {/foo/}\n");
    });

    it("should allow JSON literals", () => {
        const result = sanitizeAcorns("# hi {JSON.stringify({foo: 1})}");
        expect(result).toBe("# hi {JSON.stringify({foo: 1})}\n");
    });

    it("should allow deeply nested identifiers", () => {
        const result = sanitizeAcorns("# hi {foo.bar.baz}", ["foo"]);
        expect(result).toBe("# hi {foo.bar.baz}\n");
    });

    it("should not escape props", () => {
        const result = sanitizeAcorns("<div {...props} />");
        expect(result).toBe("<div {...props} />\n");

        const result2 = sanitizeAcorns("{props.title}");
        expect(result2).toBe("{props.title}\n");
    });

    it("should escape crypto", () => {
        const result = sanitizeAcorns("# hi {crypto.randomUUID()}");
        expect(result).toBe("# hi \\{crypto.randomUUID()}\n");
    });

    it("should not escape URL", () => {
        const result = sanitizeAcorns("# hi {new URL('https://example.com')}");
        expect(result).toBe("# hi {new URL('https://example.com')}\n");
    });

    it("should escape awaited esm", () => {
        const result = sanitizeAcorns("export const foo = await something();");
        expect(result).toBe("\\{export const foo = await something();}\n");
    });
});
