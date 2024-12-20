import type { Element, ElementContent, Root, RootContent, Text } from "hast";

export function isHastText(value: ElementContent | Element | Root | RootContent | null | undefined): value is Text {
    return value ? value.type === "text" : false;
}
