import { FernNavigation } from "@fern-api/fdr-sdk";
import { useInView } from "framer-motion";
import { useSetAtom } from "jotai";
import { RefObject, useEffect, useRef } from "react";
import { SLUG_ATOM } from "../atoms";

export declare namespace useApiPageCenterElement {
    export interface Args {
        slug: FernNavigation.Slug;
        skip?: boolean;
    }
}

export function useApiPageCenterElement({
    slug,
    skip = false,
}: useApiPageCenterElement.Args): RefObject<HTMLDivElement> {
    const setSelectedSlug = useSetAtom(SLUG_ATOM);

    const ref = useRef<HTMLDivElement>(null);

    const isInView = useInView(ref, {
        // https://stackoverflow.com/questions/54807535/intersection-observer-api-observe-the-center-of-the-viewport
        margin: "-50% 0px",
    });

    useEffect(() => {
        if (isInView && !skip) {
            setSelectedSlug(slug);
        }
    }, [isInView, setSelectedSlug, skip, slug]);

    return ref;
}
