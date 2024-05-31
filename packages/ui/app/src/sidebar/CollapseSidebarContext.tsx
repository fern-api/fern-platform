import { FernNavigation } from "@fern-api/fdr-sdk";
import { last, noop } from "lodash-es";
import { FC, PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import urljoin from "url-join";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useNavigationContext } from "../contexts/navigation-context/useNavigationContext";

interface CollapseSidebarContextValue {
    expanded: string[][]; // true = expand all, string[] = expand only these slugs
    toggleExpanded: (slug: readonly string[]) => void;
    selectedSlug: readonly string[] | undefined;
    checkExpanded: (expandableSlug: readonly string[]) => boolean;
}

const CollapseSidebarContext = createContext<CollapseSidebarContextValue>({
    expanded: [],
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

export const useCollapseSidebar = (): CollapseSidebarContextValue => useContext(CollapseSidebarContext);

export const CollapseSidebarProvider: FC<PropsWithChildren> = ({ children }) => {
    const { sidebar } = useDocsContext();
    const { selectedSlug: selectedSlugString } = useNavigationContext();

    const parentSlugMap = useMemo(() => {
        const map = new Map<string, string[]>();
        FernNavigation.traverseNavigation(sidebar, (node, _index, parents) => {
            if (FernNavigation.utils.nodeHasMetadata(node)) {
                map.set(
                    node.slug.join("/"),
                    parents.filter(FernNavigation.utils.nodeHasMetadata).map((p) => p.slug.join("/")),
                );
            }
        });
        return map;
    }, [sidebar]);

    const parentToChildrenMap = useMemo(() => {
        const map = new Map<string, string[]>();
        FernNavigation.traverseNavigation(sidebar, (visitedNode, _index, parents) => {
            if (!FernNavigation.utils.nodeHasMetadata(visitedNode)) {
                return;
            }
            const parent = last(parents.filter(FernNavigation.utils.nodeHasMetadata));

            if (parent != null) {
                const parentSlug = urljoin(parent.slug);
                if (!map.has(parentSlug)) {
                    map.set(parentSlug, []);
                }
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                map.get(parentSlug)!.push(urljoin(visitedNode.slug));
            }
        });
        return map;
    }, [sidebar]);

    const selectedSlug = useMemo(() => selectedSlugString.split("/"), [selectedSlugString]);
    const [expanded, setExpanded] = useState<string[][]>(() => [
        selectedSlug,
        ...(parentSlugMap.get(selectedSlug.join("/"))?.map((slug) => slug.split("/")) ?? []),
    ]);

    useEffect(() => {
        const newExpanded = [
            selectedSlug,
            ...(parentSlugMap.get(selectedSlug.join("/"))?.map((slug) => slug.split("/")) ?? []),
        ];
        setExpanded(newExpanded);
    }, [parentSlugMap, selectedSlug]);

    const checkExpanded = useCallback(
        (expandableSlug: readonly string[]) =>
            expanded.some(
                (slug) =>
                    slug.join("/") === expandableSlug.join("/") ||
                    parentSlugMap.get(slug.join("/"))?.includes(expandableSlug.join("/")),
            ),
        [expanded, parentSlugMap],
    );

    const toggleExpanded = useCallback(
        (slug: readonly string[]) => {
            setExpanded((expanded) => {
                const childenToCollapse = parentToChildrenMap.get(slug.join("/")) ?? [];
                if (expanded.some((s) => s.join("/") === slug.join("/") || childenToCollapse.includes(s.join("/")))) {
                    return expanded.filter(
                        (s) => s.join("/") !== slug.join("/") && !childenToCollapse.includes(s.join("/")),
                    );
                }
                return [...expanded, [...slug]];
            });
        },
        [parentToChildrenMap],
    );

    const value = useMemo(
        () => ({ expanded, toggleExpanded, selectedSlug, checkExpanded }),
        [expanded, toggleExpanded, selectedSlug, checkExpanded],
    );

    // If there is only one pageGroup with only one page, hide the sidebar content
    // this is useful for tabs that only have one page
    if (
        sidebar.children.length === 1 &&
        sidebar.children[0].type === "sidebarGroup" &&
        sidebar.children[0].children.length === 1 &&
        sidebar.children[0].children[0].type === "page"
    ) {
        return null;
    }

    return <CollapseSidebarContext.Provider value={value}>{children}</CollapseSidebarContext.Provider>;
};
