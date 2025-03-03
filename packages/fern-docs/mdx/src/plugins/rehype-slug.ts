/**
 * An enhanced version of https://github.com/rehypejs/rehype-slug/blob/main/lib/index.js
 * which considers mdx jsx elements too
 */
import GithubSlugger from "github-slugger";
import type * as Hast from "hast";
import type * as Unified from "unified";
import { visit } from "unist-util-visit";
import { hastToString } from "../hast-utils/hast-to-string";
import { extractSingleLiteral } from "../mdx-utils/extract-literal";
import { isMdxJsxElementHast } from "../mdx-utils/is-mdx-element";
import { isMdxJsxAttribute } from "../mdx-utils/is-mdx-jsx-attr";

const slugs = new GithubSlugger();

/**
 * TODO: move this into the `@fern-docs/mdx` package to reuse it for algolia search record generation
 */
export const rehypeSlug: Unified.Plugin<
  [
    {
      /**
       * Additional JSX elements to consider when generating slugs and settings the `id` attribute.
       *
       * @default []
       */
      additionalJsxElements?: string[];
    }?,
  ],
  Hast.Root
> = ({ additionalJsxElements = [] } = {}) => {
  return (ast) => {
    slugs.reset();

    visit(ast, (node) => {
      // supports the base-case of h1-h6 elements
      if (node.type === "element" && node.tagName.match(/^h[1-6]$/i)) {
        if (typeof node.properties.id === "string") {
          slugs.slug(node.properties.id);
        } else {
          node.properties.id = slugs.slug(hastToString(node));
        }
      }

      // supports all jsx heading elements (case insensitive)
      // and any additional jsx elements specified in the plugin options
      if (
        isMdxJsxElementHast(node) &&
        node.name &&
        (node.name.match(/^h[1-6]$/i) ||
          additionalJsxElements.includes(node.name))
      ) {
        const id = node.attributes
          .filter(isMdxJsxAttribute)
          .find((attribute) => attribute.name === "id")?.value;

        if (id != null) {
          if (typeof id === "string") {
            slugs.slug(id);
          } else if (id.data?.estree != null) {
            const literal = extractSingleLiteral(id.data.estree);
            if (typeof literal === "string") {
              slugs.slug(literal);
            }
          }
        } else {
          node.attributes.push({
            type: "mdxJsxAttribute",
            name: "id",
            value: slugs.slug(hastToString(node)),
          });
        }
      }
    });
  };
};
