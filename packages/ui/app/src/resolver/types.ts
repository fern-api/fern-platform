import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk/client/types";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { assertNever } from "@fern-api/ui-core-utils";
import { sortBy } from "lodash-es";
import { UnreachableCaseError } from "ts-essentials";
import { parse } from "url";
import { store } from "../atoms";
import { SELECTED_ENVIRONMENT_ATOM } from "../atoms/environment";

type WithoutQuestionMarks<T> = {
    [K in keyof Required<T>]: undefined extends T[K] ? T[K] | undefined : T[K];
};

export type WithDescription = { description: FernDocs.MarkdownText | undefined };
export type WithAvailability = { availability: APIV1Read.Availability | undefined };

/**
 * @deprecated
 */
export interface WithMetadata {
    description: FernDocs.MarkdownText | undefined;
    availability: APIV1Read.Availability | undefined;
}

/**
 * @deprecated
 */
export interface WithEndpointMetadata extends WithMetadata {
    title: string;
    nodeId: FernNavigation.NodeId;
    breadcrumb: readonly FernNavigation.BreadcrumbItem[];
    apiDefinitionId: FdrAPI.ApiDefinitionId;
    slug: FernNavigation.Slug;
}

/**
 * @deprecated
 */
export function dereferenceObjectProperties(
    object: ResolvedObjectShape | ResolvedDiscriminatedUnionShapeVariant,
    types: Record<string, ResolvedTypeDefinition>,
): ResolvedObjectProperty[] {
    const directProperties = object.properties;
    const extendedProperties = object.extends.flatMap((typeId) => {
        const referencedShape = types[typeId] ?? {
            type: "unknown",
            availability: undefined,
            description: undefined,
        };
        const shape = unwrapReference(referencedShape, types);
        // TODO: should we be able to extend discriminated and undiscriminated unions?
        if (shape?.type !== "object") {
            // eslint-disable-next-line no-console
            console.error("Object extends non-object", typeId);
            return [];
        }
        return dereferenceObjectProperties(shape, types);
    });
    if (extendedProperties.length === 0) {
        // if there are no extended properties, we can just return the direct properties
        // required properties should come before optional properties
        // however, we do NOT sort the properties by key because the initial order of properties may be significant
        return sortBy(
            [...directProperties],
            (property) => unwrapAlias(property.valueShape, types).type === "optional",
            (property) => (property.availability === "Deprecated" ? 2 : property.availability === "Beta" ? 1 : 0),
        );
    }
    const propertyKeys = new Set(object.properties.map((property) => property.key));
    const filteredExtendedProperties = extendedProperties.filter(
        (extendedProperty) => !propertyKeys.has(extendedProperty.key),
    );

    // required properties should come before optional properties
    // since there are extended properties, the initial order of properties are not significant, and we should sort by key
    return sortBy(
        [...directProperties, ...filteredExtendedProperties],
        (property) => unwrapAlias(property.valueShape, types).type === "optional",
        (property) => (property.availability === "Deprecated" ? 2 : property.availability === "Beta" ? 1 : 0),
        (property) => property.key,
    );
}

// export type ResolvedNavigationItem =
//     | ResolvedNavigationItemPageGroup
//     | ResolvedNavigationItemApiSection
//     | ResolvedNavigationItemSection;

// export interface ResolvedNavigationItemPageGroup {
//     type: "pageGroup";
//     pages: ResolvedPageMetadata[];
// }

/**
 * @deprecated
 */
export interface ResolvedPageMetadata {
    id: DocsV1Read.PageId;
    slug: FernNavigation.Slug;
    title: string;
    markdown: FernDocs.MarkdownText;
}

/**
 * @deprecated
 */
export interface ResolvedNavigationItemApiSection
    extends WithoutQuestionMarks<Omit<DocsV1Read.ApiSection, "urlSlug" | "artifacts">>,
        ResolvedWithApiDefinition {
    type: "apiSection";
    auth: APIV1Read.ApiAuth | undefined;
    hasMultipleBaseUrls: boolean | undefined;
    slug: FernNavigation.Slug;
    types: Record<string, ResolvedTypeDefinition>;
    artifacts: DocsV1Read.ApiArtifacts | undefined;
}

