import { assertNever, isNonNullish } from "@fern-ui/core-utils";
import { joinUrlSlugs } from "@fern-ui/fdr-utils";
import { Loadable, failed, loaded, loading, notStartedLoading } from "@fern-ui/loadable";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { Dispatch, FC, ReactElement, SetStateAction, useCallback, useState } from "react";
import { resolve } from "url";
import { capturePosthogEvent } from "../analytics/posthog";
import { captureSentryError } from "../analytics/sentry";
import { FernTooltipProvider } from "../components/FernTooltip";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import {
    ResolvedEndpointDefinition,
    ResolvedFormDataRequestProperty,
    ResolvedHttpRequestBodyShape,
    ResolvedTypeDefinition,
} from "../resolver/types";
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
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundEndpointRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundEndpointRequestFormState>>;
    resetWithExample: () => void;
    resetWithoutExample: () => void;
    types: Record<string, ResolvedTypeDefinition>;
}

// interface ProxyResponseWithMetadata {
//     result: ProxyResponse;
//     time: number;
//     metadata: ProxyResponse.SerializableResponse;
// }

function executeProxy(req: ProxyRequest, basePath: string = ""): Promise<PlaygroundResponse> {
    // const startTime = performance.now();
    return fetch(resolve(basePath, "/api/fern-docs/proxy/rest"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
        mode: "no-cors",
    }).then(async (res): Promise<PlaygroundResponse> => {
        // const proxyTime = performance.now() - startTime;
        const proxyResponse = (await res.json()) as ProxyResponse;
        return { type: "json", ...proxyResponse, contentType: res.headers.get("Content-Type") ?? "application/json" };
    });
}

interface ResponseChunk {
    data: string;
    time: number;
}

function executeProxyStream(req: ProxyRequest, basePath: string = ""): Promise<[Response, Stream<ResponseChunk>]> {
    return fetch(resolve(basePath, "/api/fern-docs/proxy/stream"), {
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
                    data: d.data,
                    time: d.time,
                };
            },
            terminator: "\n",
        });
        return [response, stream];
    });
}

// interface FileDownloadResponse {
//     ok: boolean;
//     status: number;
//     statusText: string;
//     src: string;
//     contentType: string;
//     size?: number;
// }

async function executeFileDownload(req: ProxyRequest, basePath: string = ""): Promise<PlaygroundResponse> {
    const r = await fetch(resolve(basePath, "/api/fern-docs/proxy/file"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
        mode: "no-cors",
    });

    const contentType = r.headers.get("Content-Type") ?? "application/octet-stream";

    if (
        contentType.startsWith("text/") ||
        contentType.startsWith("application/json") ||
        contentType.startsWith("application/javascript") ||
        contentType.startsWith("application/xml")
    ) {
        let body = await r.text();
        try {
            body = JSON.parse(body);
        } catch (e) {
            // ignore
        }
        return {
            type: "json",
            time: 0,
            size: null,
            response: {
                headers: Object.fromEntries(r.headers.entries()),
                ok: r.ok,
                redirected: r.redirected,
                status: r.status,
                statusText: r.statusText,
                type: r.type,
                url: r.url,
                body,
            },
            contentType,
        };
    }

    const body = await r.blob().then((blob) => URL.createObjectURL(blob));
    const contentLength = r.headers.get("Content-Length");

    return {
        type: "file",
        response: {
            headers: Object.fromEntries(r.headers.entries()),
            ok: r.ok,
            redirected: r.redirected,
            status: r.status,
            statusText: r.statusText,
            type: r.type,
            url: r.url,
            body,
        },
        time: 0,
        size: contentLength ?? null,
        contentType,
    };
}

export const PlaygroundEndpoint: FC<PlaygroundEndpointProps> = ({
    endpoint,
    formState,
    setFormState,
    resetWithExample,
    resetWithoutExample,
    types,
}): ReactElement => {
    const { basePath, domain } = useDocsContext();
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
                headers: buildUnredactedHeaders(endpoint, formState),
<<<<<<< HEAD
                body: await serializeFormStateBody(endpoint.requestBody?.shape, formState.body, basePath),
=======
                body: await serializeFormStateBody(endpoint.requestBody[0]?.shape, formState.body, basePath, domain),
>>>>>>> main
            };
            if (endpoint.responseBody?.shape.type === "stream") {
                const [res, stream] = await executeProxyStream(req, basePath);
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
                const res = await executeFileDownload(req, basePath);
                setResponse(loaded(res));
            } else {
                const res = await executeProxy(req, basePath);
                setResponse(loaded(res));
                if (res.type !== "stream") {
                    capturePosthogEvent("api_playground_request_received", {
                        endpointId: endpoint.id,
                        endpointName: endpoint.name,
                        method: endpoint.method,
                        docsRoute: `/${joinUrlSlugs(...endpoint.slug)}`,
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
                    endpointName: endpoint.name,
                    method: endpoint.method,
                    route: `/${joinUrlSlugs(...endpoint.slug)}`,
                },
            });
        }
    }, [basePath, domain, endpoint, formState]);

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
    shape: ResolvedHttpRequestBodyShape | undefined,
    body: PlaygroundFormStateBody | undefined,
    basePath: string | undefined,
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
                            value: await serializeFile(value.value, basePath),
                        };
                        break;
                    case "fileArray":
                        formDataValue[key] = {
                            type: "fileArray",
                            value: (
                                await Promise.all(value.value.map((value) => serializeFile(value, basePath)))
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
                            contentType:
                                typeof property?.contentType === "string"
                                    ? property.contentType
                                    : Array.isArray(property?.contentType)
                                      ? property.contentType.find((value) => value.includes("json")) ??
                                        property.contentType[0]
                                      : undefined,
                        };
                        break;
                    }
                    default:
                        assertNever(value);
                }
            }
            // this is a hack to allow the API Playground to send JSON blobs in form data
            // revert this once we have a better solution
            const isJsonBlob = domain.includes("fileforge");
            return { type: "form-data", value: formDataValue, isJsonBlob };
        }
        case "octet-stream":
            return { type: "octet-stream", value: await serializeFile(body.value, basePath) };
        default:
            assertNever(body);
    }
}

async function blobToDataURL(file: File, basePath: string = "") {
    // vercel edge function has a maximum request size of 4.5MB, so we need to upload large files to S3
    // if blob is larger than 1MB, we will upload it to S3 and return the URL
    // TODO: we should probably measure that the _entire_ request is less than 4.5MB
    if (file.size > 1024 * 1024) {
        const response = await fetch(resolve(basePath, `/api/fern-docs/upload?file=${encodeURIComponent(file.name)}`), {
            method: "GET",
        });

        const { put, get } = (await response.json()) as { put: string; get: string };

        await fetch(put, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
        });

        return get;
    }

    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function serializeFile(
    file: File | undefined,
    basePath: string | undefined,
): Promise<SerializableFile | undefined> {
    if (file == null || !isFile(file)) {
        return undefined;
    }
    return {
        name: file.name,
        lastModified: file.lastModified,
        size: file.size,
        type: file.type,
        dataUrl: await blobToDataURL(file, basePath),
    };
}

function isFile(value: any): value is File {
    return value instanceof File;
}
