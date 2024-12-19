import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { DOCS_ATOM } from "./docs";
import { IS_READY_ATOM } from "./viewport";

export const ANNOUNCEMENT_CONFIG_ATOM = atom(
    (get) => get(DOCS_ATOM).announcement
);

export const ANNOUNCEMENT_DISMISSED_STORAGE_ATOM = atomWithStorage(
    "fern-announcement-dismissed",
    ""
);

export const ANNOUNCEMENT_DISMISSED_ATOM = atom(
    (get) => {
        const announcementConfig = get(ANNOUNCEMENT_CONFIG_ATOM);
        if (announcementConfig == null || !get(IS_READY_ATOM)) {
            return true;
        }

        return (
            get(ANNOUNCEMENT_DISMISSED_STORAGE_ATOM) === announcementConfig.text
        );
    },
    (get, set, dismissed: boolean) => {
        if (dismissed) {
            set(
                ANNOUNCEMENT_DISMISSED_STORAGE_ATOM,
                get(ANNOUNCEMENT_CONFIG_ATOM)?.text ?? ""
            );
        } else {
            set(ANNOUNCEMENT_DISMISSED_STORAGE_ATOM, "");
        }
    }
);

export const ANNOUNCEMENT_IS_DISMISSING_ATOM = atom(false);

const SETTABLE_ANNOUNCEMENT_HEIGHT = atom(0);
export const ANNOUNCEMENT_HEIGHT_ATOM = atom(
    (get) =>
        get(ANNOUNCEMENT_DISMISSED_ATOM) &&
        !get(ANNOUNCEMENT_IS_DISMISSING_ATOM)
            ? 0
            : get(SETTABLE_ANNOUNCEMENT_HEIGHT),
    (_get, set, height: number) => set(SETTABLE_ANNOUNCEMENT_HEIGHT, height)
);
