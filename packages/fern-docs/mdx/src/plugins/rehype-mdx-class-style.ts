import type { Root } from "hast";
import { visit } from "unist-util-visit";
import { parseStringStyle } from "../hast-utils/parse-string-style";
import { isMdxJsxElementHast } from "../mdx-utils/is-mdx-element";
import { unknownToMdxJsxAttribute } from "../mdx-utils/unknown-to-mdx-jsx-attr";

/**
 * Handles cases where customer is migrating from md w/ html to mdx w/ jsx
 *
 * <div style="height: 100px;" /> -> <div style={{ height: "100px" }} />
 *
 * <div class="classname" /> -> <div className="classname" />
 */
export function rehypeMdxClassStyle(): (root: Root) => void {
    return (root) => {
        visit(root, (node) => {
            if (isMdxJsxElementHast(node)) {
                node.attributes = node.attributes.map((attr) => {
                    if (attr.type === "mdxJsxAttribute") {
                        // convert class to className
                        if (attr.name === "class") {
                            return { ...attr, name: "className" };
                        }

                        // if the style attribute is a string, convert it to an object
                        if (attr.name === "style") {
                            if (typeof attr.value === "string") {
                                return unknownToMdxJsxAttribute(
                                    "style",
                                    parseStringStyle(attr.value)
                                );
                            }
                        }
                    }

                    return attr;
                });
            }
        });
    };
}
