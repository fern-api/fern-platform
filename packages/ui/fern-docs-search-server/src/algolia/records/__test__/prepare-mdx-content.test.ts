import { prepareMdxContent } from "../prepare-mdx-content.js";

describe("prepareMdxContent", () => {
    it("should remove mdxjsEsm nodes", () => {
        const content = "export default function MyComponent() { return <div>Hello, world!</div>; }";
        const result = prepareMdxContent(content);
        expect(result.content).toBe("");
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
        expect(result.content).toBe("");
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
          "| Column 1 | Column 2 | Column 3 |
          | -------- | -------- | -------- |
          | Value 1  | Value 2  | Value 3  |"
        `);
    });
});
