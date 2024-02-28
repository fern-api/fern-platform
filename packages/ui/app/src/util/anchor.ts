export function getAnchorId(anchorIdParts: string[]): string {
    return anchorIdParts.map((anchorId) => encodeURI(anchorId)).join(".");
}

export function getRouteSelector(route: string): string {
    return `div[data-route="${route.toLowerCase()}"]`;
}

export function getRouteNode(route: string): HTMLElement | undefined {
    return document.querySelector<HTMLElement>(getRouteSelector(route)) ?? undefined;
}

export function getRouteAndAnchorNode(route: string): HTMLElement | undefined {
    const [routeWithoutAnchor, anchor] = route.split("#");
    if (routeWithoutAnchor != null) {
        return (
            getRouteNode(route) ??
            getRouteNode(routeWithoutAnchor) ??
            (anchor != null ? document.getElementById(anchor) ?? undefined : undefined)
        );
    }
    return undefined;
}

export function getRouteNodeWithAnchor(route: string): HTMLElement | undefined {
    const [routeWithoutAnchor, anchor] = route.split("#");
    if (routeWithoutAnchor != null) {
        return (
            getRouteNode(route) ??
            getRouteNode(routeWithoutAnchor) ??
            (anchor != null ? document.getElementById(anchor) ?? undefined : undefined)
        );
    }
    return undefined;
}