/**
 * @deprecated
 */
export interface FlattenedRootPackage {
    auth: APIV1Read.ApiAuth | undefined;
    types: Record<string, ResolvedTypeDefinition>;
    endpoints: ResolvedApiEndpointWithPackage[];
}

/**
 * @deprecated
 */
export function flattenRootPackage(rootPackage: ResolvedRootPackage): FlattenedRootPackage {
    function getApiEndpoints(apiPackage: ResolvedApiDefinitionPackage): ResolvedApiEndpointWithPackage[] {
        return apiPackage.items.flatMap((item) => {
            if (item.type === "subpackage") {
                return getApiEndpoints(item);
            }
            if (item.type === "page") {
                return [];
            }
            if (item.type === "endpoint" && item.stream != null) {
                return [
                    { ...item, package: apiPackage },
                    { ...item.stream, package: apiPackage },
                ];
            }
            return [{ ...item, package: apiPackage }];
        });
    }

    return {
        auth: rootPackage.auth,
        types: rootPackage.types,
        endpoints: getApiEndpoints(rootPackage),
    };
}

/**
 * @deprecated
 */
export interface ResolvedWithApiDefinition {
    items: ResolvedPackageItem[];
    slug: FernNavigation.Slug;
}

/**
 * @deprecated
 */
export interface ResolvedApiPageMetadata extends ResolvedPageMetadata {
    type: "page";
}

/**
 * @deprecated
 */
export type ResolvedPackageItem =
    | ResolvedApiPageMetadata
    | ResolvedEndpointDefinition
    | ResolvedWebhookDefinition
    | ResolvedWebSocketChannel
    | ResolvedSubpackage;

/**
 * @deprecated
 */
interface ResolvedPackageItemVisitor<T> {
    page(item: ResolvedPageMetadata): T;
    endpoint(item: ResolvedEndpointDefinition): T;
    webhook(item: ResolvedWebhookDefinition): T;
    websocket(item: ResolvedWebSocketChannel): T;
    subpackage(item: ResolvedSubpackage): T;
}

/**
 * @deprecated
 */
export const ResolvedPackageItem = {
    visit: <T>(item: ResolvedPackageItem, visitor: ResolvedPackageItemVisitor<T>): T => {
        switch (item.type) {
            case "endpoint":
                return visitor.endpoint(item);
            case "webhook":
                return visitor.webhook(item);
            case "websocket":
                return visitor.websocket(item);
            case "subpackage":
                return visitor.subpackage(item);
            case "page":
                return visitor.page(item);
            default:
                assertNever(item);
        }
    },
};

/**
 * @deprecated
 */
export type ResolvedApiEndpointWithPackage =
    | ResolvedApiEndpointWithPackage.Endpoint
    | ResolvedApiEndpointWithPackage.Webhook
    | ResolvedApiEndpointWithPackage.WebSocket;

/**
 * @deprecated
 */
export type ResolvedApiEndpoint = ResolvedEndpointDefinition | ResolvedWebhookDefinition | ResolvedWebSocketChannel;

/**
 * @deprecated
 */
export declare namespace ResolvedApiEndpointWithPackage {
    export interface Endpoint extends ResolvedEndpointDefinition {
        package: ResolvedApiDefinitionPackage;
    }

    export interface Webhook extends ResolvedWebhookDefinition {
        package: ResolvedApiDefinitionPackage;
    }

    export interface WebSocket extends ResolvedWebSocketChannel {
        package: ResolvedApiDefinitionPackage;
    }
}

/**
 * @deprecated
 */
export function isEndpoint(
    definition: ResolvedApiEndpointWithPackage,
): definition is ResolvedApiEndpointWithPackage.Endpoint {
    return definition.type === "endpoint";
}

