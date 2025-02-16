/**
 * An enhanced version of https://github.com/rehypejs/rehype-slug/blob/main/lib/index.js
 * which considers mdx jsx elements too
 */
import { walk } from "estree-walker";
import GithubSlugger from "github-slugger";

import {
  Hast,
  Unified,
  hastToString,
  isMdxJsxAttribute,
  isMdxJsxElementHast,
  visit,
} from "@fern-docs/mdx";

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
            const literals: string[] = [];
            walk(id.data.estree, {
              enter: (node) => {
                if (node.type === "Literal" && typeof node.value === "string") {
                  literals.push(node.value);
                }
              },
            });
            if (literals.length === 1 && literals[0]) {
              slugs.slug(literals[0]);
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
