import { noop } from "lodash-es";
import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigationContext } from "../contexts/navigation-context/useNavigationContext";

interface CollapseSidebarContextValue {
    expanded: string[][]; // true = expand all, string[] = expand only these slugs
    setExpanded: (slugs: string[][]) => void;
    toggleExpanded: (slug: readonly string[]) => void;
    selectedSlug: readonly string[] | undefined;
    checkExpanded: (expandableSlug: readonly string[]) => boolean;
}

const CollapseSidebarContext = createContext<CollapseSidebarContextValue>({
    expanded: [],
    setExpanded: noop,
    toggleExpanded: noop,
    selectedSlug: undefined,
    checkExpanded: () => false,
});

export function checkSlugStartsWith(slug: readonly string[], startsWith: readonly string[]): boolean {
    if (slug.length < startsWith.length) {
        return false;
    }
    for (let i = 0; i < startsWith.length; i++) {
        if (slug[i] !== startsWith[i]) {
            return false;
        }
    }
    return true;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useCollapseSidebar = () => useContext(CollapseSidebarContext);

function expandArray(arr: string[]): string[][] {
    return arr.map((_, idx) => arr.slice(0, idx + 1));
}

export const CollapseSidebarProvider: FC<PropsWithChildren> = ({ children }) => {
    const { selectedSlug: selectedSlugString } = useNavigationContext();

    const selectedSlug = useMemo(() => selectedSlugString.split("/"), [selectedSlugString]);
    const [expanded, setExpanded] = useState<string[][]>(() => expandArray(selectedSlug));

    useEffect(() => {
        setExpanded(expandArray(selectedSlug));
    }, [selectedSlug]);

    const checkExpanded = useCallback(
        (expandableSlug: readonly string[]) => expanded.some((slug) => checkSlugStartsWith(slug, expandableSlug)),
        [expanded],
    );

    const toggleExpanded = useCallback((slug: readonly string[]) => {
        setExpanded((expanded) => {
            if (expanded.some((s) => checkSlugStartsWith(s, slug))) {
                return expanded.filter((s) => !checkSlugStartsWith(s, slug));
            }
            return [...expanded, [...slug]];
        });
    }, []);

    return (
        <CollapseSidebarContext.Provider value={{ expanded, selectedSlug, setExpanded, checkExpanded, toggleExpanded }}>
            {children}
        </CollapseSidebarContext.Provider>
    );
};
