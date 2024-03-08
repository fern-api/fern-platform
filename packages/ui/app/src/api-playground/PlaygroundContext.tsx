import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { mapValues, noop } from "lodash-es";
import dynamic from "next/dynamic";
import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { capturePosthogEvent } from "../analytics/posthog";
import { useNavigationContext } from "../contexts/navigation-context";
import { APIS } from "../sidebar/atom";
import { SidebarNode } from "../sidebar/types";
import {
    flattenRootPackage,
    isEndpoint,
    isWebSocket,
    ResolvedApiDefinition,
    ResolvedRootPackage,
} from "../util/resolver";
import {
    createFormStateKey,
    getInitialEndpointRequestFormStateWithExample,
    PlaygroundSelectionState,
    usePlaygroundHeight,
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

interface PlaygroundProps {
    navigation: SidebarNode[];
    enabled: boolean;
}

export const PlaygroundContextProvider: FC<PropsWithChildren<PlaygroundProps>> = ({
    children,
    navigation,
    enabled,
}) => {
    const [apis, setApis] = useAtom(APIS);
    const { domain, basePath, selectedSlug } = useNavigationContext();
    const [selectionState, setSelectionState] = useState<PlaygroundSelectionState | undefined>();

    const [isPlaygroundEnabled, setIsPlaygroundEnabled] = useState<boolean>(enabled);

    useEffect(() => {
        fetch(`${basePath != null ? `https://${domain}` : ""}/api/fern-docs/config/api-playground-enabled`, {
            headers: { "x-fern-host": domain },
        })
            .then((r) => r.json())
            .then(setIsPlaygroundEnabled)
            // eslint-disable-next-line no-console
            .catch(console.error);
    }, [basePath, domain]);

    const flattenedApis = useMemo(() => mapValues(apis, flattenRootPackage), [apis]);

    const [isPlaygroundOpen, setPlaygroundOpen] = useAtom(PLAYGROUND_OPEN_ATOM);
    const [playgroundHeight] = usePlaygroundHeight();
    const [globalFormState, setGlobalFormState] = useAtom(PLAYGROUND_FORM_STATE_ATOM);

    const expandPlayground = useCallback(() => {
        capturePosthogEvent("api_playground_opened");
        return setPlaygroundOpen(true);
    }, [setPlaygroundOpen]);
    const collapsePlayground = useCallback(() => setPlaygroundOpen(false), [setPlaygroundOpen]);

    const setSelectionStateAndOpen = useCallback(
        async (newSelectionState: PlaygroundSelectionState) => {
            let matchedPackage = flattenedApis[newSelectionState.api];
            if (matchedPackage == null) {
                const r = await fetch(
                    "/api/fern-docs/resolve-api?path=/" + selectedSlug + "&api=" + newSelectionState.api,
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
        [expandPlayground, flattenedApis, globalFormState, selectedSlug, setApis, setGlobalFormState],
    );

    if (!isPlaygroundEnabled) {
        return <>{children}</>;
    }

    return (
        <PlaygroundContext.Provider
            value={{
                hasPlayground: Object.keys(apis).length > 0,
                selectionState,
                setSelectionStateAndOpen,
                expandPlayground,
                collapsePlayground,
            }}
        >
            {children}
            <PlaygroundDrawer navigation={navigation} apis={flattenedApis} />
            {isPlaygroundOpen && <div style={{ height: playgroundHeight }} />}
        </PlaygroundContext.Provider>
    );
};

export function usePlaygroundContext(): PlaygroundContextValue {
    return useContext(PlaygroundContext);
}
