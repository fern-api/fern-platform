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
    const [expanded, setExpanded] = useState<true | string[]>([]);
    const [inverted, setInverted] = useState(false); // if true, expanded means collapsed and vice versa
    const { selectedSlug } = useDocsSelectors();

    const expandAll = useCallback(() => {
        setExpanded(true);
        setInverted(false);
    }, []);

    const collapseAll = useCallback(() => {
        setExpanded([]);
        setInverted(false);
    }, []);

    useEffect(() => {
        setExpanded([selectedSlug]);
        setInverted(false);
    }, [selectedSlug, setExpanded]);

    const checkExpanded = useCallback(
        (expandableSlug: string) => {
            if (typeof expanded === "boolean") {
                return expanded !== inverted;
            }
            return expanded.some((slug) => slug.startsWith(expandableSlug)) !== inverted;
        },
        [expanded, inverted]
    );

    const toggleExpanded = useCallback((slug: string) => {
        setExpanded((expanded) => {
            if (typeof expanded === "boolean") {
                setInverted(expanded);
                return [slug];
            }
            if (expanded.some((s) => s.startsWith(slug))) {
                return expanded.filter((s) => !s.startsWith(slug));
            }
            return [...expanded, slug];
        });
    }, []);

    return (
        <CollapseSidebarContext.Provider
            value={{ expanded, selectedSlug, expandAll, collapseAll, setExpanded, checkExpanded, toggleExpanded }}
        >
            {children}
        </CollapseSidebarContext.Provider>
    );
};
