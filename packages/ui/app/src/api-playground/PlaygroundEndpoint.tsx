import { FernTooltipProvider } from "@fern-ui/components";
import { assertNever, isNonNullish } from "@fern-ui/core-utils";
import { Loadable, failed, loaded, loading, notStartedLoading } from "@fern-ui/loadable";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { compact, once } from "lodash-es";
import { Dispatch, FC, ReactElement, SetStateAction, useCallback, useState } from "react";
import urljoin from "url-join";
import { capturePosthogEvent } from "../analytics/posthog";
import { captureSentryError } from "../analytics/sentry";
import { useFeatureFlags } from "../atoms/flags";
import { useBasePath, useDomain } from "../atoms/navigation";
import {
    ResolvedEndpointDefinition,
    ResolvedFormDataRequestProperty,
    ResolvedHttpRequestBodyShape,
    ResolvedTypeDefinition,
} from "../resolver/types";
import { PlaygroundEndpointContent } from "./PlaygroundEndpointContent";
import { PlaygroundEndpointPath } from "./PlaygroundEndpointPath";
import { blobToDataURL } from "./fetch-utils/blobToDataURL";
import { executeProxyFile } from "./fetch-utils/executeProxyFile";
import { executeProxyRest } from "./fetch-utils/executeProxyRest";
import { executeProxyStream } from "./fetch-utils/executeProxyStream";
import type {
    PlaygroundEndpointRequestFormState,
    PlaygroundFormStateBody,
    ProxyRequest,
    SerializableFile,
    SerializableFormDataEntryValue,
} from "./types";
import { PlaygroundResponse } from "./types/playgroundResponse";
import { buildEndpointUrl, buildUnredactedHeaders } from "./utils";

interface PlaygroundEndpointProps {
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundEndpointRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundEndpointRequestFormState>>;
    resetWithExample: () => void;
    resetWithoutExample: () => void;
    types: Record<string, ResolvedTypeDefinition>;
}

const APP_BUILDWITHFERN_COM = "app.buildwithfern.com";

const getAppBuildwithfernCom = once((): string => {
    if (process.env.NODE_ENV === "development") {
        return "http://localhost:3000";
    }

    // see: https://vercel.com/docs/projects/environment-variables/system-environment-variables#framework-environment-variables
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" || process.env.NEXT_PUBLIC_VERCEL_ENV === "development") {
        // this mimics the behavior of hitting app.buildwithfern.com in a preview environment
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL ?? APP_BUILDWITHFERN_COM}`;
    }

    return `https://${APP_BUILDWITHFERN_COM}`;
});

