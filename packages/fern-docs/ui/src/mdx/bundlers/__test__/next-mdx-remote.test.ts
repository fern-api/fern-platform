import { render, RenderResult } from "@testing-library/react";
import { createElement } from "react";
import { serializeMdx } from "../next-mdx-remote";
import { NextMdxRemoteComponent } from "../next-mdx-remote-component";

async function renderMdxContent(content: string): Promise<RenderResult> {
  const serializedContent = await serializeMdx(content, {
    options: { development: false },
  });
  const result = render(
    typeof serializedContent === "string"
      ? createElement("span", {}, serializedContent)
      : createElement(NextMdxRemoteComponent, serializedContent)
  );
  return result;
}

describe("next-mdx-remote", () => {
  describe("custom html", () => {
    it("should render custom html", async () => {
      const result = await renderMdxContent(
        "<div data-testid='test'>Hello world!</div>"
      );
      expect(result.getByTestId("test")).toBeInTheDocument();
      expect(result.getByTestId("test")).toHaveTextContent("Hello world!");
    });

    it("should render custom html with JSX", async () => {
      const result = await renderMdxContent(
        '<div data-testid="test" style={{ display: "none" }}>Hello world!</div>'
      );
      expect(result.getByTestId("test")).toBeInTheDocument();
      expect(result.getByTestId("test")).toHaveTextContent("Hello world!");
      expect(result.getByTestId("test")).toHaveStyle({ display: "none" });
    });

    it("should render custom html with className", async () => {
      const result = await renderMdxContent(
        '<div data-testid="test" className="testing">Hello world!</div>'
      );
      expect(result.getByTestId("test")).toBeInTheDocument();
      expect(result.getByTestId("test")).toHaveTextContent("Hello world!");
      expect(result.getByTestId("test")).toHaveClass("testing");
    });

    it("should render custom html with className 2", async () => {
      const result = await renderMdxContent(
        '<div data-testid="test" class="testing">Hello world!</div>'
      );
      expect(result.getByTestId("test")).toBeInTheDocument();
      expect(result.getByTestId("test")).toHaveTextContent("Hello world!");
      expect(result.getByTestId("test")).toHaveClass("testing");
    });

    it("should render custom html with CSS styles", async () => {
      const result = await renderMdxContent(
        '<div data-testid="test" style="display: none">Hello world!</div>'
      );
      expect(result.getByTestId("test")).toBeInTheDocument();
      expect(result.getByTestId("test")).toHaveTextContent("Hello world!");
      expect(result.getByTestId("test")).toHaveStyle({ display: "none" });
    });
  });

  describe("headings", () => {
    it("should generate automatic anchor link", async () => {
      const result = await renderMdxContent("### Hello world!");
      expect(result.getByText("Hello world!")).toBeInTheDocument();
      expect(result.getByText("Hello world!")).toHaveAttribute(
        "id",
        "hello-world"
      );
    });

    it("should generate with automatic anchor link with special letters", async () => {
      const result = await renderMdxContent("### Hello world ✅");
      expect(result.getByText("Hello world ✅")).toBeInTheDocument();
      expect(result.getByText("Hello world ✅")).toHaveAttribute(
        "id",
        "hello-world-"
      );
    });

    it("should generate with a custom anchor link", async () => {
      const mdxContent = "### Hello world! [#custom-anchor]";

      const result = await renderMdxContent(mdxContent);

      expect(result.getByText("Hello world!")).toBeInTheDocument();
      expect(result.getByText("Hello world!")).toHaveAttribute(
        "id",
        "custom-anchor"
      );
    });
  });
});
