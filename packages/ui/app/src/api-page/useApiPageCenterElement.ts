import { useCallback, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useIsSlugSelected } from "../docs-context/useIsSlugSelected";
import { useNavigationContext } from "../navigation-context/useNavigationContext";

export declare namespace useApiPageCenterElement {
    export interface Args {
        slug: string;
    }

    export interface Return {
        setTargetRef: (element: HTMLElement | null) => void;
    }
}

export function useApiPageCenterElement({ slug }: useApiPageCenterElement.Args): useApiPageCenterElement.Return {
    const { justNavigated } = useNavigationContext();
    const { registerNavigateToPathListener, onScrollToPath, getFullSlug } = useDocsContext();

    const targetRef = useRef<HTMLElement | null>(null);

    const onChangeIsInVerticalCenter = useCallback(
        (newIsInVerticalCenter: boolean) => {
            if (newIsInVerticalCenter && !justNavigated) {
                onScrollToPath(slug);
            }
        },
        [justNavigated, onScrollToPath, slug]
    );

    const handleIsSelected = useCallback(() => {
        // window.scrollTo({ top: targetRef.current?.offsetTop ?? 0 });
    }, []);

    useEffect(
        () => registerNavigateToPathListener(getFullSlug(slug), handleIsSelected),
        [handleIsSelected, slug, registerNavigateToPathListener, getFullSlug]
    );

    const isSelected = useIsSlugSelected(getFullSlug(slug));

    const { ref: setRefForInVerticalCenterIntersectionObserver } = useInView({
        // https://stackoverflow.com/questions/54807535/intersection-observer-api-observe-the-center-of-the-viewport
        rootMargin: "-50% 0px",
        threshold: 0,
        initialInView: isSelected,
        onChange: onChangeIsInVerticalCenter,
    });

    const setTargetRef = useCallback(
        (ref: HTMLElement | null) => {
            setRefForInVerticalCenterIntersectionObserver(ref);
            targetRef.current = ref;
        },
        [setRefForInVerticalCenterIntersectionObserver]
    );

    return {
        setTargetRef,
    };
}
