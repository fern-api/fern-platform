import { FernNavigation } from "@fern-api/fdr-sdk";
import { useEventCallback } from "@fern-ui/react-commons";
import { atom, useAtomValue } from "jotai";
import { atomWithLocation } from "jotai-location";
import { Router } from "next/router";
import { useCallbackOne, useMemoOne } from "use-memo-one";
import { useAtomEffect } from "./hooks";
import { RESOLVED_PATH_ATOM } from "./navigation";

export const LOCATION_ATOM = atomWithLocation({
    subscribe: (callback) => {
        Router.events.on("routeChangeComplete", callback);
        Router.events.on("routeChangeError", callback);
        Router.events.on("hashChangeComplete", callback);
        return () => {
            Router.events.off("routeChangeComplete", callback);
            Router.events.off("routeChangeError", callback);
            Router.events.off("hashChangeComplete", callback);
        };
    },
});
LOCATION_ATOM.debugLabel = "LOCATION_ATOM";

export const ANCHOR_ATOM = atom(
    (get) => get(LOCATION_ATOM).hash?.slice(1),
    (get, set, anchor: string | undefined) => {
        const location = get(LOCATION_ATOM);
        const hash = anchor != null ? `#${anchor}` : undefined;
        if (location.hash === hash) {
            return;
        }
        set(LOCATION_ATOM, { ...get(LOCATION_ATOM), hash }, { replace: true });
    },
);
ANCHOR_ATOM.debugLabel = "ANCHOR_ATOM";

export const SLUG_ATOM = atom(
    (get) => {
        const location = get(LOCATION_ATOM);
        if (location.pathname == null) {
            return get(RESOLVED_PATH_ATOM).slug;
        }
        return FernNavigation.Slug(location.pathname?.slice(1) ?? "");
    },
    (get, set, slug: FernNavigation.Slug) => {
        const location = get(LOCATION_ATOM);
        const pathname = `/${slug}`;
        if (location.pathname === pathname) {
            return;
        }
        set(LOCATION_ATOM, { ...location, pathname }, { replace: true });
    },
);
SLUG_ATOM.debugLabel = "SLUG_ATOM";

export function useIsSelectedSlug(slug: FernNavigation.Slug): boolean {
    return useAtomValue(useMemoOne(() => atom((get) => get(SLUG_ATOM) === slug), [slug]));
}

export function useRouteListener(route: string, callback: (hash: string | undefined) => void): void {
    const callbackRef = useEventCallback(callback);

    return useAtomEffect(
        useCallbackOne(
            (get) => {
                const location = get(LOCATION_ATOM);
                if (location.pathname?.toLowerCase() === route.toLowerCase()) {
                    setTimeout(() => callbackRef(get(ANCHOR_ATOM)), 0);
                }
            },
            [route, callbackRef],
        ),
    );
}
