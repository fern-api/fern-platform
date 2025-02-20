import { hastToMarkdown, toTree } from "@fern-docs/mdx";
import { rehypeDownload } from "./rehype-download";

const run = rehypeDownload();

describe("rehypeDownload", () => {
  it("should be a noop if src is not set", () => {
    const ast = toTree(`<Download><Button /></Download>`).hast;
    run(ast);
    expect(hastToMarkdown(ast)).toMatchInlineSnapshot(
      `
      "<Download>
        <Button />
      </Download>
      "
    `
    );
  });

  it("should convert <Download> elements into <Button> elements with the `href` and `download` attributes set", () => {
    const ast = toTree(
      `<Download src="https://example.com/file.txt"><Button>Download me</Button></Download>`
    ).hast;
    run(ast);
    expect(hastToMarkdown(ast)).toMatchInlineSnapshot(
      `
      "<Button href="https://example.com/file.txt" download>Download me</Button>
      "
    `
    );
  });

  it("should include the filename in the `download` attribute", () => {
    const ast = toTree(
      `<Download src="https://example.com/file.txt" filename="my-file"><Button>Download me</Button></Download>`
    ).hast;
    run(ast);
    expect(hastToMarkdown(ast)).toMatchInlineSnapshot(
      `
      "<Button href="https://example.com/file.txt" download="my-file">Download me</Button>
      "
    `
    );
  });

  it("should be a noop if the child is not a <Button>", () => {
    const ast = toTree(
      `<Download src="https://example.com/file.txt"><strong>Download me</strong></Download>`
    ).hast;
    run(ast);
    expect(hastToMarkdown(ast)).toMatchInlineSnapshot(`
      "<Download src="https://example.com/file.txt">
        <strong>Download me</strong>
      </Download>
      "
    `);
  });
});
