import { APIV1Read } from "@fern-api/fdr-sdk";
import { assertNever, isNonNullish } from "@fern-ui/core-utils";
import { failed, Loadable, loaded, loading, notStartedLoading } from "@fern-ui/loadable";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { Dispatch, FC, ReactElement, SetStateAction, useCallback, useState } from "react";
import { capturePosthogEvent } from "../analytics/posthog";
import { FernTooltipProvider } from "../components/FernTooltip";
import { ResolvedEndpointDefinition, ResolvedTypeDefinition } from "../util/resolver";
import { joinUrlSlugs } from "../util/slug";
import "./PlaygroundEndpoint.css";
import { PlaygroundEndpointContent } from "./PlaygroundEndpointContent";
import { PlaygroundEndpointPath } from "./PlaygroundEndpointPath";
import { Stream } from "./Stream";
import type {
    PlaygroundEndpointRequestFormState,
    PlaygroundFormStateBody,
    ProxyRequest,
    ProxyResponse,
    SerializableFile,
    SerializableFormDataEntryValue,
} from "./types";
import { PlaygroundResponse } from "./types/playgroundResponse";
import { buildEndpointUrl, buildUnredactedHeaders } from "./utils";

interface PlaygroundEndpointProps {
    auth: APIV1Read.ApiAuth | null | undefined;
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundEndpointRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundEndpointRequestFormState>>;
    resetWithExample: () => void;
    resetWithoutExample: () => void;
    types: Record<string, ResolvedTypeDefinition>;
}

interface ProxyResponseWithMetadata {
    result: ProxyResponse;
    time: number;
    metadata: ProxyResponse.SerializableResponse;
}

function executeProxy(req: ProxyRequest): Promise<ProxyResponseWithMetadata> {
    const startTime = performance.now();
    return fetch("/api/fern-docs/proxy", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
        mode: "no-cors",
    }).then(async (response): Promise<ProxyResponseWithMetadata> => {
        const proxyTime = performance.now() - startTime;
        return {
            result: await response.json(),
            time: proxyTime,
            metadata: {
                headers: Object.fromEntries(response.headers.entries()),
                ok: response.ok,
                redirected: response.redirected,
                status: response.status,
                statusText: response.statusText,
                type: response.type,
                url: response.url,
            },
        };
    });
}

interface ResponseChunk {
    data: unknown;
    time: number;
}

function executeProxyStream(req: ProxyRequest): Promise<[Response, Stream<ResponseChunk>]> {
    return fetch("/api/fern-docs/proxy/stream", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
        mode: "no-cors",
    }).then(async (response): Promise<[Response, Stream<ResponseChunk>]> => {
        if (response.body == null) {
            throw new Error("Response body is null");
        }
        const stream = new Stream<ResponseChunk>({
            stream: response.body,
            parse: async (i) => {
                const d = i as { data: string; time: number };
                return {
                    data: tryParse(d.data),
                    time: d.time,
                };
            },
            terminator: "\n",
        });
        return [response, stream];
    });
}

function tryParse(data: string): unknown {
    try {
        return JSON.parse(data);
    } catch {
        return data;
    }
}

export const PlaygroundEndpoint: FC<PlaygroundEndpointProps> = ({
    auth,
    endpoint,
    formState,
    setFormState,
    resetWithExample,
    resetWithoutExample,
    types,
}): ReactElement => {
    const [response, setResponse] = useState<Loadable<PlaygroundResponse>>(notStartedLoading());
    // const [, startTransition] = useTransition();

    const sendRequest = useCallback(async () => {
        if (endpoint == null) {
            return;
        }
        setResponse(loading());
        try {
            capturePosthogEvent("api_playground_request_sent", {
                endpointId: endpoint.id,
                endpointName: endpoint.name,
                method: endpoint.method,
                docsRoute: `/${joinUrlSlugs(...endpoint.slug)}`,
            });
            const req = {
                url: buildEndpointUrl(endpoint, formState),
                method: endpoint.method,
                headers: buildUnredactedHeaders(auth, endpoint, formState),
                body: await serializeFormStateBody(formState.body),
            };
            if (!endpoint.id.endsWith("_stream")) {
                const loadedResponse = await executeProxy(req);
                if (!loadedResponse.result.error) {
                    setResponse(loaded({ type: "json", ...loadedResponse.result }));
                    capturePosthogEvent("api_playground_request_received", {
                        endpointId: endpoint.id,
                        endpointName: endpoint.name,
                        method: endpoint.method,
                        docsRoute: `/${joinUrlSlugs(...endpoint.slug)}`,
                        response: {
                            status: loadedResponse.result.response.status,
                            statusText: loadedResponse.result.response.statusText,
                            time: loadedResponse.result.time,
                            size: loadedResponse.result.size,
                        },
                        proxy: {
                            ok: loadedResponse.metadata.ok,
                            status: loadedResponse.metadata.status,
                            statusText: loadedResponse.metadata.statusText,
                            type: loadedResponse.metadata.type,
                            time: loadedResponse.time,
                        },
                    });
                }
            } else {
                const [res, stream] = await executeProxyStream(req);
                for await (const item of stream) {
                    setResponse((lastValue) =>
                        loaded({
                            type: "stream",
                            response: {
                                status: res.status,
                                body:
                                    lastValue.type === "loaded" && lastValue.value.type === "stream"
                                        ? [...lastValue.value.response.body, item.data]
                                        : [item.data],
                            },
                            time: item.time,
                        }),
                    );
                }
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            setResponse(failed(e));
            capturePosthogEvent("api_playground_request_failed", {
                endpointId: endpoint.id,
                endpointName: endpoint.name,
                method: endpoint.method,
                docsRoute: `/${joinUrlSlugs(...endpoint.slug)}`,
            });
        }
    }, [auth, endpoint, formState]);

    return (
        <FernTooltipProvider>
            <div className="flex min-h-0 flex-1 shrink flex-col">
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
                        auth={auth}
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
    body: PlaygroundFormStateBody | undefined,
): Promise<ProxyRequest.SerializableBody | undefined> {
    if (body == null) {
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
                            value: await serializeFile(value.value),
                        };
                        break;
                    case "fileArray":
                        formDataValue[key] = {
                            type: "fileArray",
                            value: (await Promise.all(value.value.map(serializeFile))).filter(isNonNullish),
                        };
                        break;
                    case "json":
                        formDataValue[key] = value;
                        break;
                    default:
                        assertNever(value);
                }
            }
            return { type: "form-data", value: formDataValue };
        }
        case "octet-stream":
            return { type: "octet-stream", value: await serializeFile(body.value) };
        default:
            assertNever(body);
    }
}

function blobToDataURL(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function serializeFile(file: File | undefined): Promise<SerializableFile | undefined> {
    if (file == null) {
        return undefined;
    }
    return {
        name: file.name,
        lastModified: file.lastModified,
        size: file.size,
        type: file.type,
        dataUrl: await blobToDataURL(file),
    };
}
