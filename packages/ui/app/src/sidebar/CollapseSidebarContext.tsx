import { FernNavigation } from "@fern-api/fdr-sdk";
import { NodeCollector } from "@fern-api/fdr-sdk/navigation";
import { noop } from "lodash-es";
import { useRouter } from "next/router";
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
import urljoin from "url-join";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useActiveValueListeners } from "../hooks/useActiveValueListeners";

interface CollapseSidebarContextValue {
    expanded: FernNavigation.NodeId[];
    toggleExpanded: (id: FernNavigation.NodeId) => void;
    selectedNodeId: FernNavigation.NodeId | undefined;
    checkExpanded: (id: FernNavigation.NodeId) => boolean;
    checkChildSelected: (id: FernNavigation.NodeId) => boolean;
    registerScrolledToPathListener: (nodeId: FernNavigation.NodeId, ref: RefObject<HTMLDivElement>) => () => void;
}

const CollapseSidebarContext = createContext<CollapseSidebarContextValue>({
    expanded: [],
    toggleExpanded: noop,
    selectedNodeId: undefined,
    checkExpanded: () => false,
    checkChildSelected: () => false,
    registerScrolledToPathListener: () => noop,
});

export const useCollapseSidebar = (): CollapseSidebarContextValue => useContext(CollapseSidebarContext);

function toSlug(route: string): FernNavigation.Slug {
    let parts = route.slice(1).split("#")[0].split("/") ?? [];
    if (typeof window === "undefined") {
        parts = parts.slice(2);
    }
    return FernNavigation.Slug(urljoin(parts));
}

export const CollapseSidebarProvider: FC<
    PropsWithChildren<{
        scrollRef: RefObject<HTMLDivElement>;
    }>
> = ({ children, scrollRef: scrollContainerRef }) => {
    const router = useRouter();
    const { sidebar } = useDocsContext();
    const nodeCollector = useMemo(() => new NodeCollector(sidebar), [sidebar]);
    const [selectedNodeId, setSelectedNodeId] = useState(() => nodeCollector.slugMap.get(toSlug(router.asPath))?.id);

    const { invokeListeners, registerListener } = useActiveValueListeners(selectedNodeId);

    useEffect(() => {
        const handleRouteChange = (route: string) => {
            const nextSelectedNodeId = nodeCollector.slugMap.get(toSlug(route))?.id;
            setSelectedNodeId(nextSelectedNodeId);
            if (nextSelectedNodeId != null) {
                invokeListeners(nextSelectedNodeId);
            }
        };
        const handleRouteChangeError = (_err: Error, route: string) => {
            handleRouteChange(route);
        };
        router.events.on("routeChangeComplete", handleRouteChange);
        router.events.on("hashChangeStart", handleRouteChange);
        router.events.on("hashChangeComplete", handleRouteChange);
        router.events.on("routeChangeError", handleRouteChangeError);
        return () => {
            router.events.off("routeChangeComplete", handleRouteChange);
            router.events.off("hashChangeStart", handleRouteChange);
            router.events.off("hashChangeComplete", handleRouteChange);
            router.events.off("routeChangeError", handleRouteChangeError);
        };
    }, [invokeListeners, nodeCollector.slugMap, router.events]);

    const registerScrolledToPathListener = useCallback(
        (nodeId: FernNavigation.NodeId, targetRef: RefObject<HTMLDivElement>) =>
            registerListener(nodeId, () => {
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
                    top: targetRef.current.offsetTop - scrollContainerRef.current.clientHeight / 2,
                    behavior: "smooth",
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
