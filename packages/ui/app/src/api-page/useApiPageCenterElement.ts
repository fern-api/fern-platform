import { useEventCallback } from "@fern-ui/react-commons";
import { useAtomValue } from "jotai";
import { useInView } from "react-intersection-observer";
import { SLUG_ATOM } from "../atoms";
import { useNavigationContext } from "../contexts/navigation-context/useNavigationContext";

export declare namespace useApiPageCenterElement {
    export interface Args {
        slug: string;
    }

    export interface Return {
        setTargetRef: (element: HTMLElement | null) => void;
    }
}

export function useApiPageCenterElement({ slug }: useApiPageCenterElement.Args): useApiPageCenterElement.Return {
    const { onScrollToPath } = useNavigationContext();
    const selectedSlug = useAtomValue(SLUG_ATOM);

    const onChangeIsInVerticalCenter = useEventCallback((newIsInVerticalCenter: boolean) => {
        if (newIsInVerticalCenter) {
            onScrollToPath(slug);
        }
    });

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
