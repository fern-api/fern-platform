import type { Element } from "hast";
import type { Heading } from "mdast";
import { State } from "mdast-util-to-hast";

/**
 * This allows us to extract anchors that were overridden in the markdown, instead of using the default slug.
 *
 * i.e. `## My Heading [#some-anchor]`
 */
export function customHeadingHandler(state: State, node: Heading): Element {
    let id: string | undefined;
    const children = state.all(node).map((child) => {
        // TODO: handle the case where child is not text because additional formatting is applied
        if (child.type === "text") {
            const { text, anchor } = extractAnchorFromHeadingText(child.value);
            if (anchor != null) {
                id = anchor;
                return { ...child, value: text };
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

/**
 * My Heading [#some-anchor] -> { text: "My Heading", anchor: "some-anchor" }
 * @param headingText should not include the leading `#`
 */
export function extractAnchorFromHeadingText(headingText: string): { text: string; anchor?: string } {
    const match = headingText.match(/^(.*?)(?:\s*\[#([^\]]+)\])?$/);
    const [, text, anchor] = match || [];
    if (text == null || anchor == null) {
        return { text: headingText };
    }
    return { text, anchor };
}
