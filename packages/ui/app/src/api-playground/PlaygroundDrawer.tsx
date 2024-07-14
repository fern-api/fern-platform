import { FernNavigation } from "@fern-api/fdr-sdk";
import { FernButton } from "@fern-ui/components";
import { EMPTY_OBJECT } from "@fern-ui/core-utils";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeftIcon, Cross1Icon } from "@radix-ui/react-icons";
import { motion, useAnimate, useMotionValue } from "framer-motion";
import { useAtomValue, useSetAtom } from "jotai";
import { ReactElement, memo, useCallback, useEffect, useMemo } from "react";
import { useFlattenedApis, useSidebarNodes } from "../atoms";
import {
    useClosePlayground,
    useHasPlayground,
    useIsPlaygroundOpen,
    usePlaygroundFormStateAtom,
    usePlaygroundHeight,
    usePlaygroundNode,
    useSetPlaygroundHeight,
    useTogglePlayground,
} from "../atoms/playground";
import {
    IS_MOBILE_SCREEN_ATOM,
    JUST_NAVIGATED_ATOM,
    MOBILE_SIDEBAR_ENABLED_ATOM,
    useWindowHeight,
} from "../atoms/viewport";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { ResolvedApiDefinition, isEndpoint, isWebSocket } from "../resolver/types";
import { PlaygroundEndpoint } from "./PlaygroundEndpoint";
import { PlaygroundEndpointSelectorContent, flattenApiSection } from "./PlaygroundEndpointSelectorContent";
import { PlaygroundWebSocket } from "./PlaygroundWebSocket";
import { HorizontalSplitPane } from "./VerticalSplitPane";
import { useVerticalSplitPane } from "./useSplitPlane";

export const PlaygroundDrawer = memo((): ReactElement | null => {
    const windowHeight = useWindowHeight();
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
    const height = usePlaygroundHeight();
    const setHeight = useSetPlaygroundHeight();

    const x = useMotionValue(isMobileScreen ? height : windowHeight);
    const [scope, animate] = useAnimate();

    const setOffset = useCallback(
        (offset: number) => {
            windowHeight != null && setHeight(windowHeight - offset);
        },
        [setHeight, windowHeight],
    );

    const { handleVerticalResize, isResizing } = useVerticalSplitPane(setOffset);
    const justNavigated = useAtomValue(JUST_NAVIGATED_ATOM);

    useEffect(() => {
        if (isResizing || justNavigated) {
            x.jump(!isMobileScreen ? height : windowHeight, true);
        } else {
            if (scope.current != null) {
                // x.setWithVelocity(layoutBreakpoint !== "mobile" ? height : windowHeight, 0);
                void animate(scope.current, { height: !isMobileScreen ? height : windowHeight });
            } else {
                x.jump(!isMobileScreen ? height : windowHeight, true);
            }
        }
    }, [animate, height, isMobileScreen, isResizing, justNavigated, scope, windowHeight, x]);

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
                <ArrowLeftIcon className="size-8 mb-2 t-muted" />
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
                <FernButton
                    variant="minimal"
                    className="-mr-3"
                    icon={<Cross1Icon />}
                    onClick={collapsePlayground}
                    rounded
                />
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
            {isPlaygroundOpen && <div style={{ height }} />}
            <Dialog.Root open={isPlaygroundOpen} onOpenChange={togglePlayground} modal={false}>
                <Dialog.Portal>
                    <Dialog.Content
                        className="data-[state=open]:animate-content-show-from-bottom fixed bottom-0 inset-x-0 bg-background-translucent backdrop-blur-2xl shadow-xl border-t border-default max-sm:h-full"
                        onInteractOutside={(e) => {
                            e.preventDefault();
                        }}
                        asChild
                    >
                        <motion.div style={{ height: x }} ref={scope}>
                            {!isMobileScreen ? (
                                <>
                                    <div
                                        className="group absolute inset-x-0 -top-0.5 h-0.5 cursor-row-resize after:absolute after:inset-x-0 after:-top-2 after:z-50 after:h-4 after:content-['']"
                                        onMouseDown={handleVerticalResize}
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
