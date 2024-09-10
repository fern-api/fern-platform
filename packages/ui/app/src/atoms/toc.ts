import { PrimitiveAtom, SetStateAction, WritableAtom, atom } from "jotai";
import { atomEffect } from "jotai-effect";
import { RESET, atomWithDefault } from "jotai/utils";
import { ANCHOR_ATOM } from "./location";
import { SCROLL_BODY_ATOM } from "./viewport";

export interface TableOfContentsItem {
    simpleString: string;
    anchorString: string;
    children: TableOfContentsItem[];
}

function getAllAnchorStrings(tableOfContents: TableOfContentsItem[]): string[] {
    return tableOfContents.flatMap((item) => [item.anchorString, ...getAllAnchorStrings(item.children)]);
}

export function createTocAtom(tableOfContents: TableOfContentsItem[]): PrimitiveAtom<string[]> {
    return atom(getAllAnchorStrings(tableOfContents));
}

export function createAnchorInViewAtom(
    allAnchorsAtom: PrimitiveAtom<string[]>,
): WritableAtom<string | undefined, [typeof RESET | SetStateAction<string | undefined>], void> {
    const anchorInViewAtom = atomWithDefault((get) => {
        const allAnchors = get(allAnchorsAtom);
        return allAnchors[0];
    });

    const hashChangeEffect = atomEffect((get, set) => {
        const anchor = get(ANCHOR_ATOM);
        const scrollBody = get(SCROLL_BODY_ATOM);
        const allAnchors = get(allAnchorsAtom);

        if (scrollBody == null) {
            return;
        }

        if (anchor != null && anchor.trim().length > 0 && allAnchors.includes(anchor)) {
            set(anchorInViewAtom, anchor);
        }

        const handleScroll = () => {
            const scrollY = scrollBody.scrollTop;

            // when the user scrolls to the very top of the page, set the anchorInView to the first anchor
            if (scrollY === 0) {
                set(anchorInViewAtom, allAnchors[0]);
                return;
            }

            // when the user scrolls to the very bottom of the page, set the anchorInView to the last anchor
            if (scrollBody.clientHeight + scrollY >= scrollBody.scrollHeight) {
                set(anchorInViewAtom, allAnchors[allAnchors.length - 1]);
                return;
            }

            // when the user scrolls down, check if an anchor has just scrolled up just past 40% from the top of the viewport
            // if so, set the anchorInView to that anchor
            for (let i = allAnchors.length - 1; i >= 0; i--) {
                const anchor = allAnchors[i];
                if (anchor == null) {
                    continue;
                }
                const element = document.getElementById(anchor);
                if (element != null) {
                    const { bottom } = element.getBoundingClientRect();
                    if (bottom < window.innerHeight * 0.5) {
                        set(anchorInViewAtom, anchor);
                        break;
                    }
                }
            }
        };

        scrollBody.addEventListener("scroll", handleScroll);
        return () => {
            scrollBody.removeEventListener("scroll", handleScroll);
        };
    });

    return atom(
        (get) => {
            get(hashChangeEffect);
            return get(anchorInViewAtom);
        },
        (_get, set, action) => set(anchorInViewAtom, action),
    );
}
