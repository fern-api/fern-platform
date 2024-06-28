import { FernNavigation } from "@fern-api/fdr-sdk";
import * as Sentry from "@sentry/nextjs";
import { useAtom } from "jotai";
import { mapValues, noop } from "lodash-es";
import dynamic from "next/dynamic";
import { FC, PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo } from "react";
import useSWR from "swr";
import urljoin from "url-join";
import { capturePosthogEvent } from "../analytics/posthog";
import { useFeatureFlags } from "../contexts/FeatureFlagContext";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import {
    ResolvedApiDefinition,
    ResolvedRootPackage,
    flattenRootPackage,
    isEndpoint,
    isWebSocket,
} from "../resolver/types";
import { APIS } from "../sidebar/atom";
import { getInitialEndpointRequestFormStateWithExample } from "./PlaygroundDrawer";
import {
    PLAYGROUND_FORM_STATE_ATOM,
    useInitPlaygroundRouter,
    useOpenPlayground,
    usePlaygroundHeight,
    usePlaygroundNode,
} from "./hooks/usePlaygroundNodeId";

const PlaygroundDrawer = dynamic(() => import("./PlaygroundDrawer").then((m) => m.PlaygroundDrawer), {
    ssr: false,
});

interface PlaygroundContextValue {
    hasPlayground: boolean;
    selectionState: FernNavigation.NavigationNodeApiLeaf | undefined;
    setSelectionStateAndOpen: (state: FernNavigation.NavigationNodeApiLeaf) => void;
}

const PlaygroundContext = createContext<PlaygroundContextValue>({
    hasPlayground: false,
    selectionState: undefined,
    setSelectionStateAndOpen: noop,
});

const fetcher = async (url: string) => {
    const res = await fetch(url);
    return res.json();
};

export const PlaygroundContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const { isApiPlaygroundEnabled } = useFeatureFlags();
    const [apis, setApis] = useAtom(APIS);
    const { basePath } = useDocsContext();
    const key = urljoin(basePath ?? "/", "/api/fern-docs/resolve-api");

    const { data } = useSWR<Record<string, ResolvedRootPackage> | null>(key, fetcher, {
        revalidateOnFocus: false,
    });
    useEffect(() => {
        if (data != null) {
            setApis(data);
        }
    }, [data, setApis]);

    const flattenedApis = useMemo(() => mapValues(apis, flattenRootPackage), [apis]);

    const [playgroundHeight] = usePlaygroundHeight();
    const [globalFormState, setGlobalFormState] = useAtom(PLAYGROUND_FORM_STATE_ATOM);

    useInitPlaygroundRouter();

    const selectionState = usePlaygroundNode();
    const openPlayground = useOpenPlayground();

    const setSelectionStateAndOpen = useCallback(
        async (newSelectionState: FernNavigation.NavigationNodeApiLeaf) => {
            const matchedPackage = flattenedApis[newSelectionState.apiDefinitionId];
            if (matchedPackage == null) {
                Sentry.captureMessage("Could not find package for API playground selection state", "fatal");
                return;
            }

            if (newSelectionState.type === "endpoint") {
                const matchedEndpoint = matchedPackage.apiDefinitions.find(
                    (definition) => isEndpoint(definition) && definition.id === newSelectionState.endpointId,
                ) as ResolvedApiDefinition.Endpoint | undefined;
                if (matchedEndpoint == null) {
                    Sentry.captureMessage("Could not find endpoint for API playground selection state", "fatal");
                }
                openPlayground(newSelectionState.id);
                capturePosthogEvent("api_playground_opened", {
                    endpointId: newSelectionState.endpointId,
                    endpointName: matchedEndpoint?.title,
                });
                if (matchedEndpoint != null && globalFormState[newSelectionState.id] == null) {
                    setGlobalFormState((currentFormState) => {
                        return {
                            ...currentFormState,
                            [newSelectionState.id]: getInitialEndpointRequestFormStateWithExample(
                                matchedPackage?.auth,
                                matchedEndpoint,
                                matchedEndpoint?.examples[0],
                                matchedPackage?.types ?? {},
                            ),
                        };
                    });
                }
            } else if (newSelectionState.type === "webSocket") {
                const matchedWebSocket = matchedPackage.apiDefinitions.find(
                    (definition) => isWebSocket(definition) && definition.id === newSelectionState.webSocketId,
                ) as ResolvedApiDefinition.Endpoint | undefined;
                if (matchedWebSocket == null) {
                    Sentry.captureMessage("Could not find websocket for API playground selection state", "fatal");
                }
                openPlayground(newSelectionState.id);
                capturePosthogEvent("api_playground_opened", {
                    webSocketId: newSelectionState.webSocketId,
                    webSocketName: matchedWebSocket?.title,
                });
            }
        },
        [flattenedApis, globalFormState, openPlayground, setGlobalFormState],
    );

    const hasPlayground = Object.keys(apis).length > 0;
    const value = useMemo(
        () => ({
            hasPlayground,
            selectionState,
            setSelectionStateAndOpen,
        }),
        [hasPlayground, selectionState, setSelectionStateAndOpen],
    );

    if (!isApiPlaygroundEnabled) {
        return <>{children}</>;
    }

    return (
        <PlaygroundContext.Provider value={value}>
            {children}
            <PlaygroundDrawer apis={flattenedApis} />
            {true && hasPlayground && <div style={{ height: playgroundHeight }} />}
        </PlaygroundContext.Provider>
    );
};

export function usePlaygroundContext(): PlaygroundContextValue {
    return useContext(PlaygroundContext);
}
