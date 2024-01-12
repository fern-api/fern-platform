import { Button } from "@blueprintjs/core";
import { Clipboard, Play } from "@blueprintjs/icons";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { isUndefined, omitBy } from "lodash-es";
import { Dispatch, FC, Fragment, ReactElement, SetStateAction, useCallback, useState } from "react";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { FernSyntaxHighlighter } from "../commons/CodeBlockSkeleton";
import { HttpMethodTag } from "../commons/HttpMethodTag";
import { FernModal } from "../components/FernModal";
import { ApiPlaygroundEndpointSelector } from "./ApiPlaygroundEndpointSelector";
import { PlaygroundEndpointForm } from "./PlaygroundEndpointForm";
import { PlaygroundRequestFormState } from "./types";
import {
    getDefaultValueForTypes,
    getDefaultValuesForBody,
    stringifyCurl,
    stringifyFetch,
    stringifyPythonRequests,
    unknownToString,
} from "./utils";

export interface ApiPlaygroundModalProps {
    endpoint: APIV1Read.EndpointDefinition;
    package: APIV1Read.ApiDefinitionPackage;
}

interface ApiPlaygroundModalState {
    endpoint: APIV1Read.EndpointDefinition;
    formState: PlaygroundRequestFormState;
}

function getInitialModalFormState(
    endpoint: APIV1Read.EndpointDefinition,
    resolveTypeById: (typeId: APIV1Read.TypeId) => APIV1Read.TypeDefinition | undefined
): PlaygroundRequestFormState {
    return {
        headers: getDefaultValueForTypes(endpoint.headers, resolveTypeById),
        pathParameters: getDefaultValueForTypes(endpoint.path.pathParameters, resolveTypeById),
        queryParameters: getDefaultValueForTypes(endpoint.queryParameters, resolveTypeById),
        body: getDefaultValuesForBody(endpoint.request?.type, resolveTypeById),
    };
}

function getInitialModalFormStateWithExample(
    endpoint: APIV1Read.EndpointDefinition,
    resolveTypeById: (typeId: APIV1Read.TypeId) => APIV1Read.TypeDefinition | undefined,
    exampleCall: APIV1Read.ExampleEndpointCall | undefined
): PlaygroundRequestFormState {
    if (exampleCall == null) {
        return getInitialModalFormState(endpoint, resolveTypeById);
    }
    return {
        headers: exampleCall.headers,
        pathParameters: exampleCall.pathParameters,
        queryParameters: exampleCall.queryParameters,
        body: exampleCall.requestBody,
    };
}

