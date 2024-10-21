import { Root } from "hast";
import { visit } from "unist-util-visit";
import { parseStringStyle } from "../hast-utils/parse-string-style.js";
import { isMdxJsxFlowElement, toAttribute } from "../utils.js";

export function rehypeMdxClassStyle(): (root: Root) => void {
    return (root) => {
        visit(root, (node) => {
            if (isMdxJsxFlowElement(node)) {
                node.attributes = node.attributes.map((attr) => {
                    if (attr.type === "mdxJsxAttribute") {
                        // convert class to className
                        if (attr.name === "class") {
                            return { ...attr, name: "className" };
                        }

                        // if the style attribute is a string, convert it to an object
                        if (attr.name === "style") {
                            if (typeof attr.value === "string") {
                                return toAttribute("style", parseStringStyle(attr.value));
                            }
                        }
                    }

                    return attr;
                });
            }
        });
    };
}