/**
 * @deprecated
 */
export function isWebhook(
    definition: ResolvedApiEndpointWithPackage,
): definition is ResolvedApiEndpointWithPackage.Webhook {
    return definition.type === "webhook";
}

/**
 * @deprecated
 */
export function isWebSocket(
    definition: ResolvedApiEndpointWithPackage,
): definition is ResolvedApiEndpointWithPackage.WebSocket {
    return definition.type === "websocket";
}

/**
 * @deprecated
 */
interface ResolvedApiEndpointWithPackageVisitor<T> {
    endpoint(definition: ResolvedApiEndpointWithPackage.Endpoint): T;
    webhook(definition: ResolvedApiEndpointWithPackage.Webhook): T;
    websocket(definition: ResolvedApiEndpointWithPackage.WebSocket): T;
}

/**
 * @deprecated
 */
export const ResolvedApiEndpointWithPackage = {
    visit: <T>(definition: ResolvedApiEndpointWithPackage, visitor: ResolvedApiEndpointWithPackageVisitor<T>): T => {
        switch (definition.type) {
            case "endpoint":
                return visitor.endpoint(definition);
            case "webhook":
                return visitor.webhook(definition);
            case "websocket":
                return visitor.websocket(definition);
            default:
                throw new UnreachableCaseError(definition);
        }
    },
};

/**
 * @deprecated
 */
export interface ResolvedSubpackage extends WithMetadata, ResolvedWithApiDefinition {
    type: "subpackage";
    // apiDefinitionId: FdrAPI.ApiDefinitionId;
    // id: APIV1Read.SubpackageId;
    // name: string;
    title: string;
}

/**
 * @deprecated
 */
export function isResolvedSubpackage(item: ResolvedWithApiDefinition): item is ResolvedSubpackage {
    return (item as ResolvedSubpackage).type === "subpackage";
}

/**
 * @deprecated
 */
export interface ResolvedRootPackage extends ResolvedWithApiDefinition {
    type: "rootPackage";
    api: FdrAPI.ApiDefinitionId;
    auth: APIV1Read.ApiAuth | undefined;
    types: Record<string, ResolvedTypeDefinition>;
}

/**
 * @deprecated
 */
export type ResolvedApiDefinitionPackage = ResolvedRootPackage | ResolvedSubpackage;

/**
 * @deprecated
 */
export interface ResolvedEndpointDefinition extends WithEndpointMetadata {
    type: "endpoint";
    id: APIV1Read.EndpointId;
    auth: APIV1Read.ApiAuth | undefined;
    defaultEnvironment: APIV1Read.Environment | undefined;
    environments: APIV1Read.Environment[];
    method: APIV1Read.HttpMethod;
    title: string;
    path: ResolvedEndpointPathParts[];
    pathParameters: ResolvedObjectProperty[];
    queryParameters: ResolvedObjectProperty[];
    headers: ResolvedObjectProperty[];
    requestBody: ResolvedRequestBody | undefined;
    responseBody: ResolvedResponseBody | undefined;
    errors: ResolvedError[];
    examples: ResolvedExampleEndpointCall[];
    snippetTemplates: APIV1Read.EndpointSnippetTemplates | undefined;
    stream: ResolvedEndpointDefinition | undefined;
}

/**
 * @deprecated
 */
export interface ResolvedExampleEndpointCall {
    name: string | undefined;
    description: string | undefined;
    path: string;
    pathParameters: Record<string, unknown>;
    queryParameters: Record<string, unknown>;
    headers: Record<string, unknown>;
    requestBody: ResolvedExampleEndpointRequest | undefined;
    responseStatusCode: number;
    responseBody: ResolvedExampleEndpointResponse | undefined;
    // responseHast: Root | undefined;
    snippets: ResolvedCodeSnippet[];
}

/**
 * @deprecated
 */
export type ResolvedExampleEndpointRequest =
    | ResolvedExampleEndpointRequest.Json
    | ResolvedExampleEndpointRequest.Form
    | ResolvedExampleEndpointRequest.Bytes;

