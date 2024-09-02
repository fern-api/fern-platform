import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useInView } from "framer-motion";
import { RefObject } from "react";
import { useCallbackOne } from "use-memo-one";
import { JUST_NAVIGATED_ATOM, SLUG_ATOM, useAtomEffect } from "../atoms";

export function useApiPageCenterElement(
    ref: RefObject<HTMLDivElement>,
    slug: FernNavigation.Slug,
    skip: boolean = false,
): void {
    const isInView = useInView(ref, {
        // https://stackoverflow.com/questions/54807535/intersection-observer-api-observe-the-center-of-the-viewport
        margin: "-50% 0px",
    });

    const shouldUpdateSlug = !skip && isInView;

    useAtomEffect(
        useCallbackOne(
            (get, set) => {
                if (shouldUpdateSlug && !get.peek(JUST_NAVIGATED_ATOM)) {
                    set(SLUG_ATOM, slug);
                }
            },
            [shouldUpdateSlug, slug],
        ),
    );
}
