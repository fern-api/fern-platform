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
  unknownToMdxJsxAttribute,
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

        setDimension(node, attributes, width, height);

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

export function setDimension(
  node: Hast.MdxJsxElement,
  attributes: MdxJsxAttribute[],
  intrinsicWidth: number | undefined,
  intrinsicHeight: number | undefined
) {
  // if the image has no intrinsic size, do nothing
  if (!intrinsicWidth || !intrinsicHeight) {
    return;
  }

  // if the user has defined a height or width, add as style
  const attrWidth = attributes.find((attr) => attr.name === "width");
  const attrHeight = attributes.find((attr) => attr.name === "height");

  // validate width and height are numeric
  if (
    (attrWidth?.value && isNaN(Number(attrWidth.value))) ||
    (attrHeight?.value && isNaN(Number(attrHeight.value)))
  ) {
    return;
  }

  const addStyle: React.CSSProperties = {
    ...(attrWidth && { width: `${attrWidth.value}px` }),
    ...(attrHeight && { height: `${attrHeight.value}px` }),
    ...(!attrWidth && attrHeight && { width: "auto" }),
  };

  node.attributes.unshift(
    unknownToMdxJsxAttribute("__assigned_imageSize", addStyle)
  );

  // replace the actual attribute height and width with the true image size
  if (intrinsicHeight != null) {
    if (!attrHeight) {
      node.attributes.unshift({
        name: "height",
        value: String(intrinsicHeight),
        type: "mdxJsxAttribute",
      });
    } else {
      attrHeight.value = String(intrinsicHeight);
    }
  }

  if (intrinsicWidth != null) {
    if (!attrWidth) {
      node.attributes.unshift({
        name: "width",
        value: String(intrinsicWidth),
        type: "mdxJsxAttribute",
      });
    } else {
      attrWidth.value = String(intrinsicWidth);
    }
  }
}
