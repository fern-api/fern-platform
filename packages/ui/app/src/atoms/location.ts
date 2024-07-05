import { FernNavigation } from "@fern-api/fdr-sdk";
import { atom } from "jotai";
import { atomWithLocation } from "jotai-location";
import { Router } from "next/router";

export const LOCATION_ATOM = atomWithLocation({
    subscribe: (callback) => {
        Router.events.on("routeChangeComplete", callback);
        Router.events.on("routeChangeError", callback);
        return () => {
            Router.events.off("routeChangeComplete", callback);
            Router.events.off("routeChangeError", callback);
        };
    },
});

const SETTABLE_LOCATION_ATOM = atom(FernNavigation.Slug(""));

export const SLUG_ATOM = atom(
    (get) => {
        const location = get(LOCATION_ATOM);
        if (location.pathname == null) {
            return get(SETTABLE_LOCATION_ATOM);
        }
        return FernNavigation.Slug(location.pathname?.slice(1) ?? "");
    },
    (_get, set, slug: FernNavigation.Slug) => {
        set(SETTABLE_LOCATION_ATOM, slug);
    },
);
