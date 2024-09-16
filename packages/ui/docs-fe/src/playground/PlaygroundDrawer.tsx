import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernButton } from "@fern-ui/components";
import { EMPTY_OBJECT } from "@fern-platform/core-utils";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { animate, motion, useMotionValue } from "framer-motion";
import { ArrowLeft, Xmark } from "iconoir-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { ReactElement, memo, useEffect, useMemo } from "react";
import { useCallbackOne } from "use-memo-one";
import { HEADER_HEIGHT_ATOM, useAtomEffect, useFlattenedApis, useSidebarNodes } from "../atoms";
import {
    MAX_PLAYGROUND_HEIGHT_ATOM,
    PLAYGROUND_NODE_ID,
    useIsPlaygroundOpen,
    usePlaygroundFormStateAtom,
    usePlaygroundNode,
    useTogglePlayground,
} from "../atoms/playground";
import { IS_MOBILE_SCREEN_ATOM, MOBILE_SIDEBAR_ENABLED_ATOM, VIEWPORT_HEIGHT_ATOM } from "../atoms/viewport";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { isEndpoint, isWebSocket, type ResolvedApiEndpointWithPackage } from "../resolver/types";
import { PlaygroundWebSocket } from "./PlaygroundWebSocket";
import { HorizontalSplitPane } from "./VerticalSplitPane";
import { PlaygroundEndpoint } from "./endpoint/PlaygroundEndpoint";
import { PlaygroundEndpointSelectorContent, flattenApiSection } from "./endpoint/PlaygroundEndpointSelectorContent";
import { PlaygroundEndpointSkeleton } from "./endpoint/PlaygroundEndpointSkeleton";
import { useResizeY } from "./useSplitPlane";

interface PlaygroundDrawerProps {
    isLoading: boolean;
}

