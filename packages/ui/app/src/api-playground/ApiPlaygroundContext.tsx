import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { mapValues, noop } from "lodash-es";
import dynamic from "next/dynamic";
import { createContext, FC, PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";
import { capturePosthogEvent } from "../analytics/posthog";
import { useDocsContext } from "../docs-context/useDocsContext";
import { APIS } from "../sidebar/atom";
import { SidebarNode } from "../sidebar/types";
import { flattenRootPackage, isEndpoint, ResolvedApiDefinition } from "../util/resolver";
import {
    ApiPlaygroundSelectionState,
    createFormStateKey,
    getInitialModalFormStateWithExample,
} from "./ApiPlaygroundDrawer";
import { PlaygroundRequestFormState } from "./types";

const ApiPlaygroundDrawer = dynamic(() => import("./ApiPlaygroundDrawer").then((m) => m.ApiPlaygroundDrawer), {
    ssr: false,
});

interface ApiPlaygroundContextValue {
    hasPlayground: boolean;
    selectionState: ApiPlaygroundSelectionState | undefined;
    setSelectionStateAndOpen: (state: ApiPlaygroundSelectionState) => void;
    expandApiPlayground: () => void;
    collapseApiPlayground: () => void;
}

const ApiPlaygroundContext = createContext<ApiPlaygroundContextValue>({
    hasPlayground: false,
    selectionState: undefined,
    setSelectionStateAndOpen: noop,
    expandApiPlayground: noop,
    collapseApiPlayground: noop,
});

export const PLAYGROUND_OPEN_ATOM = atomWithStorage<boolean>("api-playground-is-open", false);
export const PLAYGROUND_FORM_STATE_ATOM = atomWithStorage<Record<string, PlaygroundRequestFormState | undefined>>(
    "api-playground-selection-state-alpha",
    {},
);

interface ApiPlaygroundProps {
    navigation: SidebarNode[];
}

const CUSTOMERS = [
    "cloudflare",
    "assemblyai",
    "cohere",
    "shipbob",
    "hume",
    "flagright",
    "sayari",
    "webflow",
    "dapi",
    "astronomer",
    "trmlabs",
];

function isApiPlaygroundEnabled(domain: string) {
    domain = domain.toLowerCase();
    if (CUSTOMERS.some((customer) => domain.includes(customer))) {
        return true;
    }

    if (["docs.buildwithfern.com", "fern.docs.buildwithfern.com", "fern.docs.dev.buildwithfern.com"].includes(domain)) {
        return true;
    }

    return process.env.NODE_ENV !== "production";
}

export const ApiPlaygroundContextProvider: FC<PropsWithChildren<ApiPlaygroundProps>> = ({ children, navigation }) => {
    const [apis] = useAtom(APIS);
    const { domain } = useDocsContext();
    const [selectionState, setSelectionState] = useState<ApiPlaygroundSelectionState | undefined>();

    const flattenedApis = useMemo(() => mapValues(apis, flattenRootPackage), [apis]);

    const [, setPlaygroundOpen] = useAtom(PLAYGROUND_OPEN_ATOM);
    const [globalFormState, setGlobalFormState] = useAtom(PLAYGROUND_FORM_STATE_ATOM);

    const expandApiPlayground = useCallback(() => {
        capturePosthogEvent("api_playground_opened");
        return setPlaygroundOpen(true);
    }, [setPlaygroundOpen]);
    const collapseApiPlayground = useCallback(() => setPlaygroundOpen(false), [setPlaygroundOpen]);

    const setSelectionStateAndOpen = useCallback(
        (newSelectionState: ApiPlaygroundSelectionState) => {
            const matchedPackage = flattenedApis[newSelectionState.api];
            if (matchedPackage == null) {
                return;
            }

            const matchedEndpoint = matchedPackage.apiDefinitions.find(
                (definition) => isEndpoint(definition) && definition.slug.join("/") === newSelectionState.endpointId,
            ) as ResolvedApiDefinition.Endpoint | undefined;
            if (matchedEndpoint == null) {
                return;
            }
            setSelectionState(newSelectionState);
            expandApiPlayground();
            capturePosthogEvent("api_playground_opened", {
                endpointId: newSelectionState.endpointId,
                endpointName: matchedEndpoint.name,
            });
            if (globalFormState[createFormStateKey(newSelectionState)] == null) {
                setGlobalFormState((currentFormState) => {
                    return {
                        ...currentFormState,
                        [createFormStateKey(newSelectionState)]: getInitialModalFormStateWithExample(
                            matchedPackage.auth,
                            matchedEndpoint,
                            matchedEndpoint.examples[0],
                            matchedPackage.types,
                        ),
                    };
                });
            }
        },
        [expandApiPlayground, flattenedApis, globalFormState, setGlobalFormState],
    );

    if (!isApiPlaygroundEnabled(domain)) {
        return <>{children}</>;
    }

    return (
        <ApiPlaygroundContext.Provider
            value={{
                hasPlayground: Object.keys(apis).length > 0,
                selectionState,
                setSelectionStateAndOpen,
                expandApiPlayground,
                collapseApiPlayground,
            }}
        >
            {children}
            <ApiPlaygroundDrawer navigation={navigation} apis={flattenedApis} />
        </ApiPlaygroundContext.Provider>
    );
};

export function useApiPlaygroundContext(): ApiPlaygroundContextValue {
    return useContext(ApiPlaygroundContext);
}
