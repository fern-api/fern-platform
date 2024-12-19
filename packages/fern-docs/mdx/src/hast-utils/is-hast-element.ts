import type { Element, ElementContent, Root, RootContent } from "hast";

export function isHastElement(
    value: ElementContent | Element | Root | RootContent | null | undefined
): value is Element {
    return value ? value.type === "element" : false;
}