export const PlaygroundDrawer = memo(({ isLoading }: PlaygroundDrawerProps): ReactElement | null => {
    const selectionState = usePlaygroundNode();
    const apis = useFlattenedApis();

    const sidebar = useSidebarNodes();
    const apiGroups = useMemo(() => flattenApiSection(sidebar), [sidebar]);

    const matchedSection = selectionState != null ? apis[selectionState.apiDefinitionId] : undefined;

    const nodeIdToApiDefinition = useMemo(() => {
        const nodes = new Map<FernNavigation.NodeId, ResolvedApiEndpointWithPackage>();
        Object.values(apis).forEach((api) => {
            api.endpoints.forEach((endpoint) => {
                nodes.set(endpoint.nodeId, endpoint);
            });
        });
        return nodes;
    }, [apis]);

    const types = matchedSection?.types ?? EMPTY_OBJECT;

    const isMobileScreen = useAtomValue(IS_MOBILE_SCREEN_ATOM);
    const isMobileSidebarEnabled = useAtomValue(MOBILE_SIDEBAR_ENABLED_ATOM);

    const maxHeight = useAtomValue(MAX_PLAYGROUND_HEIGHT_ATOM);
    const height = useMotionValue(useAtomValue(VIEWPORT_HEIGHT_ATOM));

    const setOffset = useAtomCallback(
        useCallbackOne((get, _set, y: number) => {
            const windowHeight = get(VIEWPORT_HEIGHT_ATOM);
            const isMobileScreen = get(IS_MOBILE_SCREEN_ATOM);
            const headerHeight = get(HEADER_HEIGHT_ATOM);
            const maxHeight = isMobileScreen ? windowHeight : windowHeight - headerHeight;
            const newHeight = Math.min(windowHeight - y, maxHeight);
            height.jump(newHeight, true);
        }, []),
    );

    useAtomEffect(
        useCallbackOne((get) => {
            get(PLAYGROUND_NODE_ID);
            void animate(height, get.peek(VIEWPORT_HEIGHT_ATOM));
        }, []),
    );

    const resizeY = useResizeY(setOffset);

    const isPlaygroundOpen = useIsPlaygroundOpen();
    const togglePlayground = useTogglePlayground();

    const matchedEndpoint =
        selectionState?.type === "endpoint"
            ? (matchedSection?.endpoints.find(
                  (definition) => isEndpoint(definition) && definition.id === selectionState.endpointId,
              ) as ResolvedApiEndpointWithPackage.Endpoint | undefined)
            : undefined;

    const matchedWebSocket =
        selectionState?.type === "webSocket"
            ? (matchedSection?.endpoints.find(
                  (definition) => isWebSocket(definition) && definition.id === selectionState.webSocketId,
              ) as ResolvedApiEndpointWithPackage.WebSocket | undefined)
            : undefined;

    useEffect(() => {
        // if keyboard press "ctrl + `", open playground
        const togglePlaygroundHandler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === "`") {
                togglePlayground();
            }
        };
        document.addEventListener("keydown", togglePlaygroundHandler, false);
        return () => {
            document.removeEventListener("keydown", togglePlaygroundHandler, false);
        };
    }, [togglePlayground]);

    const { endpoint: selectedEndpoint } = apiGroups
        .flatMap((group) => [...group.items.map((endpoint) => ({ group, endpoint }))])
        .find(({ endpoint }) => endpoint.id === selectionState?.id) ?? {
        endpoint: undefined,
        group: undefined,
    };

    const setFormState = useSetAtom(usePlaygroundFormStateAtom(selectionState?.id ?? FernNavigation.NodeId("")));

    const renderContent = () =>
        selectionState?.type === "endpoint" && matchedEndpoint != null ? (
            <PlaygroundEndpoint endpoint={matchedEndpoint} types={types} />
        ) : selectionState?.type === "webSocket" && matchedWebSocket != null ? (
            <PlaygroundWebSocket websocket={matchedWebSocket} types={types} />
        ) : isLoading ? (
            <PlaygroundEndpointSkeleton />
        ) : (
            <div className="flex size-full flex-col items-center justify-center">
                <ArrowLeft className="t-muted mb-2 size-8" />
                <h6 className="t-muted">Select an endpoint to get started</h6>
            </div>
        );

    const renderMobileHeader = () => (
        <div className="grid h-10 grid-cols-2 gap-2 px-4">
            <div className="flex items-center">
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    <span className="t-accent">API Playground</span>
                    {selectedEndpoint != null && <span>{selectedEndpoint.title}</span>}
                </span>
            </div>

            <div className="flex items-center justify-end">
                <Dialog.Close asChild>
                    <FernButton variant="minimal" className="-mr-3" icon={<Xmark />} rounded />
                </Dialog.Close>
            </div>
        </div>
    );

    return (
        <FernErrorBoundary
            component="PlaygroundDrawer"
            className="flex h-full items-center justify-center"
            showError={true}
            reset={() => {
                setFormState(undefined);
            }}
        >
            {isPlaygroundOpen && <motion.div style={{ height, maxHeight }} />}
            <Dialog.Root open={isPlaygroundOpen} onOpenChange={togglePlayground} modal={false}>
                <Dialog.Portal>
                    <Dialog.Content
                        className="data-[state=open]:animate-content-show-from-bottom bg-background-translucent border-default fixed inset-x-0 bottom-0 border-t shadow-xl backdrop-blur-2xl max-sm:h-full"
                        onInteractOutside={(e) => {
                            e.preventDefault();
                        }}
                        asChild
                    >
                        <motion.div style={{ height, maxHeight }}>
                            <VisuallyHidden.Root>
                                <Dialog.Title>
                                    API Playground{selectedEndpoint != null ? ` for ${selectedEndpoint.title}` : ""}
                                </Dialog.Title>
                                <Dialog.Description>
                                    Browse, explore, and try out API endpoints without leaving the documentation.
                                </Dialog.Description>
                            </VisuallyHidden.Root>

                            {!isMobileScreen ? (
                                <>
                                    <div
                                        className="group absolute inset-x-0 -top-0.5 h-0.5 cursor-row-resize touch-none after:absolute after:inset-x-0 after:-top-2 after:z-50 after:h-4 after:content-['']"
                                        onMouseDown={resizeY.onMouseDown}
                                        onTouchStart={resizeY.onTouchStart}
                                    >
                                        <div className="bg-accent absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100" />
                                        <div className="relative -top-6 z-30 mx-auto w-fit p-4 pb-0">
                                            <div className="bg-accent h-1 w-10 rounded-full" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                renderMobileHeader()
                            )}
                            {isMobileSidebarEnabled ? (
                                renderContent()
                            ) : (
                                <HorizontalSplitPane
                                    mode="pixel"
                                    className="size-full"
                                    leftClassName="border-default border-r"
                                >
                                    <PlaygroundEndpointSelectorContent
                                        apiGroups={apiGroups}
                                        selectedEndpoint={selectedEndpoint}
                                        className="h-full"
                                        nodeIdToApiDefinition={nodeIdToApiDefinition}
                                    />

                                    {renderContent()}
                                </HorizontalSplitPane>
                            )}
                        </motion.div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </FernErrorBoundary>
    );
});

PlaygroundDrawer.displayName = "PlaygroundDrawer";
