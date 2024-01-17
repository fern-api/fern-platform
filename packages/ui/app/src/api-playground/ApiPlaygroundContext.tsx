import { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import { isSubpackage } from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { Transition } from "@headlessui/react";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { noop } from "lodash-es";
import {
    createContext,
    Dispatch,
    FC,
    Fragment,
    PropsWithChildren,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { ApiPlaygroundDrawer } from "./ApiPlaygroundDrawer";
import { PlaygroundSecretsModal, SecretBearer } from "./PlaygroundSecretsModal";
import { PlaygroundRequestFormAuth, PlaygroundRequestFormState } from "./types";
import { getDefaultValueForTypes, getDefaultValuesForBody } from "./utils";

export interface ApiPlaygroundSelectionState {
    apiId: DocsV1Read.ApiSection["api"];
    endpoint: APIV1Read.EndpointDefinition;
    package: APIV1Read.ApiDefinitionPackage;
    slug: string;
}

const EMPTY_FORM_STATE: PlaygroundRequestFormState = {
    auth: undefined,
    headers: {},
    pathParameters: {},
    queryParameters: {},
    body: undefined,
};

interface ApiPlaygroundContextValue {
    apiDefinition: APIV1Read.ApiDefinition | undefined;
    resolveTypeById: (typeId: APIV1Read.TypeId) => APIV1Read.TypeDefinition | undefined;
    selectionState: ApiPlaygroundSelectionState | undefined;
    setSelectionStateAndOpen: (state: ApiPlaygroundSelectionState) => void;
    isOpen: boolean;
    expandApiPlayground: () => void;
    collapseApiPlayground: () => void;
}

const ApiPlaygroundContext = createContext<ApiPlaygroundContextValue>({
    apiDefinition: undefined,
    resolveTypeById: () => undefined,
    selectionState: undefined,
    setSelectionStateAndOpen: noop,
    isOpen: false,
    expandApiPlayground: noop,
    collapseApiPlayground: noop,
});

const playgroundOpenAtom = atomWithStorage<boolean>("api-playground-is-open", false);
const playgroundHeightAtom = atomWithStorage<number>("api-playground-height", 400);
const playgroundFormStateAtom = atomWithStorage<Record<string, PlaygroundRequestFormState | undefined>>(
    "api-playground-selection-state-alpha",
    {}
);
const playgroundFormSecretsAtom = atomWithStorage<SecretBearer[]>("api-playground-secrets-alpha", []);

export const ApiPlaygroundContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const [selectionState, setSelectionState] = useState<ApiPlaygroundSelectionState | undefined>();
    const { resolveApi } = useDocsContext();
    const apiDefinition = selectionState != null ? resolveApi(selectionState.apiId) : undefined;

    const resolveTypeById = useCallback(
        (typeId: APIV1Read.TypeId): APIV1Read.TypeDefinition | undefined => {
            const type = apiDefinition?.types[typeId];
            if (type == null) {
                // eslint-disable-next-line no-console
                console.error("Type does not exist", typeId, "in apiDefinitionId", apiDefinition?.id);
            }
            return type;
        },
        [apiDefinition]
    );

    const [intermediateHeight, setHeight] = useAtom(playgroundHeightAtom);
    const [windowHeight, setWindowHeight] = useState<number | undefined>(undefined);

    const height = windowHeight != null ? Math.min(windowHeight - 64, intermediateHeight) : intermediateHeight;

    useEffect(() => {
        if (window == null) {
            return;
        }

        setWindowHeight(window.innerHeight);

        const handleResize = () => {
            setWindowHeight(window.innerHeight);
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const [isPlaygroundOpen, setPlaygroundOpen] = useAtom(playgroundOpenAtom);
    const [globalFormState, setGlobalFormState] = useAtom(playgroundFormStateAtom);
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

    const expandApiPlayground = useCallback(() => setPlaygroundOpen(true), [setPlaygroundOpen]);
    const collapseApiPlayground = useCallback(() => setPlaygroundOpen(false), [setPlaygroundOpen]);
    const togglePlayground = useCallback(() => setPlaygroundOpen((current) => !current), [setPlaygroundOpen]);
    const setSelectionStateAndOpen = useCallback(
        (newSelectionState: ApiPlaygroundSelectionState) => {
            setSelectionState(newSelectionState);
            expandApiPlayground();
            if (globalFormState[createFormStateKey(newSelectionState)] == null) {
                setGlobalFormState((currentFormState) => {
                    return {
                        ...currentFormState,
                        [createFormStateKey(newSelectionState)]: getInitialModalFormStateWithExample(
                            apiDefinition?.auth,
                            newSelectionState.endpoint,
                            resolveTypeById,
                            newSelectionState.endpoint?.examples[0]
                        ),
                    };
                });
            }
        },
        [apiDefinition?.auth, expandApiPlayground, globalFormState, resolveTypeById, setGlobalFormState]
    );
    const resetWithExample = useCallback(() => {
        if (selectionState == null) {
            return;
        }
        setPlaygroundFormState(
            getInitialModalFormStateWithExample(
                apiDefinition?.auth,
                selectionState.endpoint,
                resolveTypeById,
                selectionState.endpoint?.examples[0]
            )
        );
    }, [apiDefinition?.auth, resolveTypeById, selectionState, setPlaygroundFormState]);
    const resetWithoutExample = useCallback(() => {
        if (selectionState == null) {
            return;
        }
        setPlaygroundFormState(getInitialModalFormState(apiDefinition?.auth, selectionState.endpoint, resolveTypeById));
    }, [apiDefinition?.auth, resolveTypeById, selectionState, setPlaygroundFormState]);

    useEffect(() => {
        // if keyboard press "ctrl + `", open playground
        const togglePlaygroundHandler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === "`") {
                togglePlayground();
            }
        };
        document.addEventListener("keydown", togglePlaygroundHandler, false);
        return () => {
            document.removeEventListener("keydown", togglePlaygroundHandler, false);
        };
    }, [togglePlayground]);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            const handleMouseMove = (e: MouseEvent | TouchEvent) => {
                if (e instanceof MouseEvent) {
                    setHeight(Math.min(window.innerHeight - e.clientY, window.innerHeight - 64));
                }
            };
            const handleMouseUp = () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
            };
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        },
        [setHeight]
    );

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

    return (
        <ApiPlaygroundContext.Provider
            value={{
                apiDefinition,
                resolveTypeById,
                selectionState,
                setSelectionStateAndOpen,
                isOpen: isPlaygroundOpen,
                expandApiPlayground,
                collapseApiPlayground,
            }}
        >
            {children}
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
                            className="bg-accent-primary dark:bg-accent-primary-dark absolute inset-x-0 -top-1 h-1 cursor-row-resize opacity-0 transition-opacity hover:opacity-100"
                            onMouseDown={handleMouseDown}
                            draggable={true}
                        />
                        <ApiPlaygroundDrawer
                            endpoint={selectionState?.endpoint}
                            package={selectionState?.package}
                            formState={playgroundFormState}
                            setFormState={setPlaygroundFormState}
                            resetWithExample={resetWithExample}
                            resetWithoutExample={resetWithoutExample}
                            openSecretsModal={openSecretsModal}
                            secrets={globalFormSecrets}
                            slug={selectionState?.slug}
                            apiId={selectionState?.apiId}
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
        </ApiPlaygroundContext.Provider>
    );
};

