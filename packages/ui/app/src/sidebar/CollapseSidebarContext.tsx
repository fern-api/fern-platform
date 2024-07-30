import { FernNavigation } from "@fern-api/fdr-sdk";
import { useAtomValue } from "jotai";
import {
    FC,
    PropsWithChildren,
    RefObject,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { noop } from "ts-essentials";
import { useCallbackOne } from "use-memo-one";
import { CURRENT_NODE_ATOM, CURRENT_NODE_ID_ATOM, useAtomEffect, useSidebarNodes } from "../atoms";
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

export const useCollapseSidebar = (): CollapseSidebarContextValue => useContext(CollapseSidebarContext);

export const CollapseSidebarProvider: FC<
    PropsWithChildren<{
        // scrollRef: RefObject<HTMLDivElement>;
    }>
> = ({ children }) => {
    const sidebar = useSidebarNodes();
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

    // const stopMeasuring = useRef<() => void>(noop);

    // const registerScrolledToPathListener = useCallback(
    //     (nodeId: FernNavigation.NodeId, targetRef: RefObject<HTMLDivElement>) =>
    //         registerListener(nodeId, () => {
    //             fastdom.clear(stopMeasuring.current);
    //             stopMeasuring.current = fastdom.measure(() => {
    //                 if (scrollContainerRef.current == null || targetRef.current == null) {
    //                     return;
    //                 }
    //                 // if the target is already in view, don't scroll
    //                 if (
    //                     targetRef.current.offsetTop >= scrollContainerRef.current.scrollTop &&
    //                     targetRef.current.offsetTop + targetRef.current.clientHeight <=
    //                         scrollContainerRef.current.scrollTop + scrollContainerRef.current.clientHeight
    //                 ) {
    //                     return;
    //                 }

    //                 // if the target is outside of the scroll container, scroll to it (centered)
    //                 scrollContainerRef.current.scrollTo({
    //                     top: targetRef.current.offsetTop - scrollContainerRef.current.clientHeight / 3,
    //                     behavior: "smooth",
    //                 });
    //             });
    //         }),
    //     [registerListener, scrollContainerRef],
    // );

    const { parentIdMap, parentToChildrenMap } = useMemo(() => {
        const parentIdMap = new Map<FernNavigation.NodeId, FernNavigation.NodeId[]>();
        const parentToChildrenMap = new Map<FernNavigation.NodeId, FernNavigation.NodeId[]>();
        if (sidebar == null) {
            return { parentIdMap, parentToChildrenMap };
        }

        FernNavigation.utils.traverseNavigation(sidebar, (node, _index, parents) => {
            if (FernNavigation.hasMetadata(node)) {
                parentIdMap.set(
                    node.id,
                    parents.map((p) => p.id),
                );
            }
        });

        parentIdMap.forEach((parents, id) => {
            parents.forEach((parentId) => {
                const children = parentToChildrenMap.get(parentId) ?? [];
                children.push(id);
                parentToChildrenMap.set(parentId, children);
            });
        });

        return { parentIdMap, parentToChildrenMap };
    }, [sidebar]);

    const initializeExpandedSections = (): FernNavigation.NodeId[] => {
        if (selectedNodeId == null) {
            return [];
        } else {
            if (sidebar != null) {
                const expandedNodes: FernNavigation.NodeId[] = [];
                FernNavigation.utils.traverseNavigation(sidebar, (node) => {
                    if (node.type === "section") {
                        if (node.collapsed === false) {
                            expandedNodes.push(...[node.id, ...(parentIdMap.get(node.id) ?? [])]);
                        }
                    }
                });
                return [...expandedNodes, selectedNodeId, ...(parentIdMap.get(selectedNodeId) ?? [])];
            } else {
                return [selectedNodeId, ...(parentIdMap.get(selectedNodeId) ?? [])];
            }
        }
    };

    const [expanded, setExpanded] = useState<FernNavigation.NodeId[]>(() => initializeExpandedSections());

    useEffect(() => {
        setExpanded(initializeExpandedSections());
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
            checkExpanded,
            checkChildSelected,
            registerScrolledToPathListener: () => noop,
        }),
        [expanded, toggleExpanded, checkExpanded, checkChildSelected],
    );

    return <CollapseSidebarContext.Provider value={value}>{children}</CollapseSidebarContext.Provider>;
};
