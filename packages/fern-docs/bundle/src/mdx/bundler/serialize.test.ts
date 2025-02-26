/**
 * @vitest-environment node
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { serializeMdx } from "./serialize";

vi.mock("server-only", () => ({}));

function deterministic(str: string | undefined): string | undefined {
  return str?.replaceAll(
    /[0-9a-f]{8}[-_][0-9a-f]{4}[-_][0-9a-f]{4}[-_][0-9a-f]{4}[-_][0-9a-f]{12}/gi,
    "_random_uuid_"
  );
}

it("should serialize mdx", async () => {
  const result = await serializeMdx("### Hello world!\n");
  expect(deterministic(result?.code)).toMatchSnapshot();
});

it("should serialize mdx with frontmatter", async () => {
  const result = await serializeMdx(
    "---\ntitle: Hello world!\n---\n\n### Hello world!\n"
  );
  expect(deterministic(result?.code)).toMatchSnapshot();
});

it("should serialize mdx with toc", async () => {
  const result = await serializeMdx(
    `
# Hello world!

## Subheading

### Subsubheading

`,
    { toc: true }
  );
  expect(deterministic(result?.code)).toMatchSnapshot();
});

it("should serialize jsx", async () => {
  const result = await serializeMdx(
    `
    <Button>Hello world!</Button>
    `
  );
  expect(deterministic(result?.code)).toMatchSnapshot();
});

it("should serialize announcement", async () => {
  const result = await serializeMdx(
    `🚀 Vapi now provides server SDKs! Check out the [supported languages](/server-sdks).`
  );
  expect(deterministic(result?.code)).toMatchSnapshot();
});

it("should serialize markdown", async () => {
  const result = await serializeMdx(
    `These are the costs of individual components of the call in USD.`
  );
  expect(deterministic(result?.code)).toMatchSnapshot();
});

it("should serialize servers.mdx", async () => {
  const result = await serializeMdx(
    readFileSync(join(__dirname, "tests", "servers.mdx"), "utf-8")
  );
  expect(deterministic(result?.code)).toMatchSnapshot();
});

it("should serialize tabs.mdx", async () => {
  const result = await serializeMdx(
    readFileSync(join(__dirname, "tests", "tabs.mdx"), "utf-8")
  );
  expect(deterministic(result?.code)).toMatchSnapshot();
});
