// @vitest-environment node

import { render, RenderResult } from "@testing-library/react";
import { Server } from "http";
import { createElement } from "react";
import { ViteDevServer } from "vite";
import { MdxBundlerComponent } from "../mdx-bundler-component";
import {
  invokeTestServer,
  setupTestServer,
  teardownTestServer,
} from "./mdx-bundler-server";

async function renderMdxContent(
  content: string,
  {
    filename,
    files,
  }: { filename?: string; files?: Record<string, string> } = {}
): Promise<RenderResult> {
  const serializedContent = await invokeTestServer({
    content,
    options: { files, filename },
  });

  const result = render(
    typeof serializedContent === "string"
      ? createElement("span", {}, serializedContent)
      : createElement(MdxBundlerComponent, serializedContent)
  );
  return result;
}

// this doens't work in node... todo: spin up mdx bundler server in node, and run this test in jsdom
describe.skip("mdx-bundler", () => {
  let server: Server;
  let vite: ViteDevServer;

  beforeAll(async () => {
    const setup = await setupTestServer();
    server = setup.server;
    vite = setup.vite;
  });

  afterAll(async () => {
    if (vite && server) {
      await teardownTestServer({ vite, server });
    }
  });

  it("should bundle mdx", async () => {
    const result = await renderMdxContent("Hello world!");
    expect(result.container.textContent).toBe("Hello world!");
  });
});
