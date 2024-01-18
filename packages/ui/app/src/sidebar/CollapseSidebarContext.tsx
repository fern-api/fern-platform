import { noop } from "lodash-es";
import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDocsSelectors } from "../selectors/useDocsSelectors";

interface CollapseSidebarContextValue {
    expanded: string[][]; // true = expand all, string[] = expand only these slugs
    setExpanded: (slugs: string[][]) => void;
    toggleExpanded: (slug: string[]) => void;
    selectedSlug: string[] | undefined;
    checkExpanded: (expandableSlug: string[]) => boolean;
}

const CollapseSidebarContext = createContext<CollapseSidebarContextValue>({
    expanded: [],
    setExpanded: noop,
    toggleExpanded: noop,
    selectedSlug: undefined,
    checkExpanded: () => false,
});

export function checkSlugStartsWith(slug: string[], startsWith: string[]): boolean {
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

export const CollapseSidebarProvider: FC<PropsWithChildren> = ({ children }) => {
    const { selectedSlug: selectedSlugString } = useDocsSelectors();

    const selectedSlug = useMemo(() => selectedSlugString.split("/"), [selectedSlugString]);
    const [expanded, setExpanded] = useState<string[][]>(() => [selectedSlug]);

    useEffect(() => {
        setExpanded([selectedSlug]);
    }, [selectedSlug]);

    const checkExpanded = useCallback(
        (expandableSlug: string[]) => expanded.some((slug) => checkSlugStartsWith(slug, expandableSlug)),
        [expanded]
    );

    const toggleExpanded = useCallback((slug: string[]) => {
        setExpanded((expanded) => {
            if (expanded.some((s) => checkSlugStartsWith(s, slug))) {
                return expanded.filter((s) => !checkSlugStartsWith(s, slug));
            }
            return [...expanded, slug];
        });
    }, []);

    return (
        <CollapseSidebarContext.Provider value={{ expanded, selectedSlug, setExpanded, checkExpanded, toggleExpanded }}>
            {children}
        </CollapseSidebarContext.Provider>
    );
};
