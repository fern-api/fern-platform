import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useInView } from "framer-motion";
import { useSetAtom } from "jotai";
import { RefObject, useEffect } from "react";
import { SLUG_ATOM } from "../atoms";

export function useApiPageCenterElement(
    ref: RefObject<HTMLDivElement>,
    slug: FernNavigation.Slug,
    skip: boolean = false,
): void {
    const setSelectedSlug = useSetAtom(SLUG_ATOM);

    const isInView = useInView(ref, {
        // https://stackoverflow.com/questions/54807535/intersection-observer-api-observe-the-center-of-the-viewport
        margin: "-50% 0px",
    });

    useEffect(() => {
        if (isInView && !skip) {
            setSelectedSlug(slug);
        }
    }, [isInView, setSelectedSlug, skip, slug]);
}
