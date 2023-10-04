import { snakeCase } from "lodash-es";

export function getAnchorId(anchorIdParts: string[]): string {
    return anchorIdParts.map((anchorId) => snakeCase(anchorId)).join("-");
}

export function getAnchorSelector(anchorId: string): string {
    const selector = ["div", "h1", "h2", "h3", "h4", "h5", "h6"]
        .map((tag) => `${tag}[data-anchor="${anchorId}"]`)
        .join(", ");
    return selector;
}

export function getAnchorNode(anchorId: string): Element | undefined {
    return document.querySelector(getAnchorSelector(anchorId)) ?? undefined;
}

export function extractAnchorFromWindow(): string | undefined {
    const { hash } = window.location;
    if (!hash.startsWith("#")) {
        return undefined;
    }
    return hash.substring(1, hash.length);
}