export const PlaygroundEndpoint: FC<PlaygroundEndpointProps> = ({
    endpoint,
    formState,
    setFormState,
    resetWithExample,
    resetWithoutExample,
    types,
}): ReactElement => {
    const domain = useDomain();
    const basePath = useBasePath();
    const { proxyShouldUseAppBuildwithfernCom } = useFeatureFlags();
    const [response, setResponse] = useState<Loadable<PlaygroundResponse>>(notStartedLoading());

    const proxyEnvironment = urljoin(
        proxyShouldUseAppBuildwithfernCom ? getAppBuildwithfernCom() : basePath ?? "",
        "/api/fern-docs/proxy",
    );
    const uploadEnvironment = urljoin(
        proxyShouldUseAppBuildwithfernCom ? getAppBuildwithfernCom() : basePath ?? "",
        "/api/fern-docs/upload",
    );

    const sendRequest = useCallback(async () => {
        if (endpoint == null) {
            return;
        }
        setResponse(loading());
        try {
            capturePosthogEvent("api_playground_request_sent", {
                endpointId: endpoint.id,
                endpointName: endpoint.title,
                method: endpoint.method,
                docsRoute: `/${endpoint.slug}`,
            });
            const req = {
                url: buildEndpointUrl(endpoint, formState),
                method: endpoint.method,
                headers: buildUnredactedHeaders(endpoint, formState),
                body: await serializeFormStateBody(
                    uploadEnvironment,
                    endpoint.requestBody?.shape,
                    formState.body,
                    domain,
                ),
            };
            if (endpoint.responseBody?.shape.type === "stream") {
                const [res, stream] = await executeProxyStream(proxyEnvironment, req);
                for await (const item of stream) {
                    setResponse((lastValue) =>
                        loaded({
                            type: "stream",
                            response: {
                                status: res.status,
                                body: (lastValue.type === "loaded" && lastValue.value.type === "stream"
                                    ? lastValue.value.response.body + item.data
                                    : item.data
                                ).replace("\r\n\r\n", "\n"),
                            },
                            time: item.time,
                        }),
                    );
                }
            } else if (endpoint.responseBody?.shape.type === "fileDownload") {
                const res = await executeProxyFile(proxyEnvironment, req);
                setResponse(loaded(res));
            } else {
                const res = await executeProxyRest(proxyEnvironment, req);
                setResponse(loaded(res));
                if (res.type !== "stream") {
                    capturePosthogEvent("api_playground_request_received", {
                        endpointId: endpoint.id,
                        endpointName: endpoint.title,
                        method: endpoint.method,
                        docsRoute: `/${endpoint.slug}`,
                        response: {
                            status: res.response.status,
                            statusText: res.response.statusText,
                            time: res.time,
                            size: res.size,
                        },
                    });
                }
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            setResponse(failed(e));

            captureSentryError(e, {
                context: "ApiPlayground",
                errorSource: "sendRequest",
                errorDescription:
                    "An unexpected error occurred while sending request to the proxy server. This is likely a bug, rather than a user error.",
                data: {
                    endpointId: endpoint.id,
                    endpointName: endpoint.title,
                    method: endpoint.method,
                    route: `/${endpoint.slug}`,
                },
            });
        }
    }, [domain, endpoint, formState, proxyEnvironment, uploadEnvironment]);

    return (
        <FernTooltipProvider>
            <div className="flex min-h-0 flex-1 shrink flex-col size-full">
                <div className="flex-0">
                    <PlaygroundEndpointPath
                        method={endpoint.method}
                        formState={formState}
                        sendRequest={sendRequest}
                        environment={endpoint.defaultEnvironment ?? endpoint.environments[0]}
                        path={endpoint.path}
                        queryParameters={endpoint.queryParameters}
                        sendRequestIcon={
                            <PaperPlaneIcon className="size-6 transition-transform group-hover:translate-x-0.5" />
                        }
                    />
                </div>
                <div className="flex min-h-0 flex-1 shrink">
                    <PlaygroundEndpointContent
                        endpoint={endpoint}
                        formState={formState}
                        setFormState={setFormState}
                        resetWithExample={resetWithExample}
                        resetWithoutExample={resetWithoutExample}
                        response={response}
                        sendRequest={sendRequest}
                        types={types}
                    />
                </div>
            </div>
        </FernTooltipProvider>
    );
};

async function serializeFormStateBody(
    environment: string,
    shape: ResolvedHttpRequestBodyShape | undefined,
    body: PlaygroundFormStateBody | undefined,
    domain: string,
): Promise<ProxyRequest.SerializableBody | undefined> {
    if (shape == null || body == null) {
        return undefined;
    }

    switch (body.type) {
        case "json":
            return { type: "json", value: body.value };
        case "form-data": {
            const formDataValue: Record<string, SerializableFormDataEntryValue> = {};
            for (const [key, value] of Object.entries(body.value)) {
                switch (value.type) {
                    case "file":
                        formDataValue[key] = {
                            type: "file",
                            value: await serializeFile(environment, value.value),
                        };
                        break;
                    case "fileArray":
                        formDataValue[key] = {
                            type: "fileArray",
                            value: (
                                await Promise.all(value.value.map((value) => serializeFile(environment, value)))
                            ).filter(isNonNullish),
                        };
                        break;
                    case "json": {
                        if (shape.type !== "formData") {
                            return undefined;
                        }
                        const property = shape.properties.find((p) => p.key === key && p.type === "bodyProperty") as
                            | ResolvedFormDataRequestProperty.BodyProperty
                            | undefined;
                        formDataValue[key] = {
                            ...value,
                            // this is a hack to allow the API Playground to send JSON blobs in form data
                            // revert this once we have a better solution
                            contentType:
                                compact(property?.contentType)[0] ??
                                (domain.includes("fileforge") ? "application/json" : undefined),
                        };
                        break;
                    }
                    default:
                        assertNever(value);
                }
            }
            return { type: "form-data", value: formDataValue };
        }
        case "octet-stream":
            return { type: "octet-stream", value: await serializeFile(environment, body.value) };
        default:
            assertNever(body);
    }
}

async function serializeFile(environment: string, file: File | undefined): Promise<SerializableFile | undefined> {
    if (file == null || !isFile(file)) {
        return undefined;
    }
    return {
        name: file.name,
        lastModified: file.lastModified,
        size: file.size,
        type: file.type,
        dataUrl: await blobToDataURL(environment, file),
    };
}

function isFile(value: any): value is File {
    return value instanceof File;
}
