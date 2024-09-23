import { unknownToString } from "@fern-api/fdr-sdk";
import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { APIV1Read, Snippets } from "@fern-api/fdr-sdk/client/types";
import { assertNever, isNonNullish, isPlainObject, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { decodeJwt } from "jose";
import { compact, mapValues } from "lodash-es";
import { resolveEnvironment } from "../resolver/types";
import { blobToDataURL } from "./fetch-utils/blobToDataURL";
import { executeProxyRest } from "./fetch-utils/executeProxyRest";
import {
    PlaygroundAuthState,
    PlaygroundEndpointRequestFormState,
    PlaygroundFormDataEntryValue,
    PlaygroundFormStateBody,
    PlaygroundRequestFormState,
    PlaygroundWebSocketRequestFormState,
    ProxyRequest,
    SerializableFile,
    SerializableFormDataEntryValue,
} from "./types";

export function castToRecord(value: unknown): Record<string, unknown> {
    if (!isPlainObject(value)) {
        return {};
    }
    return value;
}

export function buildQueryParams(queryParameters: Record<string, unknown> | undefined): string {
    if (queryParameters == null) {
        return "";
    }
    const queryParams = new URLSearchParams();
    Object.entries(queryParameters).forEach(([key, value]) => {
        if (value != null) {
            queryParams.set(key, unknownToString(value));
        }
    });
    return queryParams.size > 0 ? "?" + queryParams.toString() : "";
}

function buildPath(path: ApiDefinition.EndpointPathPart[], pathParameters?: Record<string, unknown>): string {
    return path
        .map((part) => {
            if (part.type === "pathParameter") {
                const stateValue = unknownToString(pathParameters?.[part.value]);
                return stateValue.length > 0 ? encodeURIComponent(stateValue) : ":" + part.value;
            }
            return part.value;
        })
        .join("");
}

export function buildRequestUrl(
    baseUrl: string = "",
    path: ApiDefinition.EndpointPathPart[] = [],
    pathParameters: Record<string, unknown> = {},
    queryParameters: Record<string, unknown> = {},
): string {
    return baseUrl + buildPath(path, pathParameters) + buildQueryParams(queryParameters);
}

export function buildEndpointUrl(
    endpoint: ApiDefinition.EndpointDefinition | undefined,
    formState: PlaygroundRequestFormState | undefined,
): string {
    return buildRequestUrl(
        endpoint && resolveEnvironment(endpoint)?.baseUrl,
        endpoint?.path,
        formState?.pathParameters,
        formState?.queryParameters,
    );
}

export function convertToCustomSnippetPayload(
    formState: PlaygroundEndpointRequestFormState,
): Snippets.CustomSnippetPayload {
    return {
        pathParameters: Object.entries(formState.pathParameters).map(([name, value]) => ({ name, value })),
        queryParameters: Object.entries(formState.queryParameters).map(([name, value]) => ({ name, value })),

        // should headers use obfuscateSecret?
        headers: Object.entries(formState.headers).map(([name, value]) => ({ name, value })),
        requestBody: formState.body?.value,
    };
}

export function obfuscateSecret(secret: string): string {
    if (secret.trimEnd().length === 0) {
        return secret;
    }
    if (secret.length < 28) {
        return secret.slice(0, 1) + "*".repeat(25) + secret.slice(-2);
    }
    return secret.slice(0, 12) + "...." + secret.slice(-12);
}

export function buildAuthHeaders(
    auth: APIV1Read.ApiAuth | undefined,
    authState: PlaygroundAuthState,
    { redacted }: { redacted: boolean },
    oAuthClientCredentialReferencedEndpointLoginFlowProps?: Omit<
        OAuthClientCredentialReferencedEndpointLoginFlowProps,
        "oAuthClientCredentialsReferencedEndpoint"
    >,
): Record<string, string> {
    const headers: Record<string, string> = {};

    if (auth != null) {
        visitDiscriminatedUnion(auth)._visit({
            bearerAuth: () => {
                let token = authState.bearerAuth?.token ?? "";
                if (redacted) {
                    token = obfuscateSecret(token);
                }
                headers["Authorization"] = `Bearer ${token}`;
            },
            header: (header) => {
                let value = authState.header?.headers[header.headerWireValue] ?? "";
                if (redacted) {
                    value = obfuscateSecret(value);
                }
                headers[header.headerWireValue] = header.prefix != null ? `${header.prefix} ${value}` : value;
            },
            basicAuth: () => {
                const username = authState.basicAuth?.username ?? "";
                let password = authState.basicAuth?.password ?? "";
                if (redacted) {
                    password = obfuscateSecret(password);
                }
                headers["Authorization"] = `Basic ${btoa(`${username}:${obfuscateSecret(password)}`)}`;
            },
            oAuth: (oAuth) => {
                visitDiscriminatedUnion(oAuth.value)._visit({
                    clientCredentials: (oAuthClientCredentials) => {
                        visitDiscriminatedUnion(oAuthClientCredentials.value)._visit({
                            referencedEndpoint: (oAuthClientCredentialsReferencedEndpoint) => {
                                const token =
                                    authState.oauth?.selectedInputMethod === "credentials"
                                        ? authState.oauth?.accessToken
                                        : authState.oauth?.userSuppliedAccessToken ?? "";

                                if (oAuthClientCredentialReferencedEndpointLoginFlowProps && token) {
                                    const {
                                        formState,
                                        endpoint,
                                        proxyEnvironment,
                                        setValue: setOAuthValue,
                                    } = oAuthClientCredentialReferencedEndpointLoginFlowProps;
                                    try {
                                        const payload = decodeJwt(token);
                                        if (payload.exp && new Date().getTime() > payload.exp) {
                                            oAuthClientCredentialReferencedEndpointLoginFlow({
                                                formState,
                                                endpoint,
                                                proxyEnvironment,
                                                oAuthClientCredentialsReferencedEndpoint,
                                                setValue: setOAuthValue,
                                                // eslint-disable-next-line @typescript-eslint/no-empty-function
                                            }).catch(() => {});
                                        }
                                    } catch {}
                                }

                                const tokenPrefix = authState.oauth?.tokenPrefix?.length
                                    ? authState.oauth.tokenPrefix
                                    : "Bearer";
                                if (redacted) {
                                    headers["Authorization"] = `${tokenPrefix} ${obfuscateSecret(token)}`;
                                } else {
                                    headers["Authorization"] = `${tokenPrefix} ${token}`;
                                }
                            },
                        });
                    },
                });
            },
        });
    }

    return headers;
}

export function getDefaultValueForObjectProperties(
    properties: ApiDefinition.ObjectProperty[] = [],
    types: Record<string, ApiDefinition.TypeDefinition>,
): Record<string, unknown> {
    return properties.reduce<Record<string, unknown>>((acc, property) => {
        const defaultValue = getDefaultValueForType(property.valueShape, types);
        if (defaultValue != null) {
            acc[property.key] = defaultValue;
        }
        return acc;
    }, {});
}

export function matchesTypeReference(
    shape: ApiDefinition.TypeShapeOrReference,
    value: unknown,
    types: Record<string, ApiDefinition.TypeDefinition>,
): boolean {
    const unwrapped = ApiDefinition.unwrapReference(shape, types);
    if (unwrapped.isOptional && value == null) {
        return true;
    }
    return visitDiscriminatedUnion(unwrapped.shape)._visit<boolean>({
        object: (object) => {
            if (!isPlainObject(value)) {
                return false;
            }
            const propertyMap = new Map<string, ApiDefinition.ObjectProperty>();
            ApiDefinition.dereferenceObjectProperties(object, types).forEach((property) =>
                propertyMap.set(property.key, property),
            );
            return Object.keys(value).every((key) => {
                const property = propertyMap.get(key);
                if (property == null) {
                    return false;
                }
                return matchesTypeReference(property.valueShape, value[key], types);
            });
        },
        discriminatedUnion: (discriminatedUnion) => {
            if (!isPlainObject(value)) {
                return false;
            }
            const discriminantValue = value[discriminatedUnion.discriminant];
            if (typeof discriminantValue !== "string") {
                return false;
            }

            return discriminatedUnion.variants.some((variant) => {
                if (variant.discriminantValue !== discriminantValue) {
                    return false;
                }

                const propertyMap = new Map<string, ApiDefinition.ObjectProperty>();
                ApiDefinition.dereferenceDiscriminatedUnionVariant(discriminatedUnion, variant, types).forEach(
                    (property) => propertyMap.set(property.key, property),
                );
                return Object.keys(value).every((key) => {
                    if (key === discriminatedUnion.discriminant) {
                        return true;
                    }
                    const property = propertyMap.get(key);
                    if (property == null) {
                        return false;
                    }
                    return matchesTypeReference(property.valueShape, value[key], types);
                });
            });
        },
        undiscriminatedUnion: (undiscriminatedUnion) =>
            undiscriminatedUnion.variants.some((variant) => matchesTypeReference(variant.shape, value, types)),
        enum: (enumType) => {
            if (typeof value !== "string") {
                return false;
            }
            return enumType.values.some((enumValue) => enumValue.value === value);
        },
        primitive: (primitive) =>
            visitDiscriminatedUnion(primitive.value, "type")._visit<boolean>({
                string: () => typeof value === "string",
                boolean: () => typeof value === "boolean",
                integer: () => typeof value === "number" && Number.isInteger(value),
                uint: () => typeof value === "number" && Number.isInteger(value) && value > 0,
                uint64: () => typeof value === "number" && Number.isInteger(value) && value > 0,
                double: () => typeof value === "number",
                long: () => typeof value === "number" && Number.isInteger(value),
                datetime: () => value instanceof Date,
                uuid: () => typeof value === "string",
                base64: () => typeof value === "string",
                date: () => value instanceof Date,
                bigInteger: () => typeof value === "string",
                _other: () => value == null,
            }),
        literal: (literal) => value === literal.value.value,
        list: (listType) =>
            Array.isArray(value) && value.every((item) => matchesTypeReference(listType.itemShape, item, types)),
        set: (setType) =>
            Array.isArray(value) && value.every((item) => matchesTypeReference(setType.itemShape, item, types)),
        map: (MapTypeContextProvider) =>
            isPlainObject(value) &&
            Object.keys(value).every((key) =>
                matchesTypeReference(MapTypeContextProvider.valueShape, value[key], types),
            ),
        unknown: () => value == null,
        _other: () => value == null,
    });
}

export function getDefaultValuesForBody(
    requestShape: ApiDefinition.HttpRequestBodyShape | undefined,
    types: Record<string, ApiDefinition.TypeDefinition>,
): PlaygroundFormStateBody | undefined {
    if (requestShape == null) {
        return undefined;
    }
    return visitApiDefinition.HttpRequestBodyShape<PlaygroundFormStateBody | undefined>(requestShape, {
        formData: () => ({ type: "form-data", value: {} }),
        bytes: () => ({ type: "octet-stream", value: undefined }),
        typeShape: (typeShape) => ({
            type: "json",
            value: getDefaultValueForType(typeShape, types),
        }),
    });
}

export function getDefaultValueForType(
    shape: ApiDefinition.TypeShapeOrReference,
    types: Record<string, ApiDefinition.TypeDefinition>,
): unknown {
    const unwrapped = ApiDefinition.unwrapReference(shape, types);
    if (unwrapped.defaultValue) {
        return unwrapped.defaultValue;
    }
    return visitDiscriminatedUnion(unwrapped.shape)._visit<unknown>({
        object: (object) =>
            getDefaultValueForObjectProperties(ApiDefinition.dereferenceObjectProperties(object, types), types),
        discriminatedUnion: (discriminatedUnion) => {
            const variant = discriminatedUnion.variants[0];

            if (variant == null) {
                return undefined;
            }

            return getDefaultValueForObjectProperties(
                ApiDefinition.dereferenceDiscriminatedUnionVariant(discriminatedUnion, variant, types),
                types,
            );
        },
        undiscriminatedUnion: (undiscriminatedUnion) => {
            const variant = undiscriminatedUnion.variants[0];
            if (variant == null) {
                return undefined;
            }
            return getDefaultValueForType(variant.shape, types);
        },
        // if enum.length === 1, select it, otherwise, we don't presume to select an incorrect enum.
        enum: (value) => (value.values.length === 1 ? value.values[0]?.value : null),
        primitive: (primitive) =>
            visitDiscriminatedUnion(primitive.value, "type")._visit<unknown>({
                string: () => "",
                boolean: () => false,
                integer: () => 0,
                uint: () => 0,
                uint64: () => 0,
                double: () => 0,
                long: () => 0,
                datetime: () => new Date().toISOString(),
                uuid: () => "",
                base64: () => "",
                date: () => new Date().toISOString(),
                bigInteger: () => "",
                _other: () => undefined,
            }),
        literal: (literal) => literal.value.value,
        list: () => [],
        set: () => [],
        map: () => ({}),
        unknown: () => undefined,
        _other: () => undefined,
    });
}

export function isExpandable(
    valueShape: ApiDefinition.TypeShape,
    currentValue: unknown,
    types: Record<string, ApiDefinition.TypeDefinition>,
): boolean {
    return visitDiscriminatedUnion(ApiDefinition.unwrapReference(valueShape, types).shape)._visit<boolean>({
        object: () => false,
        discriminatedUnion: () => false,
        undiscriminatedUnion: () => false,
        enum: () => false,
        list: () => Array.isArray(currentValue) && currentValue.length > 0,
        set: () => Array.isArray(currentValue) && currentValue.length > 0,
        map: () => isPlainObject(currentValue) && Object.keys(currentValue).length > 0,
        unknown: () => false,
        _other: () => false,
        primitive: () => false,
        literal: () => false,
    });
}

export function hasRequiredFields(
    bodyShape: ApiDefinition.HttpRequestBodyShape,
    types: Record<string, ApiDefinition.TypeDefinition>,
): boolean {
    return visitDiscriminatedUnion(bodyShape)._visit({
        formData: (formData) =>
            formData.fields.some((property) =>
                visitDiscriminatedUnion(property, "type")._visit<boolean>({
                    file: (file) => !file.isOptional,
                    fileArray: (fileArray) => !fileArray.isOptional,
                    bodyProperty: (bodyProperty) => hasRequiredFields(bodyProperty.valueShape, types),
                    _other: () => false,
                }),
            ) ?? true,
        bytes: (bytes) => !bytes.isOptional,
        object: (object) =>
            ApiDefinition.dereferenceObjectProperties(object, types).some((property) =>
                hasRequiredFields(property.valueShape, types),
            ),
        reference: (reference) => hasRequiredFields(reference.value.shape, types),
        // typeShape: (shape) =>
        //     visitDiscriminatedUnion(unwrapReference(shape, types), "type")._visit({
        //         primitive: () => true,
        //         literal: () => true,
        //         object: (object) =>
        //             dereferenceObjectProperties(object, types).some((property) =>
        //                 hasRequiredFields(property.valueShape, types),
        //             ),
        //         undiscriminatedUnion: () => true,
        //         discriminatedUnion: () => true,
        //         enum: () => true,
        //         optional: () => false,
        //         list: () => true,
        //         set: () => true,
        //         map: () => true,
        //         unknown: () => true,
        //         alias: (alias) => hasRequiredFields(alias.shape, types),
        //         _other: () => true,
        //     }),
    });
}

export function hasOptionalFields(
    bodyShape: ApiDefinition.HttpRequestBodyShape,
    types: Record<string, ApiDefinition.TypeDefinition>,
): boolean {
    return visitApiDefinition.HttpRequestBodyShape(bodyShape, {
        formData: (formData) =>
            formData.properties.some((property) =>
                visitDiscriminatedUnion(property, "type")._visit<boolean>({
                    file: (file) => file.isOptional,
                    fileArray: (fileArray) => fileArray.isOptional,
                    bodyProperty: (bodyProperty) => hasOptionalFields(bodyProperty.valueShape, types),
                    _other: () => false,
                }),
            ) ?? false,
        bytes: (bytes) => bytes.isOptional,
        typeShape: (shape) =>
            visitDiscriminatedUnion(unwrapReference(shape, types), "type")._visit({
                primitive: () => false,
                literal: () => false,
                object: (object) =>
                    dereferenceObjectProperties(object, types).some((property) =>
                        hasOptionalFields(property.valueShape, types),
                    ),
                undiscriminatedUnion: () => false,
                discriminatedUnion: () => false,
                enum: () => false,
                optional: () => true,
                list: () => false,
                set: () => false,
                map: () => false,
                unknown: () => false,
                alias: (alias) => hasOptionalFields(alias.shape, types),
                _other: () => false,
            }),
    });
}

export const ENUM_RADIO_BREAKPOINT = 5;

export function shouldRenderInline(
    shape: ApiDefinition.TypeShapeOrReference,
    types: Record<string, ApiDefinition.TypeDefinition>,
): boolean {
    const unwrapped = ApiDefinition.unwrapReference(shape, types);
    if (unwrapped.isOptional) {
        return false;
    }
    return visitDiscriminatedUnion(unwrapped.shape)._visit({
        primitive: () => true,
        literal: () => true,
        object: () => false,
        map: () => false,
        undiscriminatedUnion: () => false,
        discriminatedUnion: () => false,
        enum: (_enum) => true,
        list: () => false,
        set: () => false,
        unknown: () => false,
        _other: () => false,
    });
}
export { unknownToString };

export function getInitialEndpointRequestFormState(
    endpoint: ApiDefinition.EndpointDefinition | undefined,
    types: Record<string, ApiDefinition.TypeDefinition>,
): PlaygroundEndpointRequestFormState {
    return {
        type: "endpoint",
        headers: getDefaultValueForObjectProperties(endpoint?.requestHeaders, types),
        pathParameters: getDefaultValueForObjectProperties(endpoint?.pathParameters, types),
        queryParameters: getDefaultValueForObjectProperties(endpoint?.queryParameters, types),
        body: getDefaultValuesForBody(endpoint?.request?.body, types),
    };
}

export function getInitialWebSocketRequestFormState(
    webSocket: ApiDefinition.WebSocketChannel | undefined,
    types: Record<string, ApiDefinition.TypeDefinition>,
): PlaygroundWebSocketRequestFormState {
    return {
        type: "websocket",
        headers: getDefaultValueForObjectProperties(webSocket?.requestHeaders, types),
        pathParameters: getDefaultValueForObjectProperties(webSocket?.pathParameters, types),
        queryParameters: getDefaultValueForObjectProperties(webSocket?.queryParameters, types),
        messages: Object.fromEntries(
            webSocket?.messages
                .filter((message) => message.origin === "client")
                .map((message) => [message.type, getDefaultValueForType(message.body, types)]) ?? [],
        ),
    };
}

export function getInitialEndpointRequestFormStateWithExample(
    endpoint: ApiDefinition.EndpointDefinition | undefined,
    exampleCall: ApiDefinition.ExampleEndpointCall | undefined,
    types: Record<string, ApiDefinition.TypeDefinition>,
): PlaygroundEndpointRequestFormState {
    if (exampleCall == null) {
        return getInitialEndpointRequestFormState(endpoint, types);
    }
    return {
        type: "endpoint",
        headers: exampleCall.headers,
        pathParameters: exampleCall.pathParameters,
        queryParameters: exampleCall.queryParameters,
        body:
            exampleCall.requestBody?.type === "form"
                ? {
                      type: "form-data",
                      value: mapValues(
                          exampleCall.requestBody.value,
                          (exampleValue): PlaygroundFormDataEntryValue =>
                              exampleValue.type === "filename" || exampleValue.type === "filenameWithData"
                                  ? { type: "file", value: undefined }
                                  : exampleValue.type === "filenames" || exampleValue.type === "filenamesWithData"
                                    ? { type: "fileArray", value: [] }
                                    : { type: "json", value: exampleValue.value },
                      ),
                  }
                : exampleCall.requestBody?.type === "bytes"
                  ? {
                        type: "octet-stream",
                        value: undefined,
                    }
                  : { type: "json", value: exampleCall.requestBody?.value },
    };
}

export interface OAuthClientCredentialReferencedEndpointLoginFlowProps {
    formState: PlaygroundEndpointRequestFormState;
    endpoint: ApiDefinition.EndpointDefinition;
    proxyEnvironment: string;
    oAuthClientCredentialsReferencedEndpoint: APIV1Read.OAuthClientCredentialsReferencedEndpoint;
    setValue: (value: (prev: any) => any) => void;
    closeContainer?: () => void;
    setDisplayFailedLogin?: (value: boolean) => void;
}

export const oAuthClientCredentialReferencedEndpointLoginFlow = async ({
    formState,
    endpoint,
    proxyEnvironment,
    oAuthClientCredentialsReferencedEndpoint,
    setValue,
    closeContainer,
    setDisplayFailedLogin,
}: OAuthClientCredentialReferencedEndpointLoginFlowProps): Promise<void> => {
    if (typeof window === "undefined") {
        return;
    }

    const headers: Record<string, string> = {
        ...mapValues(formState.headers ?? {}, unknownToString),
    };

    if (endpoint.method !== "GET" && endpoint.request?.contentType != null) {
        headers["Content-Type"] = endpoint.request.contentType;
    }

    const req: ProxyRequest = {
        url: buildEndpointUrl(endpoint, formState),
        method: endpoint.method,
        headers,
        body: await serializeFormStateBody("", endpoint.request?.body, formState.body, false),
    };
    const res = await executeProxyRest(proxyEnvironment, req);

    await visitDiscriminatedUnion(res, "type")._visit<void | Promise<void>>({
        json: async (jsonRes) => {
            if (jsonRes.response.ok) {
                try {
                    const jsonpath = await import("jsonpath");
                    const accessToken = jsonpath.query(
                        jsonRes.response,
                        oAuthClientCredentialsReferencedEndpoint.accessTokenLocator,
                    )?.[0];
                    setValue((prev) => ({
                        ...prev,
                        selectedInputMethod: "credentials",
                        accessToken,
                        isLoggedIn: true,
                        loggedInStartingToken: accessToken,
                    }));
                    setTimeout(() => closeContainer && closeContainer(), 500);
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error(e);
                    closeContainer && closeContainer();
                }
            } else {
                setDisplayFailedLogin && setDisplayFailedLogin(true);
            }
        },
        file: () => {
            setDisplayFailedLogin && setDisplayFailedLogin(true);
        },
        stream: () => {
            setDisplayFailedLogin && setDisplayFailedLogin(true);
        },
        _other: () => {
            setDisplayFailedLogin && setDisplayFailedLogin(true);
        },
    });
};

export async function serializeFormStateBody(
    environment: string,
    shape: ApiDefinition.HttpRequestBodyShape | undefined,
    body: PlaygroundFormStateBody | undefined,
    usesApplicationJsonInFormDataValue: boolean,
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
                        const property = shape.fields.find(
                            (p): p is ApiDefinition.FormDataField.Property => p.key === key && p.type === "property",
                        );

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
                                (usesApplicationJsonInFormDataValue ? "application/json" : undefined),
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
