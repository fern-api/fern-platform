import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { mapValues, noop } from "lodash-es";
import dynamic from "next/dynamic";
import { createContext, FC, PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";
import { resolve } from "url";
import { capturePosthogEvent } from "../analytics/posthog";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useFeatureFlags } from "../contexts/FeatureFlagContext";
import { useNavigationContext } from "../contexts/navigation-context";
import { APIS } from "../sidebar/atom";
import {
    flattenRootPackage,
    isEndpoint,
    isWebSocket, ResolvedApiDefinition,
    ResolvedRootPackage
} from "../util/resolver";
import {
    createFormStateKey,
    getInitialEndpointRequestFormStateWithExample, PlaygroundSelectionState, usePlaygroundHeight
} from "./PlaygroundDrawer";
import { PlaygroundRequestFormState } from "./types";

const PlaygroundDrawer = dynamic(() => import("./PlaygroundDrawer").then((m) => m.PlaygroundDrawer), {
    ssr: false,
});

interface PlaygroundContextValue {
    hasPlayground: boolean;
    selectionState: PlaygroundSelectionState | undefined;
    setSelectionStateAndOpen: (state: PlaygroundSelectionState) => void;
    expandPlayground: () => void;
    collapsePlayground: () => void;
}

const PlaygroundContext = createContext<PlaygroundContextValue>({
    hasPlayground: false,
    selectionState: undefined,
    setSelectionStateAndOpen: noop,
    expandPlayground: noop,
    collapsePlayground: noop,
});

export const PLAYGROUND_OPEN_ATOM = atomWithStorage<boolean>("api-playground-is-open", false);
export const PLAYGROUND_FORM_STATE_ATOM = atomWithStorage<Record<string, PlaygroundRequestFormState | undefined>>(
    "api-playground-selection-state-alpha",
    {},
);

export const PlaygroundContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const { isApiPlaygroundEnabled } = useFeatureFlags();
    const [apis, setApis] = useAtom(APIS);
    const { basePath } = useDocsContext();
    const { selectedSlug } = useNavigationContext();
    const [selectionState, setSelectionState] = useState<PlaygroundSelectionState | undefined>();

    const flattenedApis = useMemo(() => mapValues(apis, flattenRootPackage), [apis]);

    const [isPlaygroundOpen, setPlaygroundOpen] = useAtom(PLAYGROUND_OPEN_ATOM);
    const [playgroundHeight, setPlaygroundHeight] = usePlaygroundHeight();
    const [globalFormState, setGlobalFormState] = useAtom(PLAYGROUND_FORM_STATE_ATOM);

    const expandPlayground = useCallback(() => {
        capturePosthogEvent("api_playground_opened");
        setPlaygroundHeight((currentHeight) => {
            const windowHeight: number = window.innerHeight;
            return currentHeight < windowHeight ? windowHeight : currentHeight;
        });
        setPlaygroundOpen(true);
    }, [setPlaygroundHeight, setPlaygroundOpen]);
    const collapsePlayground = useCallback(() => setPlaygroundOpen(false), [setPlaygroundOpen]);

    const setSelectionStateAndOpen = useCallback(
        async (newSelectionState: PlaygroundSelectionState) => {
            let matchedPackage = flattenedApis[newSelectionState.api];
            if (matchedPackage == null) {
                const r = await fetch(
                    resolve(
                        basePath ?? "",
                        "/api/fern-docs/resolve-api?path=/" + selectedSlug + "&api=" + newSelectionState.api,
                    ),
                );

                const data: ResolvedRootPackage | null = await r.json();

                if (data == null) {
                    return;
                }

                setApis((currentApis) => ({ ...currentApis, [newSelectionState.api]: data }));
                matchedPackage = flattenRootPackage(data);
            }

            if (newSelectionState.type === "endpoint") {
                const matchedEndpoint = matchedPackage.apiDefinitions.find(
                    (definition) =>
                        isEndpoint(definition) && definition.slug.join("/") === newSelectionState.endpointId,
                ) as ResolvedApiDefinition.Endpoint | undefined;
                setSelectionState(newSelectionState);
                expandPlayground();
                capturePosthogEvent("api_playground_opened", {
                    endpointId: newSelectionState.endpointId,
                    endpointName: matchedEndpoint?.name,
                });
                if (matchedEndpoint != null && globalFormState[createFormStateKey(newSelectionState)] == null) {
                    setGlobalFormState((currentFormState) => {
                        return {
                            ...currentFormState,
                            [createFormStateKey(newSelectionState)]: getInitialEndpointRequestFormStateWithExample(
                                matchedPackage?.auth,
                                matchedEndpoint,
                                matchedEndpoint?.examples[0],
                                matchedPackage?.types ?? {},
                            ),
                        };
                    });
                }
            } else if (newSelectionState.type === "websocket") {
                const matchedWebSocket = matchedPackage.apiDefinitions.find(
                    (definition) =>
                        isWebSocket(definition) && definition.slug.join("/") === newSelectionState.webSocketId,
                ) as ResolvedApiDefinition.Endpoint | undefined;
                setSelectionState(newSelectionState);
                expandPlayground();
                capturePosthogEvent("api_playground_opened", {
                    webSocketId: newSelectionState.webSocketId,
                    webSocketName: matchedWebSocket?.name,
                });
            }
        },
        [basePath, expandPlayground, flattenedApis, globalFormState, selectedSlug, setApis, setGlobalFormState],
    );

    if (!isApiPlaygroundEnabled) {
        return <>{children}</>;
    }

    const hasPlayground = Object.keys(apis).length > 0;

    return (
        <PlaygroundContext.Provider
            value={{
                hasPlayground,
                selectionState,
                setSelectionStateAndOpen,
                expandPlayground,
                collapsePlayground,
            }}
        >
            {children}
            <PlaygroundDrawer apis={flattenedApis} />
            {isPlaygroundOpen && hasPlayground && <div style={{ height: playgroundHeight }} />}
        </PlaygroundContext.Provider>
    );
};

export function usePlaygroundContext(): PlaygroundContextValue {
    return useContext(PlaygroundContext);
}
