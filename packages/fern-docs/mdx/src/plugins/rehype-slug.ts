import GithubSlugger from "github-slugger";
import type * as Hast from "hast";
import { headingRank } from "hast-util-heading-rank";
import { toString } from "hast-util-to-string";
import { visit } from "unist-util-visit";
import { MdxJsxElementHast } from "../declarations";
import {
  extractAttributeValueAsString,
  isMdxJsxAttribute,
  isMdxJsxElementHast,
} from "../mdx-utils";

const slugs = new GithubSlugger();

export interface RehypeSlugOptions {
  prefix?: string;
  visitElement?: (node: Hast.Element, slugger: GithubSlugger) => void;
  visitJsxElement?: (node: MdxJsxElementHast, slugger: GithubSlugger) => void;
}

export function rehypeSlug(options: RehypeSlugOptions = {}) {
  const prefix = options.prefix || "";

  return function (tree: Hast.Root): undefined {
    slugs.reset();

    visit(tree, (node) => {
      if (node.type === "element") {
        if (headingRank(node) && !node.properties.id) {
          node.properties.id = prefix + slugs.slug(toString(node));
        }
        options.visitElement?.(node, slugs);
      } else if (isMdxJsxElementHast(node)) {
        if (node.name?.match(/^(h|H)\d$/)) {
          const props = node.attributes.filter(isMdxJsxAttribute);
          const id = extractAttributeValueAsString(
            props.find((prop) => prop.name === "id")?.value
          );
          if (!id) {
            // add the id to the top of the props array so that it can be overridden by expressions, etc.
            node.attributes.unshift({
              type: "mdxJsxAttribute",
              name: "id",
              value: slugs.slug(toString(node)),
            });
          } else if (typeof id === "string") {
            // increment the slugger for repeated headings
            slugs.slug(id);
          }
        }
        options.visitJsxElement?.(node, slugs);
      }
    });
  };
}
