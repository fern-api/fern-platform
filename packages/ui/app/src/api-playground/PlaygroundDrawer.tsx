import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernButton } from "@fern-ui/components";
import { EMPTY_OBJECT } from "@fern-ui/core-utils";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { animate, motion, useMotionValue } from "framer-motion";
import { ArrowLeft, Xmark } from "iconoir-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { ReactElement, memo, useEffect, useMemo } from "react";
import { useCallbackOne } from "use-memo-one";
import { useAtomEffect, useFlattenedApis, useSidebarNodes } from "../atoms";
import {
    MAX_PLAYGROUND_HEIGHT_ATOM,
    PLAYGROUND_NODE_ID,
    useClosePlayground,
    useHasPlayground,
    useIsPlaygroundOpen,
    usePlaygroundFormStateAtom,
    usePlaygroundNode,
    useTogglePlayground,
} from "../atoms/playground";
import { IS_MOBILE_SCREEN_ATOM, MOBILE_SIDEBAR_ENABLED_ATOM, VIEWPORT_HEIGHT_ATOM } from "../atoms/viewport";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { ResolvedApiDefinition, isEndpoint, isWebSocket } from "../resolver/types";
import { PlaygroundEndpoint } from "./PlaygroundEndpoint";
import { PlaygroundEndpointSelectorContent, flattenApiSection } from "./PlaygroundEndpointSelectorContent";
import { PlaygroundWebSocket } from "./PlaygroundWebSocket";
import { HorizontalSplitPane } from "./VerticalSplitPane";
import { useResizeY } from "./useSplitPlane";

export const PlaygroundDrawer = memo((): ReactElement | null => {
    const collapsePlayground = useClosePlayground();
    const hasPlayground = useHasPlayground();
    const selectionState = usePlaygroundNode();
    const apis = useFlattenedApis();

    const sidebar = useSidebarNodes();
    const apiGroups = useMemo(() => flattenApiSection(sidebar), [sidebar]);

    const matchedSection = selectionState != null ? apis[selectionState.apiDefinitionId] : undefined;

    const nodeIdToApiDefinition = useMemo(() => {
        const nodes = new Map<FernNavigation.NodeId, ResolvedApiDefinition>();
        Object.values(apis).forEach((api) => {
            api.apiDefinitions.forEach((apiDefinition) => {
                nodes.set(apiDefinition.nodeId, apiDefinition);
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
            const newHeight = get(VIEWPORT_HEIGHT_ATOM) - y;
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
            ? (matchedSection?.apiDefinitions.find(
                  (definition) => isEndpoint(definition) && definition.id === selectionState.endpointId,
              ) as ResolvedApiDefinition.Endpoint | undefined)
            : undefined;

    const matchedWebSocket =
        selectionState?.type === "webSocket"
            ? (matchedSection?.apiDefinitions.find(
                  (definition) => isWebSocket(definition) && definition.id === selectionState.webSocketId,
              ) as ResolvedApiDefinition.WebSocket | undefined)
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

    if (!hasPlayground || apiGroups.length === 0) {
        return null;
    }

    const renderContent = () =>
        selectionState?.type === "endpoint" && matchedEndpoint != null ? (
            <PlaygroundEndpoint endpoint={matchedEndpoint} types={types} />
        ) : selectionState?.type === "webSocket" && matchedWebSocket != null ? (
            <PlaygroundWebSocket websocket={matchedWebSocket} types={types} />
        ) : (
            <div className="size-full flex flex-col items-center justify-center">
                <ArrowLeft className="size-8 mb-2 t-muted" />
                <h6 className="t-muted">Select an endpoint to get started</h6>
            </div>
        );

    const renderMobileHeader = () => (
        <div className="grid h-10 grid-cols-2 gap-2 px-4">
            <div className="flex items-center">
                <span className="inline-flex items-baseline gap-2">
                    <span className="t-accent text-sm font-semibold">API Playground</span>
                </span>
            </div>

            <div className="flex items-center justify-end">
                <FernButton variant="minimal" className="-mr-3" icon={<Xmark />} onClick={collapsePlayground} rounded />
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
                        className="data-[state=open]:animate-content-show-from-bottom fixed bottom-0 inset-x-0 bg-background-translucent backdrop-blur-2xl shadow-xl border-t border-default max-sm:h-full"
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
                                        className="group absolute inset-x-0 -top-0.5 h-0.5 cursor-row-resize after:absolute after:inset-x-0 after:-top-2 after:z-50 after:h-4 after:content-[''] touch-none"
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
