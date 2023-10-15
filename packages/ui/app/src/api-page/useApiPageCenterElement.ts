import { useRef } from "react";
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
    const { userIsScrolling } = useNavigationContext();
    const { onScrollToPath, getFullSlug } = useDocsContext();

    const onChangeIsInVerticalCenter = useRef((newIsInVerticalCenter: boolean) => {
        if (newIsInVerticalCenter && userIsScrolling()) {
            onScrollToPath(slug);
        }
    });

    const isSelected = useIsSlugSelected(getFullSlug(slug));

    const { ref: setRefForInVerticalCenterIntersectionObserver } = useInView({
        // https://stackoverflow.com/questions/54807535/intersection-observer-api-observe-the-center-of-the-viewport
        rootMargin: "-50% 0px",
        threshold: 0,
        initialInView: isSelected,
        onChange: onChangeIsInVerticalCenter.current,
    });

    return {
        setTargetRef: setRefForInVerticalCenterIntersectionObserver,
    };
}