export function useApiPlaygroundContext(): ApiPlaygroundContextValue {
    return useContext(ApiPlaygroundContext);
}

function getInitialModalFormState(
    auth: APIV1Read.ApiAuth | undefined,
    endpoint: APIV1Read.EndpointDefinition | undefined,
    resolveTypeById: (typeId: APIV1Read.TypeId) => APIV1Read.TypeDefinition | undefined
): PlaygroundRequestFormState {
    return {
        auth: getInitialAuthState(auth),
        headers: getDefaultValueForTypes(endpoint?.headers, resolveTypeById),
        pathParameters: getDefaultValueForTypes(endpoint?.path.pathParameters, resolveTypeById),
        queryParameters: getDefaultValueForTypes(endpoint?.queryParameters, resolveTypeById),
        body: getDefaultValuesForBody(endpoint?.request?.type, resolveTypeById),
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
    endpoint: APIV1Read.EndpointDefinition | undefined,
    resolveTypeById: (typeId: APIV1Read.TypeId) => APIV1Read.TypeDefinition | undefined,
    exampleCall: APIV1Read.ExampleEndpointCall | undefined
): PlaygroundRequestFormState {
    if (exampleCall == null) {
        return getInitialModalFormState(auth, endpoint, resolveTypeById);
    }
    return {
        auth: getInitialAuthState(auth),
        headers: exampleCall.headers,
        pathParameters: exampleCall.pathParameters,
        queryParameters: exampleCall.queryParameters,
        body: exampleCall.requestBody,
    };
}
function createFormStateKey(selectionState: ApiPlaygroundSelectionState) {
    if (isSubpackage(selectionState.package)) {
        return `${selectionState.apiId}/${selectionState.package.subpackageId}/${selectionState.endpoint.id}`;
    }
    return `${selectionState.apiId}/${selectionState.endpoint.id}`;
}
