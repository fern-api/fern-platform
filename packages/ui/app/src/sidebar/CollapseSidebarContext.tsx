import { FernNavigation } from "@fern-api/fdr-sdk";
import { useAtomValue } from "jotai";
import { FC, PropsWithChildren, RefObject, createContext, useCallback, useEffect, useMemo, useState } from "react";
import { noop } from "ts-essentials";
import { useCallbackOne } from "use-memo-one";
import {
    CURRENT_NODE_ATOM,
    CURRENT_NODE_ID_ATOM,
    SIDEBAR_CHILD_TO_PARENTS_MAP_ATOM,
    SIDEBAR_PARENT_TO_CHILDREN_MAP_ATOM,
    useAtomEffect,
} from "../atoms";
import { useActiveValueListeners } from "../hooks/useActiveValueListeners";

interface CollapseSidebarContextValue {
    expanded: FernNavigation.NodeId[];
    toggleExpanded: (id: FernNavigation.NodeId) => void;
    checkExpanded: (id: FernNavigation.NodeId) => boolean;
    checkChildSelected: (id: FernNavigation.NodeId) => boolean;
    registerScrolledToPathListener: (nodeId: FernNavigation.NodeId, ref: RefObject<HTMLDivElement>) => () => void;
}

const CollapseSidebarContext = createContext<CollapseSidebarContextValue>({
    expanded: [],
    toggleExpanded: noop,
    checkExpanded: () => false,
    checkChildSelected: () => false,
    registerScrolledToPathListener: () => noop,
});

// export const useCollapseSidebar = (): CollapseSidebarContextValue => useContext(CollapseSidebarContext);

export const CollapseSidebarProvider: FC<
    PropsWithChildren<{
        // scrollRef: RefObject<HTMLDivElement>;
    }>
> = ({ children }) => {
    const selectedNodeId = useAtomValue(CURRENT_NODE_ID_ATOM);

    const { invokeListeners, registerListener: _registerListener } = useActiveValueListeners(selectedNodeId);

    useAtomEffect(
        useCallbackOne(
            (get) => {
                const node = get(CURRENT_NODE_ATOM);
                if (node != null) {
                    invokeListeners(node.id);
                }
            },
            [invokeListeners],
        ),
    );

    const childToParentsMap = useAtomValue(SIDEBAR_CHILD_TO_PARENTS_MAP_ATOM);
    const parentToChildrenMap = useAtomValue(SIDEBAR_PARENT_TO_CHILDREN_MAP_ATOM);

    const [expanded, setExpanded] = useState<FernNavigation.NodeId[]>(() =>
        selectedNodeId == null ? [] : [selectedNodeId, ...(childToParentsMap.get(selectedNodeId) ?? [])],
    );

    useEffect(() => {
        setExpanded(selectedNodeId == null ? [] : [selectedNodeId, ...(childToParentsMap.get(selectedNodeId) ?? [])]);
    }, [selectedNodeId, childToParentsMap]);

    const checkExpanded = useCallback(
        (expandableId: FernNavigation.NodeId) =>
            expanded.some((id) => id === expandableId || childToParentsMap.get(id)?.includes(expandableId)),
        [expanded, childToParentsMap],
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
            checkExpanded,
            checkChildSelected,
            registerScrolledToPathListener: () => noop,
        }),
        [expanded, toggleExpanded, checkExpanded, checkChildSelected],
    );

    return <CollapseSidebarContext.Provider value={value}>{children}</CollapseSidebarContext.Provider>;
};
