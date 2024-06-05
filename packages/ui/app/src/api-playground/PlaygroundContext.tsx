import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { mapValues, noop } from "lodash-es";
import dynamic from "next/dynamic";
import { FC, PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import urljoin from "url-join";
import { capturePosthogEvent } from "../analytics/posthog.js";
import { useFeatureFlags } from "../contexts/FeatureFlagContext.js";
import { useDocsContext } from "../contexts/docs-context/useDocsContext.js";
import {
    ResolvedApiDefinition,
    ResolvedRootPackage,
    flattenRootPackage,
    isEndpoint,
    isWebSocket,
} from "../resolver/types.js";
import { APIS } from "../sidebar/atom.js";
import {
    PlaygroundSelectionState,
    createFormStateKey,
    getInitialEndpointRequestFormStateWithExample,
    usePlaygroundHeight,
} from "./PlaygroundDrawer.js";
import { PlaygroundRequestFormState } from "./types.js";

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

const fetcher = async (url: string) => {
    const res = await fetch(url);
    return res.json();
};

export const PlaygroundContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const { isApiPlaygroundEnabled } = useFeatureFlags();
    const [apis, setApis] = useAtom(APIS);
    const { basePath } = useDocsContext();
    const [selectionState, setSelectionState] = useState<PlaygroundSelectionState | undefined>();

    const key = urljoin(basePath ?? "", "/api/fern-docs/resolve-api");

    const { data } = useSWR<Record<string, ResolvedRootPackage> | null>(key, fetcher);
    useEffect(() => {
        if (data != null) {
            setApis(data);
        }
    }, [data, setApis]);

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
            const matchedPackage = flattenedApis[newSelectionState.api];
            if (matchedPackage == null) {
                return;
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
                    endpointName: matchedEndpoint?.title,
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
                    webSocketName: matchedWebSocket?.title,
                });
            }
        },
        [expandPlayground, flattenedApis, globalFormState, setGlobalFormState],
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
