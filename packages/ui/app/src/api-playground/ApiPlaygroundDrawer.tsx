import { APIV1Read } from "@fern-api/fdr-sdk";
import {
    ResolvedApiDefinitionPackage,
    ResolvedEndpointDefinition,
    ResolvedNavigationItemApiSection,
} from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { Portal, Transition } from "@headlessui/react";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Dispatch, FC, SetStateAction, useCallback, useEffect } from "react";
import { capturePosthogEvent } from "../analytics/posthog";
import { ApiPlayground } from "./ApiPlayground";
import { PLAYGROUND_FORM_STATE_ATOM, PLAYGROUND_OPEN_ATOM, useApiPlaygroundContext } from "./ApiPlaygroundContext";
import { PlaygroundSecretsModal, SecretBearer } from "./PlaygroundSecretsModal";
import { PlaygroundRequestFormAuth, PlaygroundRequestFormState } from "./types";
import { useVerticalSplitPane, useWindowHeight } from "./useSplitPlane";
import { getDefaultValueForTypes, getDefaultValuesForBody } from "./utils";

export interface ApiPlaygroundSelectionState {
    apiSection: ResolvedNavigationItemApiSection;
    apiDefinition: ResolvedApiDefinitionPackage;
    endpoint: ResolvedEndpointDefinition;
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

interface ApiPlaygroundDrawerProps {
    apiSections: ResolvedNavigationItemApiSection[];
}

export const ApiPlaygroundDrawer: FC<ApiPlaygroundDrawerProps> = ({ apiSections }) => {
    const { selectionState, hasPlayground } = useApiPlaygroundContext();

    const [height, setHeight] = useAtom(playgroundHeightAtom);
    const windowHeight = useWindowHeight();

    const setOffset = useCallback(
        (offset: number) => {
            windowHeight != null && setHeight(Math.min(windowHeight - 60, windowHeight - offset));
        },
        [setHeight, windowHeight],
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
        [selectionState, setGlobalFormState],
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
        [setPlaygroundOpen],
    );
    const resetWithExample = useCallback(() => {
        if (selectionState == null) {
            return;
        }
        setPlaygroundFormState(
            getInitialModalFormStateWithExample(
                selectionState.apiSection.auth,
                selectionState.endpoint,
                selectionState.endpoint?.examples[0],
            ),
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
        [closeSecretsModal, setPlaygroundFormState],
    );

    if (!hasPlayground) {
        return null;
    }

    return (
        <Portal>
            <Transition
                show={isPlaygroundOpen}
                className="bg-background-translucent border-default max-h-vh-minus-header fixed inset-x-0 bottom-0 border-t backdrop-blur-xl"
                style={{ height }}
                enter="ease-out transition-transform duration-300 transform"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="ease-in transition-transform duration-200 transform"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
            >
                <div
                    className="group absolute inset-x-0 -top-0.5 h-0.5 cursor-row-resize after:absolute after:inset-x-0 after:-top-3 after:h-4 after:content-['']"
                    onMouseDown={handleVerticalResize}
                >
                    <div className="bg-accent absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100" />
                    <div className="relative -top-6 z-30 mx-auto w-fit p-4 pb-0">
                        <div className="bg-accent h-1 w-10 rounded-full" />
                    </div>
                </div>
                <ApiPlayground
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
            </Transition>
            <PlaygroundSecretsModal
                secrets={globalFormSecrets}
                setSecrets={setGlobalFormSecrets}
                isOpen={isSecretsModalOpen}
                onClose={closeSecretsModal}
                selectSecret={handleSelectSecret}
            />
        </Portal>
    );
};

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
