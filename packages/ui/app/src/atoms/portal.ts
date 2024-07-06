import { atom } from "jotai";

const SETTABLE_PORTAL_CONTAINER = atom<HTMLElement | null>(null);
export const PORTAL_CONTAINER = atom(
    (get) => get(SETTABLE_PORTAL_CONTAINER) ?? undefined,
    (_get, set, container: HTMLElement | null) => {
        set(SETTABLE_PORTAL_CONTAINER, container);
    },
);
