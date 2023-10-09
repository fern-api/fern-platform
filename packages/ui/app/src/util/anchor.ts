import { snakeCase } from "lodash-es";

export function getAnchorId(anchorIdParts: string[]): string {
    return anchorIdParts.map((anchorId) => snakeCase(anchorId)).join("-");
}

export function getAnchorSelector(anchorId: string): string {
    return `div[data-anchor="${anchorId}"]`;
}

export function getAnchorNode(anchorId: string): HTMLElement | undefined {
    return document.querySelector<HTMLElement>(getAnchorSelector(anchorId)) ?? undefined;
}

export function getRouteSelector(route: string): string {
    return `div[data-route="${route}"]`;
}

export function getRouteNode(route: string): HTMLElement | undefined {
    return document.querySelector<HTMLElement>(getRouteSelector(route)) ?? undefined;
}

export function extractAnchorFromWindow(): string | undefined {
    const { hash } = window.location;
    if (!hash.startsWith("#")) {
        return undefined;
    }
    return hash.substring(1, hash.length);
}
