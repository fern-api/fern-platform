import { FernNavigation } from "@fern-api/fdr-sdk";
import fastdom from "fastdom";
import { useAtomValue } from "jotai";
import { noop } from "lodash-es";
import {
    FC,
    PropsWithChildren,
    RefObject,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useCallbackOne } from "use-memo-one";
import { CURRENT_NODE_ATOM, CURRENT_NODE_ID_ATOM, useSidebarNodes } from "../atoms/navigation";
import { useActiveValueListeners } from "../hooks/useActiveValueListeners";
import { useAtomEffect } from "../hooks/useAtomEffect";

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
        scrollRef: RefObject<HTMLDivElement>;
    }>
> = ({ children, scrollRef: scrollContainerRef }) => {
    const sidebar = useSidebarNodes();
    const selectedNodeId = useAtomValue(CURRENT_NODE_ID_ATOM);

    const { invokeListeners, registerListener } = useActiveValueListeners(selectedNodeId);

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

    const stopMeasuring = useRef<() => void>(noop);

    const registerScrolledToPathListener = useCallback(
        (nodeId: FernNavigation.NodeId, targetRef: RefObject<HTMLDivElement>) =>
            registerListener(nodeId, () => {
                fastdom.clear(stopMeasuring.current);
                stopMeasuring.current = fastdom.measure(() => {
                    if (scrollContainerRef.current == null || targetRef.current == null) {
                        return;
                    }
                    // if the target is already in view, don't scroll
                    if (
                        targetRef.current.offsetTop >= scrollContainerRef.current.scrollTop &&
                        targetRef.current.offsetTop + targetRef.current.clientHeight <=
                            scrollContainerRef.current.scrollTop + scrollContainerRef.current.clientHeight
                    ) {
                        return;
                    }

                    // if the target is outside of the scroll container, scroll to it (centered)
                    scrollContainerRef.current.scrollTo({
                        top: targetRef.current.offsetTop - scrollContainerRef.current.clientHeight / 3,
                        behavior: "smooth",
                    });
                });
            }),
        [registerListener, scrollContainerRef],
    );

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
            checkExpanded,
            checkChildSelected,
            registerScrolledToPathListener,
        }),
        [expanded, toggleExpanded, checkExpanded, checkChildSelected, registerScrolledToPathListener],
    );

    // If there is only one pageGroup with only one page, hide the sidebar content
    // this is useful for tabs that only have one page
    if (
        sidebar == null ||
        (sidebar.children.length === 1 &&
            sidebar.children[0].type === "sidebarGroup" &&
            sidebar.children[0].children.length === 1 &&
            sidebar.children[0].children[0].type === "page")
    ) {
        return null;
    }

    return <CollapseSidebarContext.Provider value={value}>{children}</CollapseSidebarContext.Provider>;
};
