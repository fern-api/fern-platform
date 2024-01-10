import { noop } from "lodash-es";
import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { useDocsSelectors } from "../selectors/useDocsSelectors";

interface CollapseSidebarContextValue {
    expanded: true | string[]; // true = expand all, string[] = expand only these slugs
    expandAll: () => void;
    collapseAll: () => void;
    setExpanded: (slugs: string[]) => void;
    toggleExpanded: (slug: string) => void;
    selectedSlug: string | undefined;
    checkExpanded: (expandableSlug: string) => boolean;
}

const CollapseSidebarContext = createContext<CollapseSidebarContextValue>({
    expanded: [],
    expandAll: noop,
    collapseAll: noop,
    setExpanded: noop,
    toggleExpanded: noop,
    selectedSlug: undefined,
    checkExpanded: () => false,
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useCollapseSidebar = () => useContext(CollapseSidebarContext);

export const CollapseSidebarProvider: FC<PropsWithChildren> = ({ children }) => {
    const { selectedSlug } = useDocsSelectors();
    const [expanded, setExpanded] = useState<string[]>(() => [selectedSlug]);
    const [collapsed, setCollapsed] = useState<string[]>([]);
    const [inverted, setInverted] = useState(false); // if true, expanded means collapsed and vice versa

    const expandAll = useCallback(() => {
        setInverted(true);
        setExpanded([]);
        setCollapsed([]);
    }, []);

    const collapseAll = useCallback(() => {
        setInverted(false);
        setExpanded([]);
        setCollapsed([]);
    }, []);

    useEffect(() => {
        setInverted(false);
        setExpanded([selectedSlug]);
        setCollapsed([]);
    }, [selectedSlug]);

    const checkExpanded = useCallback(
        (expandableSlug: string) => {
            return inverted
                ? !collapsed.includes(expandableSlug)
                : expanded.some((slug) => slug.startsWith(expandableSlug));
        },
        [collapsed, expanded, inverted]
    );

    const toggleExpanded = useCallback(
        (slug: string) => {
            if (inverted) {
                setInverted(true);
                setCollapsed((collapsed) => {
                    if (collapsed.some((s) => s === slug)) {
                        return collapsed.filter((s) => s !== slug);
                    }
                    return [...collapsed, slug];
                });
                return;
            } else {
                setExpanded((expanded) => {
                    if (expanded.some((s) => s.startsWith(slug))) {
                        return expanded.filter((s) => !s.startsWith(slug));
                    }
                    return [...expanded, slug];
                });
            }
        },
        [inverted]
    );

    return (
        <CollapseSidebarContext.Provider
            value={{ expanded, selectedSlug, expandAll, collapseAll, setExpanded, checkExpanded, toggleExpanded }}
        >
            {children}
        </CollapseSidebarContext.Provider>
    );
};
