import { snakeCase } from "lodash-es";

export function getAnchorId(anchorIdParts: string[]): string {
    return anchorIdParts.map((anchorId) => snakeCase(anchorId)).join("-");
}

export function getAnchorSelector(anchorId: string): string {
    return `div[data-anchor="${anchorId}"]`;
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