/**
 * @deprecated
 */
export declare namespace ResolvedExampleEndpointRequest {
    interface Json {
        type: "json";
        value: unknown | undefined;
    }

    interface Form {
        type: "form";
        value: Record<string, ResolvedFormValue>;
    }

    interface Bytes {
        type: "bytes";
        value: string | undefined; // base64 encoded
        fileName: string | undefined;
    }
}

/**
 * @deprecated
 */
export type ResolvedFormValue = ResolvedFormValue.Json | ResolvedFormValue.SingleFile | ResolvedFormValue.MultipleFiles;

/**
 * @deprecated
 */
export declare namespace ResolvedFormValue {
    interface Json {
        type: "json";
        value: unknown | undefined;
        contentType: string | undefined;
    }

    interface SingleFile {
        type: "file";
        fileName: string;
        fileId: string | undefined; // lookup file by UUID
        contentType: string | undefined;
    }

    interface MultipleFiles {
        type: "fileArray";
        files: SingleFile[];
    }
}

/**
 * @deprecated
 */
export type ResolvedExampleEndpointResponse =
    | ResolvedExampleEndpointResponse.Json
    | ResolvedExampleEndpointResponse.Filename
    | ResolvedExampleEndpointResponse.Stream
    | ResolvedExampleEndpointResponse.ServerSentEvents;

/**
 * @deprecated
 */
export declare namespace ResolvedExampleEndpointResponse {
    interface Json {
        type: "json";
        value: unknown | undefined;
    }

    interface Filename {
        type: "filename";
        value: string;
    }

    interface Stream {
        type: "stream";
        value: unknown[];
    }

    interface ServerSentEvent {
        event: string;
        data: unknown | undefined;
    }

    interface ServerSentEvents {
        type: "sse";
        value: ServerSentEvent[];
    }
}

/**
 * @deprecated
 */
export interface ResolvedCodeSnippet {
    name: string | undefined;
    language: string;
    install: string | undefined;
    code: string;
    // hast: Root;
    generated: boolean;
}

/**
 * @deprecated
 */
export interface ResolvedRequestBody extends WithMetadata {
    contentType: string;
    shape: ResolvedHttpRequestBodyShape;
}

/**
 * @deprecated
 */
export interface ResolvedError extends WithMetadata {
    shape: ResolvedTypeShape | undefined;
    statusCode: number;
    name: string | undefined;
    examples: ResolvedExampleError[];
}

/**
 * @deprecated
 */
export interface ResolvedExampleError {
    name: string | undefined;
    description: string | undefined;
    responseBody: unknown | undefined;
}

/**
 * @deprecated
 */
export interface ResolvedObjectProperty extends WithMetadata {
    key: APIV1Read.PropertyKey;
    valueShape: ResolvedTypeShape;
    hidden: boolean; // should be hidden in API reference, but present in examples and API Playground
}

/**
 * @deprecated
 */
export interface ResolvedResponseBody extends WithMetadata {
    shape: ResolvedHttpResponseBodyShape;
    statusCode: number;
}

/**
 * @deprecated
 */
export type ResolvedEndpointPathParts = ResolvedEndpointPathParts.Literal | ResolvedEndpointPathParts.PathParameter;

/**
 * @deprecated
 */
export declare namespace ResolvedEndpointPathParts {
    interface Literal {
        type: "literal";
        value: string;
    }

    interface PathParameter extends ResolvedObjectProperty {
        type: "pathParameter";
    }
}

/**
 * @deprecated
 */
export function stringifyResolvedEndpointPathParts(
    pathParts: ResolvedEndpointPathParts[],
): APIV1Read.EndpointPathLiteral {
    return APIV1Read.EndpointPathLiteral(
        pathParts.map((part) => (part.type === "literal" ? part.value : `:${part.key}`)).join(""),
    );
}

/**
 * @deprecated
 */
