/**
 * An enhanced version of https://github.com/rehypejs/rehype-slug/blob/main/lib/index.js
 * which considers mdx jsx elements too
 */
import GithubSlugger from "github-slugger";

import {
  CONTINUE,
  Hast,
  Unified,
  hastToString,
  isMdxJsxAttribute,
  isMdxJsxElementHast,
  visit,
} from "@fern-docs/mdx";

import { extractAttributeValueLiteral } from "../mdx-utils/extract-literal";

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
        return CONTINUE;
      }

      // supports all jsx heading elements (case insensitive)
      if (isMdxJsxElementHast(node) && node.name?.match(/^h[1-6]$/i)) {
        const idAttribute = node.attributes
          .filter(isMdxJsxAttribute)
          .find((attribute) => attribute.name === "id");
        if (idAttribute != null) {
          // if the id is a string, lets keep track of it in the slugger
          const id = extractAttributeValueLiteral(idAttribute.value);
          if (typeof id === "string") {
            slugs.slug(id);
          } else {
            idAttribute.value = slugs.slug(hastToString(node));
          }
        } else {
          // the id attribute is not present, so we need to add it
          node.attributes.push({
            type: "mdxJsxAttribute",
            name: "id",
            value: slugs.slug(hastToString(node)),
          });
        }
        return CONTINUE;
      }

      // any additional jsx elements, we can grab the `title` attribute to generate an id
      if (
        isMdxJsxElementHast(node) &&
        node.name &&
        additionalJsxElements.includes(node.name)
      ) {
        const idAttribute = node.attributes
          .filter(isMdxJsxAttribute)
          .find((attribute) => attribute.name === "id");
        if (idAttribute != null) {
          const id = extractAttributeValueLiteral(idAttribute.value);
          if (typeof id === "string") {
            slugs.slug(id);
          } else {
            idAttribute.value = slugs.slug(getTitle(node));
          }
        } else {
          // the id attribute is not present, so we'll generate one from the title attribute
          node.attributes.push({
            type: "mdxJsxAttribute",
            name: "id",
            value: slugs.slug(getTitle(node)),
          });
        }
      }
      return CONTINUE;
    });
  };
};

function getTitle(node: Hast.MdxJsxElement) {
  const title = node.attributes
    .filter(isMdxJsxAttribute)
    .find((attribute) => attribute.name === "title");
  if (title) {
    const titleValue = extractAttributeValueLiteral(title.value);
    if (typeof titleValue === "string") {
      return titleValue;
    }
  }
  console.warn(
    `[rehype-slug] No title attribute found for ${node.name}, or the title attribute is not a string. We'll generate a random id for this element.`
  );
  return node.name ?? "Untitled";
}
