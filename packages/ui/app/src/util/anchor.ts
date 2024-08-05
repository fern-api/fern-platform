export function getAnchorId(anchorIdParts: readonly string[]): string {
    return anchorIdParts.map((anchorId) => encodeURI(anchorId)).join(".");
}

export function getRouteNode(route: string): HTMLElement | undefined {
    return document.getElementById(route) ?? undefined;
}

export function getRouteNodeWithAnchor(route: string): HTMLElement | undefined {
    const [, anchor] = route.split("#");
    return getRouteNode(route) ?? (anchor != null ? getRouteNode(anchor) : undefined);
}

export function scrollToRoute(route: string): void {
    getRouteNodeWithAnchor(route)?.scrollIntoView({ behavior: "auto" });
}