export function stringifyResolvedEndpointPathPartsTemplate(
    pathParts: ResolvedEndpointPathParts[],
): APIV1Read.EndpointPathLiteral {
    return APIV1Read.EndpointPathLiteral(
        pathParts.map((part) => (part.type === "literal" ? part.value : `{${part.key}}`)).join(""),
    );
}

/**
 * @deprecated
 */
export interface ResolvedWebSocketChannel extends WithEndpointMetadata {
    type: "websocket";
    id: APIV1Read.WebSocketId;
    auth: APIV1Read.ApiAuth | undefined;
    defaultEnvironment: APIV1Read.Environment | undefined;
    environments: APIV1Read.Environment[];
    path: ResolvedEndpointPathParts[];
    headers: ResolvedObjectProperty[];
    pathParameters: ResolvedObjectProperty[];
    queryParameters: ResolvedObjectProperty[];
    messages: ResolvedWebSocketMessage[];
    examples: APIV1Read.ExampleWebSocketSession[];
}

/**
 * @deprecated
 */
export interface ResolvedWebSocketMessage extends WithMetadata {
    type: APIV1Read.WebSocketMessageId;
    body: ResolvedTypeShape;
    displayName: string | undefined;
    origin: APIV1Read.WebSocketMessageOrigin;
}

/**
 * @deprecated
 */
export interface ResolvedWebhookDefinition extends WithEndpointMetadata {
    type: "webhook";
    id: APIV1Read.WebhookId;
    method: APIV1Read.WebhookHttpMethod;
    path: string[];
    headers: ResolvedObjectProperty[];
    payload: ResolvedPayload;
    examples: ResolvedExampleWebhookPayload[];
}

/**
 * @deprecated
 */
export interface ResolvedExampleWebhookPayload {
    payload: unknown;
    // hast: Root;
}

/**
 * @deprecated
 */
export interface ResolvedPayload extends WithMetadata {
    shape: ResolvedTypeShape;
}

/**
 * @deprecated
 */
export interface ResolvedObjectShape extends WithMetadata {
    name: string | undefined;
    type: "object";
    extends: string[];
    properties: ResolvedObjectProperty[];
    extraProperties: ResolvedTypeShape | undefined;
}

/**
 * @deprecated
 */
export interface ResolvedUndiscriminatedUnionShapeVariant extends WithMetadata {
    displayName: string | undefined;
    shape: ResolvedTypeShape;
}

/**
 * @deprecated
 */
export interface ResolvedUndiscriminatedUnionShape extends WithMetadata {
    name: string | undefined;
    type: "undiscriminatedUnion";
    variants: ResolvedUndiscriminatedUnionShapeVariant[];
}

/**
 * @deprecated
 */
export interface ResolvedDiscriminatedUnionShapeVariant extends WithMetadata {
    discriminantValue: string;
    extends: string[];
    properties: ResolvedObjectProperty[];
    displayName?: string;
}

/**
 * @deprecated
 */
export interface ResolvedDiscriminatedUnionShape extends WithMetadata {
    name: string | undefined;
    type: "discriminatedUnion";
    discriminant: string;
    variants: ResolvedDiscriminatedUnionShapeVariant[];
}

/**
 * @deprecated
 */
export interface ResolvedOptionalShape extends WithMetadata {
    type: "optional";
    shape: NonOptionalTypeShapeWithReference;
}

/**
 * @deprecated
 */
export interface ResolvedListShape extends WithMetadata {
    type: "list";
    shape: ResolvedTypeShape;
}

/**
 * @deprecated
 */
export interface ResolvedSetShape extends WithMetadata {
    type: "set";
    shape: ResolvedTypeShape;
}

/**
 * @deprecated
 */
export interface ResolvedMapShape extends WithMetadata {
    type: "map";
    keyShape: ResolvedTypeShape;
    valueShape: ResolvedTypeShape;
}

/**
 * @deprecated
 */
