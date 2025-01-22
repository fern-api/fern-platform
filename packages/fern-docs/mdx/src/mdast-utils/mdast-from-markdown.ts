import type { Root as MdastRoot } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { mathFromMarkdown } from "mdast-util-math";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { gfm } from "micromark-extension-gfm";
import { math } from "micromark-extension-math";
import { mdxjs } from "micromark-extension-mdxjs";
import { UnreachableCaseError } from "ts-essentials";

export function mdastFromMarkdown(
  content: string,
  format: "mdx" | "md" = "mdx"
): MdastRoot {
  if (format === "md") {
    return fromMarkdown(content, {
      extensions: [math(), gfm()],
      mdastExtensions: [mathFromMarkdown(), gfmFromMarkdown()],
    });
  } else if (format === "mdx") {
    return fromMarkdown(content, {
      extensions: [mdxjs(), math(), gfm()],
      mdastExtensions: [
        mdxFromMarkdown(),
        mathFromMarkdown(),
        gfmFromMarkdown(),
      ],
    });
  } else {
    throw new UnreachableCaseError(format);
  }
}