export const ApiPlaygroundModal: FC<ApiPlaygroundModalProps> = ({
    endpoint: parentEndpoint,
    package: package_,
}): ReactElement => {
    const { resolveTypeById } = useApiDefinitionContext();
    const [isOpen, setIsOpen] = useState(false);

    const [modalState, setModalState] = useState<ApiPlaygroundModalState>(() => {
        return {
            endpoint: parentEndpoint,
            formState: getInitialModalFormStateWithExample(parentEndpoint, resolveTypeById, parentEndpoint.examples[0]),
        };
    });
    const { endpoint, formState } = modalState;

    const setPlaygroundFormState = useCallback<Dispatch<SetStateAction<PlaygroundRequestFormState>>>((newFormState) => {
        setModalState((oldState) => ({
            ...oldState,
            formState: typeof newFormState === "function" ? newFormState(oldState.formState) : newFormState,
        }));
    }, []);

    function closeModal() {
        setIsOpen(false);
    }

    function openModal() {
        setIsOpen(true);
    }

    const [requestType, setRequestType] = useState<"curl" | "javascript" | "python">("curl");

    return (
        <>
            <button
                type="button"
                onClick={openModal}
                className="hover:bg-tag-primary ring-border-primary dark:ring-border-primary-dark flex gap-1 rounded-lg px-2 py-1 text-xs ring-1 hover:ring-2"
            >
                <span className="text-accent-primary dark:text-accent-primary-dark font-mono tracking-tight">Play</span>
                <Play className="text-accent-primary dark:text-accent-primary-dark -mr-1" />
            </button>

            <FernModal
                isOpen={isOpen}
                onClose={closeModal}
                className="divide-border-default-light dark:divide-border-default-dark w-[1280px] divide-y rounded-lg"
            >
                <div className="flex items-stretch justify-between gap-4 p-6">
                    <ApiPlaygroundEndpointSelector endpoint={endpoint} package={package_} />

                    <div className="flex items-center">
                        <a className="link mx-4 text-sm">Sign in to use your API keys</a>
                        <button className="dark:text-dark bg-accent-primary dark:bg-accent-primary-dark hover:bg-accent-primary/90 dark:hover:bg-accent-primary-dark/90 text-accent-primary-contrast dark:text-accent-primary-dark-contrast group flex items-center justify-center space-x-3 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                            <span className="whitespace-nowrap">Send request</span>
                            <div className="flex h-4 w-4 items-center">
                                <FontAwesomeIcon
                                    icon="paper-plane-top"
                                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                                />
                            </div>
                        </button>
                    </div>
                </div>

                <div className="flex justify-between px-6 py-1.5">
                    <div className="group flex flex-1 items-center gap-2">
                        <div className="flex items-baseline">
                            <HttpMethodTag className="-ml-2 mr-2" method={endpoint.method} />
                            <span className="font-mono text-xs">
                                <span className="t-muted">{endpoint.environments[0]?.baseUrl}</span>
                                {endpoint.path.parts.map((part, idx) => {
                                    const stateValue = unknownToString(formState.pathParameters[part.value]);
                                    return (
                                        <span
                                            key={idx}
                                            className={classNames({
                                                "bg-accent-highlight dark:bg-accent-highlight-dark text-accent-primary dark:text-accent-primary-dark px-1 rounded before:content-[':']":
                                                    part.type === "pathParameter" && stateValue.length === 0,
                                                "text-accent-primary dark:text-accent-primary-dark font-semibold":
                                                    part.type === "pathParameter" && stateValue.length > 0,
                                            })}
                                        >
                                            {stateValue.length > 0 ? encodeURI(stateValue) : part.value}
                                        </span>
                                    );
                                })}
                                {endpoint.queryParameters.length > 0 &&
                                    Object.keys(omitBy(formState.queryParameters, isUndefined)).length > 0 &&
                                    endpoint.queryParameters
                                        .filter((queryParameter) => {
                                            const stateValue = formState.queryParameters[queryParameter.key];
                                            if (stateValue == null && queryParameter.type.type === "optional") {
                                                return false;
                                            }
                                            return true;
                                        })
                                        .map((queryParameter, idx) => {
                                            const stateValue = unknownToString(
                                                formState.queryParameters[queryParameter.key]
                                            );
                                            return (
                                                <Fragment key={idx}>
                                                    <span>{idx === 0 ? "?" : "&"}</span>

                                                    <span>{queryParameter.key}</span>
                                                    <span>{"="}</span>
                                                    <span
                                                        className={
                                                            "text-accent-primary dark:text-accent-primary-dark font-semibold"
                                                        }
                                                    >
                                                        {encodeURI(stateValue)}
                                                    </span>
                                                </Fragment>
                                            );
                                        })}
                            </span>
                        </div>
                        <Button
                            icon={<Clipboard />}
                            small={true}
                            minimal={true}
                            className={"opacity-0 transition-opacity group-hover:opacity-100"}
                        />
                    </div>
                    {endpoint.request?.contentType && (
                        <div className="bg-tag-default-light dark:bg-tag-default-dark t-muted -mr-2 flex h-6 items-center rounded-lg px-2 text-sm">
                            {endpoint.request?.contentType}
                        </div>
                    )}
                </div>

                <div className="divide-border-default-light dark:divide-border-default-dark flex h-[600px] items-stretch divide-x">
                    <div className="shrink-1 flex min-w-0 flex-1 flex-col">
                        <div className="border-border-default-light dark:border-border-default-dark flex w-full items-center justify-between border-b px-4 py-2">
                            <span className="t-muted text-xs uppercase">Request Preview</span>
                            <div className="flex items-center gap-2 text-xs">
                                <button
                                    onClick={() =>
                                        setPlaygroundFormState(getInitialModalFormState(endpoint, resolveTypeById))
                                    }
                                >
                                    Clear form
                                </button>
                            </div>
                        </div>
                        <PlaygroundEndpointForm
                            endpoint={endpoint}
                            formState={formState}
                            setFormState={setPlaygroundFormState}
                        />
                    </div>
                    <div className="divide-border-default-light dark:divide-border-default-dark shrink-1 flex min-w-0 flex-1 flex-col divide-y">
                        <div className="shrink-1 flex min-h-0 flex-1 flex-col">
                            <div className="border-border-default-light dark:border-border-default-dark flex w-full items-center justify-between border-b px-4 py-2">
                                <span className="t-muted text-xs uppercase">Request Preview</span>
                                <div className="flex items-center gap-2 text-xs">
                                    <button onClick={() => setRequestType("curl")}>CURL</button>
                                    <button onClick={() => setRequestType("javascript")}>JavaScript</button>
                                    <button onClick={() => setRequestType("python")}>Python</button>
                                </div>
                            </div>
                            <div className="typography-font-code flex-1 overflow-auto">
                                <FernSyntaxHighlighter
                                    language={requestType === "curl" ? "shell" : requestType}
                                    customStyle={{ height: "100%" }}
                                >
                                    {requestType === "curl"
                                        ? stringifyCurl(endpoint, formState)
                                        : requestType === "javascript"
                                        ? stringifyFetch(endpoint, formState)
                                        : requestType === "python"
                                        ? stringifyPythonRequests(endpoint, formState)
                                        : ""}
                                </FernSyntaxHighlighter>
                            </div>
                        </div>
                        <div className="flex-0">
                            <div className="t-muted border-border-default-light dark:border-border-default-dark w-full px-4 py-2 text-xs uppercase">
                                Response
                            </div>
                        </div>
                    </div>
                </div>
            </FernModal>
        </>
    );
};