export type ResolvedTypeDefinition =
    | ResolvedObjectShape
    | ResolvedUndiscriminatedUnionShape
    | ResolvedDiscriminatedUnionShape
    | ResolvedEnumShape
    | ResolvedAliasShape
    | (APIV1Read.TypeReference.Unknown & WithMetadata)
    | (APIV1Read.TypeReference.Literal & WithMetadata);

/**
 * @deprecated
 */
interface ResolvedEnumShape extends WithMetadata {
    name: string | undefined;
    type: "enum";
    values: ResolvedEnumValue[];
    default: string | undefined;
}

/**
 * @deprecated
 */
export interface ResolvedEnumValue extends WithMetadata {
    value: string;
}

/**
 * @deprecated
 */
interface ResolvedAliasShape extends WithMetadata {
    name: string | undefined;
    type: "alias";
    shape: ResolvedTypeShape;
}

/**
 * @deprecated
 */
export type ResolvedTypeShape =
    | ResolvedTypeDefinition
    | (APIV1Read.TypeReference.Primitive & WithMetadata)
    | ResolvedOptionalShape
    | ResolvedListShape
    | ResolvedSetShape
    | ResolvedMapShape
    | (APIV1Read.TypeReference.Literal & WithMetadata)
    | APIV1Read.TypeReference.Unknown
    | ResolvedUnknownTypeShape
    | ResolvedReferenceShape;

/**
 * @deprecated
 */
export interface ResolvedUnknownTypeShape extends APIV1Read.TypeReference.Unknown {
    displayName?: string;
}

/**
 * @deprecated
 */
export type WithoutMetadata = APIV1Read.TypeReference.Unknown | ResolvedReferenceShape;

/**
 * @deprecated
 */
export function hasMetadata(shape: ResolvedTypeShape): shape is Exclude<ResolvedTypeShape, WithoutMetadata> {
    return shape.type !== "unknown" && shape.type !== "reference";
}

/**
 * @deprecated
 */
export type DereferencedTypeShape = Exclude<ResolvedTypeShape, ResolvedReferenceShape>;
/**
 * @deprecated
 */
export type NonOptionalTypeShape = Exclude<DereferencedTypeShape, ResolvedOptionalShape>;
/**
 * @deprecated
 */
export type NonOptionalTypeShapeWithReference = Exclude<ResolvedTypeShape, ResolvedOptionalShape>;
/**
 * @deprecated
 */
export type UnaliasedTypeShape = Exclude<DereferencedTypeShape, ResolvedAliasShape>;

/**
 * @deprecated
 */
export interface ResolvedReferenceShape {
    type: "reference";
    typeId: string;
}

/**
 * @deprecated
 */
export declare namespace ResolvedFormDataRequestProperty {
    interface FileProperty extends WithMetadata {
        type: "file";
        key: string;
        isOptional: boolean;
        contentType: string | string[] | undefined;
    }
    interface FileArrayProperty extends WithMetadata {
        type: "fileArray";
        key: string;
        isOptional: boolean;
        contentType: string | string[] | undefined;
    }

    interface BodyProperty extends ResolvedObjectProperty {
        type: "bodyProperty";
        contentType: string | string[] | undefined;
    }
}

/**
 * @deprecated
 */
export type ResolvedFormDataRequestProperty =
    | ResolvedFormDataRequestProperty.FileProperty
    | ResolvedFormDataRequestProperty.FileArrayProperty
    | ResolvedFormDataRequestProperty.BodyProperty;

/**
 * @deprecated
 */
export interface ResolvedFormDataRequest extends WithMetadata {
    name: string;
    properties: ResolvedFormDataRequestProperty[];
}

/**
 * @deprecated
 */
export interface ResolvedFormData extends ResolvedFormDataRequest {
    type: "formData";
}

/**
 * @deprecated
 */
export type ResolvedHttpRequestBodyShape = ResolvedFormData | APIV1Read.HttpRequestBodyShape.Bytes | ResolvedTypeShape;

/**
 * @deprecated
 */
