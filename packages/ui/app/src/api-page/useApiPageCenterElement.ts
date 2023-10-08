import { useCallback, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useIsSlugSelected } from "../docs-context/useIsSlugSelected";
import { NavigationStatus } from "../navigation-context/NavigationContext";
import { useNavigationContext } from "../navigation-context/useNavigationContext";
import { extractAnchorFromWindow } from "../util/anchor";

export declare namespace useApiPageCenterElement {
    export interface Args {
        slug: string;
    }

    export interface Return {
        setTargetRef: (element: HTMLElement | null) => void;
    }
}

export function useApiPageCenterElement({ slug }: useApiPageCenterElement.Args): useApiPageCenterElement.Return {
    const { navigation, userHasScrolled } = useNavigationContext();
    const { registerNavigateToPathListener, onScrollToPath, getFullSlug } = useDocsContext();

    const targetRef = useRef<HTMLElement | null>(null);

    const onChangeIsInVerticalCenter = useCallback(
        (newIsInVerticalCenter: boolean) => {
            if (
                newIsInVerticalCenter &&
                navigation.status !== NavigationStatus.INITIAL_NAVIGATION_TO_ANCHOR &&
                navigation.status !== NavigationStatus.SUBSEQUENT_NAVIGATION_TO_ANCHOR &&
                navigation.status !== NavigationStatus.BACK_NAVIGATION
            ) {
                onScrollToPath(slug);
            }
        },
        [onScrollToPath, slug, navigation.status]
    );

    const handleIsSelected = useCallback(() => {
        window.scrollTo({ top: targetRef.current?.offsetTop ?? 0 });
    }, []);

    useEffect(
        () => registerNavigateToPathListener(getFullSlug(slug), handleIsSelected),
        [handleIsSelected, slug, registerNavigateToPathListener, getFullSlug]
    );

    const isSelected = useIsSlugSelected(getFullSlug(slug));

    useEffect(() => {
        if (typeof window === "undefined" || userHasScrolled) {
            return;
        }
        const maybeScrollToSelected = () => {
            if (isSelected) {
                handleIsSelected();
            }
        };
        maybeScrollToSelected();
        const anchorId = extractAnchorFromWindow();
        if (anchorId != null) {
            return;
        }
        const docsContent = document.getElementById("docs-content");
        if (docsContent == null) {
            return;
        }
        const observer = new window.ResizeObserver(() => {
            maybeScrollToSelected();
        });
        observer.observe(docsContent);
        return () => {
            observer.unobserve(docsContent);
            observer.disconnect();
        };
    }, [handleIsSelected, isSelected, userHasScrolled]);

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
