import type {
  Hast,
  MdxExpression,
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
} from "@fern-docs/mdx";
import {
  isMdxExpression,
  isMdxJsxAttribute,
  isMdxJsxElementHast,
  mdxJsxAttributeToString,
  visit,
} from "@fern-docs/mdx";
import { walk } from "estree-walker";

import type { ImageData } from "../../atoms/types";

export interface RehypeFilesOptions {
  replaceSrc?(src: string): ImageData | undefined;
}

/**
 * This plugin will replace the src attribute with a new value, and add height and width attributes if they are provided.
 *
 * This is designed to handle injecting filesV2 urls into the following elements:
 * - img
 * - video
 * - audio
 * - source
 * - track
 * - embed
 * - script
 *
 * @param options - the options for the plugin
 * @returns a function that will transform the tree
 */
export function rehypeFiles(
  options: RehypeFilesOptions = {}
): (tree: Hast.Root) => void {
  return function (tree: Hast.Root): void {
    if (options == null) {
      return;
    }
    visit(tree, (node) => {
      if (isMdxJsxElementHast(node)) {
        const attributes = node.attributes.filter(isMdxJsxAttribute);

        // TODO: do we need to add support for `href` and `<object data=...>`?
        const srcAttribute = attributes.find((attr) => attr.name === "src");

        if (srcAttribute == null) {
          return;
        }

        const src = mdxJsxAttributeToString(srcAttribute);
        if (!src) {
          console.warn(
            `[rehype-files]: src attribute is not parseable for ${node.name}`
          );
          return;
        }
        const {
          src: newSrc,
          height,
          width,
          blurDataURL,
        } = options.replaceSrc?.(src) ?? {};

        if (newSrc != null) {
          srcAttribute.value = newSrc;
        }

        if (
          height != null &&
          !attributes.find((attr) => attr.name === "height")
        ) {
          node.attributes.unshift({
            name: "height",
            value: String(height),
            type: "mdxJsxAttribute",
          });
        }

        if (
          width != null &&
          !attributes.find((attr) => attr.name === "width")
        ) {
          node.attributes.unshift({
            name: "width",
            value: String(width),
            type: "mdxJsxAttribute",
          });
        }

        if (
          blurDataURL &&
          node.name?.toLowerCase().startsWith("im") &&
          !attributes.find((attr) => attr.name === "blurDataURL")
        ) {
          node.attributes.unshift({
            name: "blurDataURL",
            value: blurDataURL,
            type: "mdxJsxAttribute",
          });
        }
      } else if (node.type === "element") {
        // TODO: do we need to add support for `href` and `<object data=...>`?
        const srcAttribute = node.properties?.src;

        if (typeof srcAttribute !== "string") {
          return;
        }

        // do something to the src attribute
        const {
          src: newSrc,
          height,
          width,
          // blurDataURL, should this be handled here?
        } = options.replaceSrc?.(srcAttribute) ?? {};

        if (newSrc != null) {
          node.properties.src = newSrc;
        }

        if (height != null && !node.properties.height) {
          node.properties.height = height;
        }

        if (width != null && !node.properties.width) {
          node.properties.width = width;
        }
      }
    });

    // additional support for jsx attributes that are nested inside of jsx attributes
    visit(tree, (node) => {
      if (isMdxJsxElementHast(node)) {
        node.attributes.forEach((attr) => {
          const estree = getEstree(attr);
          if (estree == null) {
            return;
          }
          // TODO: make this less hacky
          walk(estree, {
            enter(node) {
              if (node.type === "Literal" && typeof node.value === "string") {
                // TODO: if the replaced src is a Image (contains width and height), we need to add them to the parent JSX root somehow.
                // for example: <Card icon={<img src="fileId" />} /> -> <Card icon={<img src="replacedImgUrl" width={w} height={h} />} />
                // currently, we cannot leverage NextJS Image Optimization for this edge case.
                node.value =
                  options.replaceSrc?.(node.value)?.src ?? node.value;
              }
            },
          });
        });
      }

      if (isMdxExpression(node)) {
        const estree = getEstree(node);
        if (estree == null) {
          return;
        }
        walk(estree, {
          enter(node) {
            if (node.type === "Literal" && typeof node.value === "string") {
              node.value = options.replaceSrc?.(node.value)?.src ?? node.value;
            }
          },
        });
      }
    });
  };
}

function getEstree(
  attr: MdxJsxAttribute | MdxJsxExpressionAttribute | MdxExpression
) {
  if (
    attr.type === "mdxJsxAttribute" &&
    attr.value &&
    typeof attr.value !== "string" &&
    attr.value.type === "mdxJsxAttributeValueExpression" &&
    attr.value.data?.estree
  ) {
    return attr.value.data?.estree;
  } else if (attr.type === "mdxJsxExpressionAttribute" && attr.data?.estree) {
    return attr.data?.estree;
  } else if (isMdxExpression(attr) && attr.data?.estree) {
    return attr.data?.estree;
  }
  return null;
}
