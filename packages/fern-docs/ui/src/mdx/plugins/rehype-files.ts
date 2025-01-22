import {
  isMdxJsxAttribute,
  isMdxJsxElementHast,
  mdxJsxAttributeToString,
  visit,
} from "@fern-docs/mdx";
import type { Root } from "hast";
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
export function rehypeFiles(options: RehypeFilesOptions): (tree: Root) => void {
  return function (tree: Root): void {
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
  };
}
