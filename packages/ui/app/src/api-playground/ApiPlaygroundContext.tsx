import { APIV1Read } from "@fern-api/fdr-sdk";
import {
    ResolvedApiDefinitionPackage,
    ResolvedEndpointDefinition,
    ResolvedNavigationItemApiSection,
} from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { noop } from "lodash-es";
import dynamic from "next/dynamic";
import { createContext, FC, PropsWithChildren, useCallback, useContext, useState } from "react";
import { capturePosthogEvent } from "../analytics/posthog";
import { useDocsContext } from "../docs-context/useDocsContext";
import { PlaygroundRequestFormAuth, PlaygroundRequestFormState } from "./types";
import { getDefaultValueForTypes, getDefaultValuesForBody } from "./utils";

const ApiPlayground = dynamic(() => import("../api-playground/ApiPlayground").then((m) => m.ApiPlayground), {
    ssr: false,
});

export interface ApiPlaygroundSelectionState {
    apiSection: ResolvedNavigationItemApiSection;
    apiDefinition: ResolvedApiDefinitionPackage;
    endpoint: ResolvedEndpointDefinition;
}

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
    apiSections: ResolvedNavigationItemApiSection[];
}

export const ApiPlaygroundContextProvider: FC<PropsWithChildren<ApiPlaygroundProps>> = ({ children, apiSections }) => {
    const { domain } = useDocsContext();
    const [selectionState, setSelectionState] = useState<ApiPlaygroundSelectionState | undefined>();

    const [, setPlaygroundOpen] = useAtom(PLAYGROUND_OPEN_ATOM);
    const [globalFormState, setGlobalFormState] = useAtom(PLAYGROUND_FORM_STATE_ATOM);

    const expandApiPlayground = useCallback(() => {
        capturePosthogEvent("api_playground_opened");
        return setPlaygroundOpen(true);
    }, [setPlaygroundOpen]);
    const collapseApiPlayground = useCallback(() => setPlaygroundOpen(false), [setPlaygroundOpen]);

    const setSelectionStateAndOpen = useCallback(
        (newSelectionState: ApiPlaygroundSelectionState) => {
            setSelectionState(newSelectionState);
            expandApiPlayground();
            capturePosthogEvent("api_playground_opened", {
                endpointId: newSelectionState.endpoint.id,
                endpointName: newSelectionState.endpoint.name,
            });
            if (globalFormState[createFormStateKey(newSelectionState)] == null) {
                setGlobalFormState((currentFormState) => {
                    return {
                        ...currentFormState,
                        [createFormStateKey(newSelectionState)]: getInitialModalFormStateWithExample(
                            selectionState?.apiSection.auth,
                            newSelectionState.endpoint,
                            newSelectionState.endpoint?.examples[0],
                        ),
                    };
                });
            }
        },
        [expandApiPlayground, globalFormState, selectionState?.apiSection.auth, setGlobalFormState],
    );

    if (
        !domain.toLowerCase().includes("cloudflare") &&
        !domain.toLowerCase().includes("cohere") &&
        !["docs.buildwithfern.com", "fern.docs.buildwithfern.com", "fern.docs.dev.buildwithfern.com"].includes(
            domain.toLowerCase(),
        )
    ) {
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
            <ApiPlayground apiSections={apiSections} />
        </ApiPlaygroundContext.Provider>
    );
};

export function useApiPlaygroundContext(): ApiPlaygroundContextValue {
    return useContext(ApiPlaygroundContext);
}

function getInitialModalFormState(
    auth: APIV1Read.ApiAuth | undefined,
    endpoint: ResolvedEndpointDefinition | undefined,
): PlaygroundRequestFormState {
    return {
        auth: getInitialAuthState(auth),
        headers: getDefaultValueForTypes(endpoint?.headers),
        pathParameters: getDefaultValueForTypes(endpoint?.pathParameters),
        queryParameters: getDefaultValueForTypes(endpoint?.queryParameters),
        body: getDefaultValuesForBody(endpoint?.requestBody?.shape),
    };
}

function getInitialAuthState(auth: APIV1Read.ApiAuth | undefined): PlaygroundRequestFormAuth | undefined {
    if (auth == null) {
        return undefined;
    }
    return visitDiscriminatedUnion(auth, "type")._visit<PlaygroundRequestFormAuth | undefined>({
        header: (header) => ({ type: "header", headers: { [header.headerWireValue]: "" } }),
        bearerAuth: () => ({ type: "bearerAuth", token: "" }),
        basicAuth: () => ({ type: "basicAuth", username: "", password: "" }),
        _other: () => undefined,
    });
}

function getInitialModalFormStateWithExample(
    auth: APIV1Read.ApiAuth | undefined,
    endpoint: ResolvedEndpointDefinition | undefined,
    exampleCall: APIV1Read.ExampleEndpointCall | undefined,
): PlaygroundRequestFormState {
    if (exampleCall == null) {
        return getInitialModalFormState(auth, endpoint);
    }
    return {
        auth: getInitialAuthState(auth),
        headers: exampleCall.headers,
        pathParameters: exampleCall.pathParameters,
        queryParameters: exampleCall.queryParameters,
        body: exampleCall.requestBody,
    };
}
function createFormStateKey({ apiDefinition, endpoint }: ApiPlaygroundSelectionState) {
    const packageId =
        apiDefinition.type === "apiSection" ? apiDefinition.api : `${apiDefinition.apiSectionId}/${apiDefinition.id}`;
    return `${packageId}/${endpoint.id}`;
}
