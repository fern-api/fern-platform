import { useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { useContext } from "react";
import { useMemoOne } from "use-memo-one";
import { useFeatureFlags } from "../../atoms/flags";
import { SLUG_ATOM } from "../../atoms/location";
import { useIsReady } from "../../atoms/viewport";
import { NavigationContext, type NavigationContextValue } from "./NavigationContext";

export function useNavigationContext(): NavigationContextValue {
    return useContext(NavigationContext);
}

export function useShouldHideFromSsg(slug: string): boolean {
    const { isApiScrollingDisabled } = useFeatureFlags();
    const isSelectedSlug = useAtomValue(useMemoOne(() => selectAtom(SLUG_ATOM, (v) => v === slug), [slug]));
    const hydrated = useIsReady();
    return isSelectedSlug && (!hydrated || isApiScrollingDisabled);
}
