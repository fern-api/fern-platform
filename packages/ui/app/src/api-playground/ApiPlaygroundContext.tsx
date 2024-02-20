import {
    flattenApiSection,
    isEndpoint,
    ResolvedApiDefinition,
    ResolvedNavigationItemApiSection,
} from "@fern-ui/app-utils";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { noop } from "lodash-es";
import dynamic from "next/dynamic";
import { createContext, FC, PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";
import { capturePosthogEvent } from "../analytics/posthog";
import { useDocsContext } from "../docs-context/useDocsContext";
import { SidebarNode } from "../sidebar/types";
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
    apiSections: ResolvedNavigationItemApiSection[];
}

const CUSTOMERS = ["cloudflare", "assemblyai", "cohere", "shipbob", "hume", "flagright", "sayari"];

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

export const ApiPlaygroundContextProvider: FC<PropsWithChildren<ApiPlaygroundProps>> = ({
    children,
    navigation,
    apiSections,
}) => {
    const { domain } = useDocsContext();
    const [selectionState, setSelectionState] = useState<ApiPlaygroundSelectionState | undefined>();

    const flattenedApiSections = useMemo(() => apiSections.map(flattenApiSection), [apiSections]);

    const [, setPlaygroundOpen] = useAtom(PLAYGROUND_OPEN_ATOM);
    const [globalFormState, setGlobalFormState] = useAtom(PLAYGROUND_FORM_STATE_ATOM);

    const expandApiPlayground = useCallback(() => {
        capturePosthogEvent("api_playground_opened");
        return setPlaygroundOpen(true);
    }, [setPlaygroundOpen]);
    const collapseApiPlayground = useCallback(() => setPlaygroundOpen(false), [setPlaygroundOpen]);

    const setSelectionStateAndOpen = useCallback(
        (newSelectionState: ApiPlaygroundSelectionState) => {
            const matchedSection = flattenedApiSections.find(
                (section) => section.apiSection.api === newSelectionState.api,
            );
            if (matchedSection == null) {
                return;
            }

            const matchedEndpoint = matchedSection.apiDefinitions.find(
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
                            matchedSection.apiSection.auth,
                            matchedEndpoint,
                            matchedEndpoint.examples[0],
                        ),
                    };
                });
            }
        },
        [expandApiPlayground, flattenedApiSections, globalFormState, setGlobalFormState],
    );

    if (!isApiPlaygroundEnabled(domain)) {
        return <>{children}</>;
    }

    return (
        <ApiPlaygroundContext.Provider
            value={{
                hasPlayground: apiSections.length > 0,
                selectionState,
                setSelectionStateAndOpen,
                expandApiPlayground,
                collapseApiPlayground,
            }}
        >
            {children}
            <ApiPlaygroundDrawer navigation={navigation} apiSections={flattenedApiSections} />
        </ApiPlaygroundContext.Provider>
    );
};

export function useApiPlaygroundContext(): ApiPlaygroundContextValue {
    return useContext(ApiPlaygroundContext);
}
