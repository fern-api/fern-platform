import { FernNavigation } from "@fern-api/fdr-sdk";
import { useAtom } from "jotai";
import { useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { SLUG_ATOM } from "../atoms";

export declare namespace useApiPageCenterElement {
    export interface Args {
        slug: FernNavigation.Slug;
    }

    export interface Return {
        setTargetRef: (element: HTMLElement | null) => void;
    }
}

export function useApiPageCenterElement({ slug }: useApiPageCenterElement.Args): useApiPageCenterElement.Return {
    const [selectedSlug, setSelectedSlug] = useAtom(SLUG_ATOM);

    const onChangeIsInVerticalCenter = useCallback(
        (newIsInVerticalCenter: boolean) => {
            if (newIsInVerticalCenter) {
                setSelectedSlug(slug);
            }
        },
        [setSelectedSlug, slug],
    );

    const isSelected = selectedSlug === slug;

    const { ref: setRefForInVerticalCenterIntersectionObserver } = useInView({
        // https://stackoverflow.com/questions/54807535/intersection-observer-api-observe-the-center-of-the-viewport
        rootMargin: "-50% 0px",
        threshold: 0,
        initialInView: isSelected,
        onChange: onChangeIsInVerticalCenter,
    });

    return {
        setTargetRef: setRefForInVerticalCenterIntersectionObserver,
    };
}
