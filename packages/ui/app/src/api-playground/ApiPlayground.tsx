import { APIV1Read } from "@fern-api/fdr-sdk";
import {
    ResolvedApiDefinitionPackage,
    ResolvedEndpointDefinition,
    ResolvedNavigationItemApiSection,
} from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { Transition } from "@headlessui/react";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Dispatch, FC, Fragment, SetStateAction, useCallback, useEffect } from "react";
import { capturePosthogEvent } from "../analytics/posthog";
import { useViewportContext } from "../viewport-context/useViewportContext";
import { PLAYGROUND_FORM_STATE_ATOM, PLAYGROUND_OPEN_ATOM, useApiPlaygroundContext } from "./ApiPlaygroundContext";
import { ApiPlaygroundDrawer } from "./ApiPlaygroundDrawer";
import { PlaygroundSecretsModal, SecretBearer } from "./PlaygroundSecretsModal";
import { PlaygroundRequestFormAuth, PlaygroundRequestFormState } from "./types";
import { useVerticalSplitPane } from "./useSplitPlane";
import { getDefaultValueForTypes, getDefaultValuesForBody } from "./utils";

export interface ApiPlaygroundSelectionState {
    apiSection: ResolvedNavigationItemApiSection;
    apiDefinition: ResolvedApiDefinitionPackage;
    endpoint: ResolvedEndpointDefinition;
    example: APIV1Read.ExampleEndpointCall;
}

const EMPTY_FORM_STATE: PlaygroundRequestFormState = {
    auth: undefined,
    headers: {},
    pathParameters: {},
    queryParameters: {},
    body: undefined,
};

const playgroundHeightAtom = atomWithStorage<number>("api-playground-height", 400);
const playgroundFormSecretsAtom = atomWithStorage<SecretBearer[]>("api-playground-secrets-alpha", []);

interface ApiPlaygroundProps {
    apiSections: ResolvedNavigationItemApiSection[];
}

export const ApiPlayground: FC<ApiPlaygroundProps> = ({ apiSections }) => {
    const { selectionState, hasPlayground } = useApiPlaygroundContext();

    const [intermediateHeight, setHeight] = useAtom(playgroundHeightAtom);
    const {
        viewportSize: { height: windowHeight },
    } = useViewportContext();

    const height =
        windowHeight != null ? Math.max(Math.min(windowHeight - 64, intermediateHeight), 100) : intermediateHeight;

    const setOffset = useCallback(
        (offset: number) => {
            windowHeight != null && setHeight(Math.min(windowHeight - 64, windowHeight - offset));
        },
        [setHeight, windowHeight]
    );

    const handleVerticalResize = useVerticalSplitPane(setOffset);

    const [isPlaygroundOpen, setPlaygroundOpen] = useAtom(PLAYGROUND_OPEN_ATOM);
    const [globalFormState, setGlobalFormState] = useAtom(PLAYGROUND_FORM_STATE_ATOM);
    const [globalFormSecrets, setGlobalFormSecrets] = useAtom(playgroundFormSecretsAtom);
    const {
        value: isSecretsModalOpen,
        setTrue: openSecretsModal,
        setFalse: closeSecretsModal,
    } = useBooleanState(false);

    const setPlaygroundFormState = useCallback<Dispatch<SetStateAction<PlaygroundRequestFormState>>>(
        (newFormState) => {
            if (selectionState == null) {
                return;
            }
            setGlobalFormState((currentFormState) => {
                return {
                    ...currentFormState,
                    [createFormStateKey(selectionState)]:
                        typeof newFormState === "function"
                            ? newFormState(currentFormState[createFormStateKey(selectionState)] ?? EMPTY_FORM_STATE)
                            : newFormState,
                };
            });
        },
        [selectionState, setGlobalFormState]
    );

    const playgroundFormState =
        selectionState != null
            ? globalFormState[createFormStateKey(selectionState)] ?? EMPTY_FORM_STATE
            : EMPTY_FORM_STATE;

    const togglePlayground = useCallback(
        (usingKeyboardShortcut: boolean) => {
            return setPlaygroundOpen((current) => {
                if (!current) {
                    capturePosthogEvent("api_playground_opened", { usingKeyboardShortcut });
                }
                return !current;
            });
        },
        [setPlaygroundOpen]
    );
    const resetWithExample = useCallback(() => {
        if (selectionState == null) {
            return;
        }
        setPlaygroundFormState(
            getInitialModalFormStateWithExample(
                selectionState.apiSection.auth,
                selectionState.endpoint,
                selectionState.endpoint?.examples[0]
            )
        );
    }, [selectionState, setPlaygroundFormState]);

    const resetWithoutExample = useCallback(() => {
        if (selectionState == null) {
            return;
        }
        setPlaygroundFormState(getInitialModalFormState(selectionState.apiSection.auth, selectionState.endpoint));
    }, [selectionState, setPlaygroundFormState]);

    useEffect(() => {
        // if keyboard press "ctrl + `", open playground
        const togglePlaygroundHandler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === "`") {
                togglePlayground(true);
            }
        };
        document.addEventListener("keydown", togglePlaygroundHandler, false);
        return () => {
            document.removeEventListener("keydown", togglePlaygroundHandler, false);
        };
    }, [togglePlayground]);

    const handleSelectSecret = useCallback(
        (secret: SecretBearer) => {
            closeSecretsModal();
            setPlaygroundFormState((currentFormState) => {
                if (currentFormState.auth?.type !== "bearerAuth") {
                    return currentFormState;
                }
                return {
                    ...currentFormState,
                    auth: {
                        ...currentFormState.auth,
                        token: secret.token,
                    },
                };
            });
        },
        [closeSecretsModal, setPlaygroundFormState]
    );

    if (!hasPlayground) {
        return null;
    }

    return (
        <>
            <Transition show={isPlaygroundOpen} as={Fragment}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out transition-all duration-300"
                    enterFrom="opacity-0 translate-y-full"
                    enterTo="opacity-100 translate-y-0"
                    leave="ease-in transition-all duration-200"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-full"
                >
                    <div
                        className="bg-background dark:bg-background-dark border-border-default-light dark:border-border-default-dark fixed inset-x-0 bottom-0 z-20 border-t"
                        style={{ height }}
                    >
                        <div
                            className="bg-accent-primary dark:bg-accent-primary-dark absolute inset-x-0 -top-1 h-1 cursor-row-resize opacity-0 transition-opacity hover:opacity-100 active:opacity-100"
                            onMouseDown={handleVerticalResize}
                        />
                        <ApiPlaygroundDrawer
                            navigationItems={apiSections}
                            auth={selectionState?.apiSection.auth}
                            apiDefinition={selectionState?.apiDefinition}
                            endpoint={selectionState?.endpoint}
                            formState={playgroundFormState}
                            setFormState={setPlaygroundFormState}
                            resetWithExample={resetWithExample}
                            resetWithoutExample={resetWithoutExample}
                            openSecretsModal={openSecretsModal}
                            secrets={globalFormSecrets}
                        />
                    </div>
                </Transition.Child>
            </Transition>
            <PlaygroundSecretsModal
                secrets={globalFormSecrets}
                setSecrets={setGlobalFormSecrets}
                isOpen={isSecretsModalOpen}
                onClose={closeSecretsModal}
                selectSecret={handleSelectSecret}
            />
        </>
    );
};

function getInitialModalFormState(
    auth: APIV1Read.ApiAuth | undefined,
    endpoint: ResolvedEndpointDefinition | undefined
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
    exampleCall: APIV1Read.ExampleEndpointCall | undefined
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
