import { compact } from "es-toolkit";
import type { Root as MdastRoot } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { mathFromMarkdown } from "mdast-util-math";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { gfm } from "micromark-extension-gfm";
import { math } from "micromark-extension-math";
import { mdxjs } from "micromark-extension-mdxjs";

export function mdastFromMarkdown(
  content: string,
  format: "mdx" | "md" = "mdx"
): MdastRoot {
  return fromMarkdown(content, {
    extensions: compact([
      format === "mdx" ? mdxjs() : undefined,
      math(),
      gfm(),
    ]),
    mdastExtensions: compact([
      format === "mdx" ? mdxFromMarkdown() : undefined,
      mathFromMarkdown(),
      gfmFromMarkdown(),
    ]),
  });
}
