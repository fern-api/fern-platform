import type { Element } from "hast";
import type { Heading } from "mdast";
import { State } from "mdast-util-to-hast";

export function customHeadingHandler(state: State, node: Heading): Element {
    let id: string | undefined;
    const children = state.all(node).map((child) => {
        if (child.type === "text") {
            // extract [#anchor] from heading text
            const match = child.value.match(/^(.*?)(?:\s*\[#([^\]]+)\])?$/);
            const [, text, anchor] = match || [];
            if (text != null && anchor != null) {
                id = anchor;
                return {
                    ...child,
                    value: text,
                };
            }
        }

        return child;
    });
    const result: Element = {
        type: "element",
        tagName: "h" + node.depth,
        properties: { id },
        children,
    };
    state.patch(node, result);
    return state.applyData(node, result);
}
