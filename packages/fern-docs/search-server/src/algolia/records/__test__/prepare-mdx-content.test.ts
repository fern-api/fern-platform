import { prepareMdxContent } from "../../../utils/prepare-mdx-content";

describe("prepareMdxContent", () => {
    it("should remove mdxjsEsm nodes", () => {
        const content =
            "export default function MyComponent() { return <div>Hello, world!</div>; }";
        const result = prepareMdxContent(content);
        expect(result.content).toBeUndefined();
    });

    it("should squeeze mdxJsxElement nodes", () => {
        const content = "<div>Hello, world!</div>";
        const result = prepareMdxContent(content);
        expect(result.content).toBe("Hello, world!");

        const content2 = "<div>\n\nHello, world!\n\n</div>";
        const result2 = prepareMdxContent(content2);
        expect(result2.content).toBe("Hello, world!");
    });

    it("should remove mdxExpression nodes", () => {
        const content = "\n{props.testing}\n";
        const result = prepareMdxContent(content);
        expect(result.content).toBeUndefined();
    });

    it("should stringify text in a newline delimited way nodes", () => {
        const content = "Hello, world!\n\nTesting";
        const result = prepareMdxContent(content);
        expect(result.content).toBe("Hello, world!\nTesting");

        const content2 = "<div>Hello, world!</div><div>Testing</div>";
        const result2 = prepareMdxContent(content2);
        expect(result2.content).toBe("Hello, world!\n\nTesting");
    });

    it("should strip away step nodes", () => {
        const content = `## Creating a PyPI token
<Steps>
### Log In
Log into [PyPI](https://pypi.org/).
### Navigate to Account Settings
Click on your profile picture and select **Account settings**.
### Create API Token
Scroll down to **API tokens** and click **Create API token**. Name your token and set the scope to the relevant projects. Once finished, click **Create token**. 
<Note title='Save your token'>
Be sure to save the generated token - it won't be displayed after you leave the page. 
</Note>
</Steps>
`;

        const result = prepareMdxContent(content);
        expect(result.content).toMatchInlineSnapshot(`
          "Creating a PyPI token


          Log In
          Log into PyPI.
          Navigate to Account Settings
          Click on your profile picture and select Account settings.
          Create API Token
          Scroll down to API tokens and click Create API token. Name your token and set the scope to the relevant projects. Once finished, click Create token.


          Be sure to save the generated token - it won't be displayed after you leave the page."
        `);
    });

    it("should strip away tables", () => {
        const content = `   
        | Column 1 | Column 2 | Column 3 |
        | -------- | -------- | -------- |
        | Value 1  | Value 2  | Value 3  |
        `;
        const result = prepareMdxContent(content);
        expect(result.content).toMatchInlineSnapshot(`
          "Column 1 Column 2 Column 3 
          Value 1 Value 2 Value 3"
        `);
    });

    it("should extract code snippets", () => {
        const content = `
        \`\`\`python
        print("Hello, world!")
        \`\`\`
        `;
        const result = prepareMdxContent(content);
        expect(result.content).toBe(undefined);
        expect(result.code_snippets).toEqual([
            { lang: "python", meta: undefined, code: 'print("Hello, world!")' },
        ]);
    });

    it("should strip math nodes but keep the content", () => {
        const content = "$x^2$";
        const result = prepareMdxContent(content);
        expect(result.content).toBe("x^2");

        const content2 = "$$x^2$$";
        const result2 = prepareMdxContent(content2);
        expect(result2.content).toBe("x^2");
    });

    it("should replace html entities with their corresponding characters", () => {
        const content = "Hello, &amp; world!";
        const result = prepareMdxContent(content);
        expect(result.content).toBe("Hello, & world!");

        const content2 = "Hello, &gt; world!";
        const result2 = prepareMdxContent(content2);
        expect(result2.content).toBe("Hello, > world!");
    });
});
