import { useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useNavigationContext } from "../navigation-context/useNavigationContext";
import { useDocsSelectors } from "../selectors/useDocsSelectors";

export declare namespace useApiPageCenterElement {
    export interface Args {
        slug: string;
    }

    export interface Return {
        setTargetRef: (element: HTMLElement | null) => void;
    }
}

export function useApiPageCenterElement({ slug }: useApiPageCenterElement.Args): useApiPageCenterElement.Return {
    const { userIsScrolling, getFullSlug, onScrollToPath } = useNavigationContext();
    const { selectedSlug } = useDocsSelectors();

    const onChangeIsInVerticalCenter = useRef((newIsInVerticalCenter: boolean) => {
        if (newIsInVerticalCenter && userIsScrolling()) {
            onScrollToPath(slug);
        }
    });

    // TODO: Revise
    const isSelected = selectedSlug === getFullSlug(slug);

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
