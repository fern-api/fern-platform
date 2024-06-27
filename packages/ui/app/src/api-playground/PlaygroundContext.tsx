import { FernNavigation } from "@fern-api/fdr-sdk";
import * as Sentry from "@sentry/nextjs";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { mapValues, noop } from "lodash-es";
import dynamic from "next/dynamic";
import { FC, PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
import { getInitialEndpointRequestFormStateWithExample, usePlaygroundHeight } from "./PlaygroundDrawer";
import { PlaygroundRequestFormState } from "./types";

const PlaygroundDrawer = dynamic(() => import("./PlaygroundDrawer").then((m) => m.PlaygroundDrawer), {
    ssr: false,
});

interface PlaygroundContextValue {
    hasPlayground: boolean;
    selectionState: FernNavigation.NavigationNodeApiLeaf | undefined;
    setSelectionStateAndOpen: (state: FernNavigation.NavigationNodeApiLeaf) => void;
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
    const [selectionState, setSelectionState] = useState<FernNavigation.NavigationNodeApiLeaf | undefined>();

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
                setSelectionState(newSelectionState);
                expandPlayground();
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
