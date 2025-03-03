import { compact } from "es-toolkit";
import type { Root as MdastRoot } from "mdast";
import { gfmToMarkdown } from "mdast-util-gfm";
import { mathToMarkdown } from "mdast-util-math";
import { mdxToMarkdown } from "mdast-util-mdx";
import { toMarkdown } from "mdast-util-to-markdown";

export function mdastToMarkdown(
  mdast: MdastRoot,
  format: "mdx" | "md" = "mdx"
): string {
  return toMarkdown(mdast, {
    extensions: compact([
      format === "mdx" ? mdxToMarkdown() : undefined,
      mathToMarkdown(),
      gfmToMarkdown(),
    ]),
  });
}