interface ResolvedHttpRequestBodyShapeVisitor<T> {
    formData: (shape: ResolvedFormData) => T;
    bytes: (shape: APIV1Read.BytesRequest) => T;
    typeShape: (shape: ResolvedTypeShape) => T;
}

/**
 * @deprecated
 */
export function visitResolvedHttpRequestBodyShape<T>(
    shape: ResolvedHttpRequestBodyShape,
    visitor: ResolvedHttpRequestBodyShapeVisitor<T>,
): T {
    if (shape.type === "formData") {
        return visitor.formData(shape);
    } else if (shape.type === "bytes") {
        return visitor.bytes(shape);
    } else {
        return visitor.typeShape(shape);
    }
}

/**
 * @deprecated
 */
export interface ResolvedStreamShape {
    type: "stream";
    value: ResolvedTypeShape;
}

/**
 * @deprecated
 */
export type ResolvedHttpResponseBodyShape =
    | APIV1Read.HttpResponseBodyShape.FileDownload
    | ResolvedHttpResponseStreamShape
    | ResolvedTypeShape;

/**
 * @deprecated
 */
export type ResolvedHttpResponseStreamShape =
    | ResolvedStreamShape
    | APIV1Read.HttpResponseBodyShape.StreamingText
    | APIV1Read.HttpResponseBodyShape.StreamCondition;

/**
 * @deprecated
 */
interface ResolvedHttpResponseBodyShapeVisitor<T> {
    fileDownload: (shape: APIV1Read.HttpResponseBodyShape.FileDownload) => T;
    streamingText: (shape: APIV1Read.HttpResponseBodyShape.StreamingText) => T;
    streamCondition: (shape: APIV1Read.HttpResponseBodyShape.StreamCondition) => T;
    stream: (shape: ResolvedStreamShape) => T;
    typeShape: (shape: ResolvedTypeShape) => T;
}

/**
 * @deprecated
 */
export function visitResolvedHttpResponseBodyShape<T>(
    shape: ResolvedHttpResponseBodyShape,
    visitor: ResolvedHttpResponseBodyShapeVisitor<T>,
): T {
    switch (shape.type) {
        case "fileDownload":
            return visitor.fileDownload(shape);
        case "streamingText":
            return visitor.streamingText(shape);
        case "streamCondition":
            return visitor.streamCondition(shape);
        case "stream":
            return visitor.stream(shape);
        default:
            return visitor.typeShape(shape);
    }
}

/**
 * @deprecated
 */
export function unwrapReference(
    shape: ResolvedTypeShape,
    types: Record<string, ResolvedTypeDefinition>,
): DereferencedTypeShape {
    if (shape.type === "reference") {
        const nestedShape = types[shape.typeId];
        if (nestedShape == null) {
            return { type: "unknown", availability: undefined, description: undefined };
        }
        return unwrapReference(nestedShape, types);
    }

    if (shape.type === "alias") {
        return {
            ...shape,
            shape: unwrapReference(shape.shape, types),
        };
    }

    return shape;
}

/**
 * @deprecated
 */
export function unwrapAlias(
    shape: ResolvedTypeShape,
    types: Record<string, ResolvedTypeDefinition>,
): DereferencedTypeShape {
    shape = unwrapReference(shape, types);
    if (shape.type === "alias") {
        return unwrapAlias(shape.shape, types);
    }

    if (shape.type === "optional") {
        return {
            ...shape,
            shape: unwrapAlias(shape.shape, types) as NonOptionalTypeShapeWithReference,
        };
    }

    return shape;
}

/**
 * @deprecated
 */
export function unwrapOptional(
    shape: ResolvedTypeShape,
    types: Record<string, ResolvedTypeDefinition>,
): NonOptionalTypeShape {
    shape = unwrapReference(shape, types);
    if (shape.type === "optional") {
        return unwrapOptional(shape.shape, types);
    }

    if (shape.type === "alias") {
        return {
            ...shape,
            shape: unwrapOptional(shape.shape, types),
        };
    }

    return shape;
}

/**
 * @deprecated
 */
