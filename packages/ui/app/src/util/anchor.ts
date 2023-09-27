import { snakeCase } from "lodash-es";

export function getAnchorId(anchorIdParts: string[]): string {
    return anchorIdParts.map((anchorId) => snakeCase(anchorId)).join("-");
}

export function getAnchorNode(anchorId: string): Element | null {
    return document.querySelector(`div[data-anchor="${anchorId}"]`);
}

export function extractAnchorFromWindow(): string | undefined {
    const { hash } = window.location;
    if (!hash.startsWith("#")) {
        return undefined;
    }
    return hash.substring(1, hash.length);
}
