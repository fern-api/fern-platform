export function getAnchorId(anchorIdParts: string[]): string {
    return anchorIdParts.map((anchorId) => anchorId).join(".");
}

export function getRouteSelector(route: string): string {
    return `div[data-route="${route.toLowerCase()}"]`;
}

export function getRouteNode(route: string): HTMLElement | undefined {
    return document.querySelector<HTMLElement>(getRouteSelector(route)) ?? undefined;
}