export function unwrapDescription(
    valueShape: ResolvedTypeShape,
    types: Record<string, ResolvedTypeDefinition>,
): FernDocs.MarkdownText | undefined {
    while (valueShape.type === "alias" || valueShape.type === "reference" || valueShape.type === "optional") {
        if (valueShape.type === "reference") {
            const nestedShape = types[valueShape.typeId];
            if (nestedShape == null) {
                return undefined;
            }
            valueShape = nestedShape;
        } else {
            if (valueShape.description != null) {
                return valueShape.description;
            }
            valueShape = valueShape.shape;
        }
    }

    if (hasMetadata(valueShape) && valueShape.description != null) {
        return valueShape.description;
    }

    if (valueShape.type === "map") {
        return unwrapDescription(valueShape.valueShape, types);
    }

    if (valueShape.type === "list" || valueShape.type === "set") {
        return unwrapDescription(valueShape.shape, types);
    }

    return undefined;
}

/**
 * @deprecated
 */
export function getParameterDescription(
    parameter: ResolvedObjectProperty,
    types: Record<string, ResolvedTypeDefinition>,
): FernDocs.MarkdownText | undefined {
    if (parameter.description != null) {
        return parameter.description;
    }

    return unwrapDescription(parameter.valueShape, types);
}

/**
 * @deprecated
 */
export const resolveEnvironment = (
    endpoint: ResolvedWebSocketChannel | ResolvedEndpointDefinition,
    selectedEnvironmentId?: string,
): APIV1Read.Environment | undefined => {
    if (!selectedEnvironmentId && typeof window !== "undefined") {
        // TODO: replace this, this is a workaround for now, for functions that need to resolve in the playground,
        // but do not have access to hooks
        selectedEnvironmentId = store.get(SELECTED_ENVIRONMENT_ATOM);
    }
    return (
        endpoint.environments.find((env) => env.id === selectedEnvironmentId) ??
        endpoint.defaultEnvironment ??
        endpoint.environments[0]
    );
};

/**
 * @deprecated
 */
export const resolveEnvironmentUrlInCodeSnippet = (
    endpoint: ResolvedEndpointDefinition,
    requestCodeSnippet: string,
    playgroundEnvironment: string | undefined,
    selectedEnvironmentId?: string,
    includePath?: boolean,
): string => {
    const urlToReplace = endpoint.environments.find((env) => requestCodeSnippet.includes(env.baseUrl))?.baseUrl;
    const resolvedEnvironment = resolveEnvironment(endpoint, selectedEnvironmentId);
    const playgroundReplacement = playgroundEnvironment && parse(playgroundEnvironment);
    return urlToReplace && resolvedEnvironment
        ? requestCodeSnippet.replace(
              urlToReplace,
              (playgroundReplacement &&
                  `${playgroundReplacement.protocol}//${playgroundReplacement.host}${includePath ? playgroundReplacement.pathname : ""}`) ??
                  resolvedEnvironment.baseUrl,
          )
        : requestCodeSnippet;
};

// This hack is no longer needed since it was introduced for Hume's demo only.
// keeping this around in case we need to re-introduce it.

// HACK: remove this function when we have a proper way to merge content types
// function mergeContentTypes(definitions: ResolvedEndpointDefinition[]): ResolvedEndpointDefinition[] {
//     const toRet: ResolvedEndpointDefinition[] = [];

//     definitions.forEach((definition) => {
//         if (!definition.id.endsWith("_multipart")) {
//             toRet.push(definition);
//         }
//     });

//     definitions.forEach((definition) => {
//         if (definition.id.endsWith("_multipart")) {
//             const baseId = definition.id.replace("_multipart", "");
//             const baseDefinition = toRet.find((def) => def.id === baseId);
//             if (baseDefinition) {
//                 baseDefinition.requestBody = [...baseDefinition.requestBody, ...definition.requestBody];
//             } else {
//                 toRet.push(definition);
//             }
//         }
//     });

//     return toRet;
// }
