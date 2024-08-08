import { EnvironmentId } from "@fern-api/fdr-sdk/navigation";
import { FernTooltipProvider } from "@fern-ui/components";
import { assertNever, isNonNullish } from "@fern-ui/core-utils";
import { Loadable, failed, loaded, loading, notStartedLoading } from "@fern-ui/loadable";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { compact, mapValues, once } from "lodash-es";
import { FC, ReactElement, useCallback, useState } from "react";
import urljoin from "url-join";
import { useCallbackOne } from "use-memo-one";
import { capturePosthogEvent } from "../analytics/posthog";
import { captureSentryError } from "../analytics/sentry";
import {
    PLAYGROUND_AUTH_STATE_ATOM,
    store,
    useBasePath,
    useDomain,
    useFeatureFlags,
    useNavigationNodes,
    usePlaygroundEndpointFormState,
    useResolvedPath,
} from "../atoms";
import { useSelectedEnvironmentId } from "../atoms/environment";
import {
    ResolvedEndpointDefinition,
    ResolvedFormDataRequestProperty,
    ResolvedHttpRequestBodyShape,
    ResolvedTypeDefinition,
    resolveEnvironment,
} from "../resolver/types";
import { PlaygroundEndpointContent } from "./PlaygroundEndpointContent";
import { PlaygroundEndpointPath } from "./PlaygroundEndpointPath";
import { blobToDataURL } from "./fetch-utils/blobToDataURL";
import { executeProxyFile } from "./fetch-utils/executeProxyFile";
import { executeProxyRest } from "./fetch-utils/executeProxyRest";
import { executeProxyStream } from "./fetch-utils/executeProxyStream";
import type { PlaygroundFormStateBody, ProxyRequest, SerializableFile, SerializableFormDataEntryValue } from "./types";
import { PlaygroundResponse } from "./types/playgroundResponse";
import {
    buildAuthHeaders,
    buildEndpointUrl,
    getInitialEndpointRequestFormState,
    getInitialEndpointRequestFormStateWithExample,
    unknownToString,
} from "./utils";

interface PlaygroundEndpointProps {
    endpoint: ResolvedEndpointDefinition;
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

export const PlaygroundEndpoint: FC<PlaygroundEndpointProps> = ({ endpoint, types }): ReactElement => {
    const [formState, setFormState] = usePlaygroundEndpointFormState(endpoint);

    const resetWithExample = useCallbackOne(() => {
        setFormState(getInitialEndpointRequestFormStateWithExample(endpoint, endpoint.examples[0], types));
    }, [endpoint, types]);

    const resetWithoutExample = useCallbackOne(() => {
        setFormState(getInitialEndpointRequestFormState(endpoint, types));
    }, []);

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
            const authHeaders = buildAuthHeaders(endpoint.auth, store.get(PLAYGROUND_AUTH_STATE_ATOM), {
                redacted: false,
            });
            const headers = {
                ...authHeaders,
                ...mapValues(formState.headers ?? {}, unknownToString),
            };

            if (endpoint.method !== "GET" && endpoint.requestBody?.contentType != null) {
                headers["Content-Type"] = endpoint.requestBody.contentType;
            }

            const req: ProxyRequest = {
                url: buildEndpointUrl(endpoint, formState),
                method: endpoint.method,
                headers,
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

    const selectedEnvironmentId = useSelectedEnvironmentId();

    let environmentFilters: EnvironmentId[] | undefined;
    const resolvedPath = useResolvedPath();
    const navigationNodes = useNavigationNodes();
    const slug = resolvedPath.slug;
    let cursor = navigationNodes.slugMap.get(slug);
    while (cursor && cursor.slug) {
        if (cursor && (cursor.type === "endpoint" || cursor.type === "webSocket" || cursor.type === "apiPackage")) {
            environmentFilters = cursor.playground?.allowedEnvironments;
            break;
        }
        const newSlug = slug.split("/");
        newSlug.pop();
        cursor = navigationNodes.slugMap.get(newSlug.join("/"));
    }

    return (
        <FernTooltipProvider>
            <div className="flex min-h-0 flex-1 shrink flex-col size-full">
                <div className="flex-0">
                    <PlaygroundEndpointPath
                        method={endpoint.method}
                        formState={formState}
                        sendRequest={sendRequest}
                        environment={resolveEnvironment(endpoint, selectedEnvironmentId)}
                        environmentFilters={environmentFilters}
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

                        // check if the json value is a string and performa a safe parse operation to check if the json is stringified
                        if (typeof value.value === "string") {
                            value.value = safeParse(value.value);
                        }

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

function safeParse(value: string): unknown {
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}
