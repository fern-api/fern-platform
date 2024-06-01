import { FernNavigation } from "@fern-api/fdr-sdk";
import { noop } from "lodash-es";
import { FC, PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useNavigationContext } from "../contexts/navigation-context/useNavigationContext";

interface CollapseSidebarContextValue {
    expanded: FernNavigation.NodeId[];
    toggleExpanded: (id: FernNavigation.NodeId) => void;
    selectedNodeId: FernNavigation.NodeId | undefined;
    checkExpanded: (id: FernNavigation.NodeId) => boolean;
    checkChildSelected: (id: FernNavigation.NodeId) => boolean;
    registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
}

const CollapseSidebarContext = createContext<CollapseSidebarContextValue>({
    expanded: [],
    toggleExpanded: noop,
    selectedNodeId: undefined,
    checkExpanded: () => false,
    checkChildSelected: () => false,
    registerScrolledToPathListener: () => noop,
});

export function checkSlugStartsWith(slug: FernNavigation.Slug, startsWith: readonly string[]): boolean {
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
    const { activeNavigatable, registerScrolledToPathListener } = useNavigationContext();

    const selectedNodeId = activeNavigatable?.id;

    const parentIdMap = useMemo(() => {
        const map = new Map<FernNavigation.NodeId, FernNavigation.NodeId[]>();
        FernNavigation.utils.traverseNavigation(sidebar, (node, _index, parents) => {
            if (FernNavigation.hasMetadata(node)) {
                map.set(
                    node.id,
                    parents.map((p) => p.id),
                );
            }
        });
        return map;
    }, [sidebar]);

    const parentToChildrenMap = useMemo(() => {
        const map = new Map<FernNavigation.NodeId, FernNavigation.NodeId[]>();
        parentIdMap.forEach((parents, id) => {
            parents.forEach((parentId) => {
                const children = map.get(parentId) ?? [];
                children.push(id);
                map.set(parentId, children);
            });
        });
        return map;
    }, [parentIdMap]);

    const [expanded, setExpanded] = useState<FernNavigation.NodeId[]>(() =>
        selectedNodeId == null ? [] : [selectedNodeId, ...(parentIdMap.get(selectedNodeId) ?? [])],
    );

    useEffect(() => {
        setExpanded(selectedNodeId == null ? [] : [selectedNodeId, ...(parentIdMap.get(selectedNodeId) ?? [])]);
    }, [selectedNodeId, parentIdMap]);

    const checkExpanded = useCallback(
        (expandableId: FernNavigation.NodeId) =>
            expanded.some((id) => id === expandableId || parentIdMap.get(id)?.includes(expandableId)),
        [expanded, parentIdMap],
    );

    const checkChildSelected = useCallback(
        (parentId: FernNavigation.NodeId) =>
            (selectedNodeId != null && parentToChildrenMap.get(parentId)?.includes(selectedNodeId)) ?? false,
        [parentToChildrenMap, selectedNodeId],
    );

    const toggleExpanded = useCallback(
        (toggleId: FernNavigation.NodeId) => {
            setExpanded((expanded) => {
                const childenToCollapse = parentToChildrenMap.get(toggleId) ?? [];
                if (expanded.some((s) => s === toggleId || childenToCollapse.includes(s))) {
                    return expanded.filter((s) => s !== toggleId && !childenToCollapse.includes(s));
                }
                return [...expanded, toggleId];
            });
        },
        [parentToChildrenMap],
    );

    const value = useMemo(
        () => ({
            expanded,
            toggleExpanded,
            selectedNodeId,
            checkExpanded,
            checkChildSelected,
            registerScrolledToPathListener,
        }),
        [expanded, toggleExpanded, selectedNodeId, checkExpanded, checkChildSelected, registerScrolledToPathListener],
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
