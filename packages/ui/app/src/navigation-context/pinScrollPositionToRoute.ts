import { getRouteAndAnchorNode } from "../util/anchor";

export function pinScrollPositionToRoute(route: string, cb: () => void): void {
    const scrollY = window.scrollY;
    const currentTop = getRouteAndAnchorNode(route)?.getBoundingClientRect().top;
    const currentScrollTop = document.documentElement.scrollTop;
    cb();
    const newTop = getRouteAndAnchorNode(route)?.getBoundingClientRect().top;
    const newScrollTop = document.documentElement.scrollTop;
    // the scroll position should be maintained
    if (currentTop != null && newTop != null) {
        const offset = scrollY - currentTop - currentScrollTop + newTop + newScrollTop;
        window.scrollTo(0, offset);
    }
}
