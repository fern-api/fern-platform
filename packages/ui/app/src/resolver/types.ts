import type { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import type { WithoutQuestionMarks } from "@fern-api/fdr-sdk/dist/converters/utils/WithoutQuestionMarks";
import { SerializedMdxContent } from "../mdx/mdx";

export type WithDescription = { description: SerializedMdxContent | undefined };
export type WithAvailability = { availability: APIV1Read.Availability | undefined };

export interface WithMetadata {
    description: SerializedMdxContent | undefined;
    availability: APIV1Read.Availability | undefined;
}

export type ResolvedNavigationItem =
    | ResolvedNavigationItemPageGroup
    | ResolvedNavigationItemApiSection
    | ResolvedNavigationItemSection;

export interface ResolvedNavigationItemPageGroup {
    type: "pageGroup";
    pages: ResolvedPageMetadata[];
}

export interface ResolvedPageMetadata {
    id: DocsV1Read.PageId;
    slug: string[];
    title: string;
}

export interface ResolvedNavigationItemApiSection
    extends WithoutQuestionMarks<Omit<DocsV1Read.ApiSection, "urlSlug" | "artifacts">>,
        ResolvedWithApiDefinition {
    type: "apiSection";
    auth: APIV1Read.ApiAuth | undefined;
    hasMultipleBaseUrls: boolean | undefined;
    slug: string[];
    types: Record<string, ResolvedTypeDefinition>;
    artifacts: DocsV1Read.ApiArtifacts | undefined;
}

export interface FlattenedRootPackage {
    auth: APIV1Read.ApiAuth | undefined;
    types: Record<string, ResolvedTypeDefinition>;
    apiDefinitions: ResolvedApiDefinition[];
}

export function isResolvedNavigationItemApiSection(
    item: ResolvedNavigationItem,
): item is ResolvedNavigationItemApiSection {
    return item.type === "apiSection";
}

export interface ResolvedNavigationItemSection extends Omit<DocsV1Read.DocsSection, "items" | "urlSlug"> {
    type: "section";
    items: ResolvedNavigationItem[];
    slug: string[];
}

export function isResolvedNavigationItemSection(item: ResolvedNavigationItem): item is ResolvedNavigationItemSection {
    return item.type === "section";
}

export interface ResolvedWithApiDefinition {
    endpoints: ResolvedEndpointDefinition[];
    websockets: ResolvedWebSocketChannel[];
    webhooks: ResolvedWebhookDefinition[];
    subpackages: ResolvedSubpackage[];
    slug: string[];
}

export type ResolvedApiDefinition =
    | ResolvedApiDefinition.Endpoint
    | ResolvedApiDefinition.Webhook
    | ResolvedApiDefinition.WebSocket;

export declare namespace ResolvedApiDefinition {
    export interface Endpoint extends ResolvedEndpointDefinition {
        type: "endpoint";
        package: ResolvedApiDefinitionPackage;
    }

    export interface Webhook extends ResolvedWebhookDefinition {
        type: "webhook";
        package: ResolvedApiDefinitionPackage;
    }

    export interface WebSocket extends ResolvedWebSocketChannel {
        type: "websocket";
        package: ResolvedApiDefinitionPackage;
    }
}

export function isEndpoint(definition: ResolvedApiDefinition): definition is ResolvedApiDefinition.Endpoint {
    return definition.type === "endpoint";
}

export function isWebhook(definition: ResolvedApiDefinition): definition is ResolvedApiDefinition.Webhook {
    return definition.type === "webhook";
}

export function isWebSocket(definition: ResolvedApiDefinition): definition is ResolvedApiDefinition.WebSocket {
    return definition.type === "websocket";
}

export interface ResolvedSubpackage extends WithMetadata, ResolvedWithApiDefinition {
    type: "subpackage";
    apiSectionId: FdrAPI.ApiDefinitionId;
    id: APIV1Read.SubpackageId;
    name: string;
    title: string;
}

export function isResolvedSubpackage(item: ResolvedWithApiDefinition): item is ResolvedSubpackage {
    return (item as ResolvedSubpackage).type === "subpackage";
}

export interface ResolvedRootPackage extends ResolvedWithApiDefinition {
    type: "rootPackage";
    api: FdrAPI.ApiDefinitionId;
    auth: APIV1Read.ApiAuth | undefined;
    types: Record<string, ResolvedTypeDefinition>;
}

export type ResolvedApiDefinitionPackage = ResolvedRootPackage | ResolvedSubpackage;

export interface ResolvedEndpointDefinition extends WithMetadata {
    id: APIV1Read.EndpointId;
    apiSectionId: FdrAPI.ApiDefinitionId;
    apiPackageId: FdrAPI.ApiDefinitionId | APIV1Read.SubpackageId;
    slug: string[];
    auth: APIV1Read.ApiAuth | undefined;
    availability: APIV1Read.Availability | undefined;
    defaultEnvironment: APIV1Read.Environment | undefined;
    environments: APIV1Read.Environment[];
    method: APIV1Read.HttpMethod;
    name: string | undefined;
    title: string;
    path: ResolvedEndpointPathParts[];
    pathParameters: ResolvedObjectProperty[];
    queryParameters: ResolvedObjectProperty[];
    headers: ResolvedObjectProperty[];
    requestBody: ResolvedRequestBody[];
    responseBody: ResolvedResponseBody | undefined;
    errors: ResolvedError[];
    examples: ResolvedExampleEndpointCall[];
}

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

export type ResolvedExampleEndpointRequest =
    | ResolvedExampleEndpointRequest.Json
    | ResolvedExampleEndpointRequest.Form
    | ResolvedExampleEndpointRequest.Stream;

export declare namespace ResolvedExampleEndpointRequest {
    interface Json {
        type: "json";
        value: unknown | undefined;
    }

    interface Form {
        type: "form";
        value: Record<string, ResolvedFormValue>;
    }

    interface Stream {
        type: "stream";
        fileName: string;
    }
}

export type ResolvedFormValue = ResolvedFormValue.Json | ResolvedFormValue.SingleFile | ResolvedFormValue.MultipleFiles;

export declare namespace ResolvedFormValue {
    interface Json {
        type: "json";
        value: unknown | undefined;
    }

    interface SingleFile {
        type: "file";
        fileName: string;
    }

    interface MultipleFiles {
        type: "fileArray";
        fileNames: string[];
    }
}

export type ResolvedExampleEndpointResponse =
    | ResolvedExampleEndpointResponse.Json
    | ResolvedExampleEndpointResponse.Filename
    | ResolvedExampleEndpointResponse.Stream;

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
}

export interface ResolvedCodeSnippet {
    name: string | undefined;
    language: string;
    install: string | undefined;
    code: string;
    // hast: Root;
    generated: boolean;
}

export interface ResolvedRequestBody extends WithMetadata {
    contentType: string;
    shape: ResolvedHttpRequestBodyShape;
}

export interface ResolvedError extends WithMetadata {
    shape: ResolvedTypeShape | undefined;
    statusCode: number;
    name: string | undefined;
}

export interface ResolvedObjectProperty extends WithMetadata {
    key: APIV1Read.PropertyKey;
    valueShape: ResolvedTypeShape;
}

export interface ResolvedResponseBody extends WithMetadata {
    shape: ResolvedHttpResponseBodyShape;
}

export type ResolvedEndpointPathParts = ResolvedEndpointPathParts.Literal | ResolvedEndpointPathParts.PathParameter;
export declare namespace ResolvedEndpointPathParts {
    interface Literal {
        type: "literal";
        value: string;
    }

    interface PathParameter extends ResolvedObjectProperty {
        type: "pathParameter";
    }
}

export interface ResolvedWebSocketChannel {
    id: string;
    slug: string[];
    name: string | undefined;
    description: string | undefined;
    availability: APIV1Read.Availability | undefined;
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

export interface ResolvedWebSocketMessage extends WithMetadata {
    type: APIV1Read.WebSocketMessageId;
    body: ResolvedTypeShape;
    displayName: string | undefined;
    origin: APIV1Read.WebSocketMessageOrigin;
}

export interface ResolvedWebhookDefinition extends WithMetadata {
    id: APIV1Read.WebhookId;
    slug: string[];

    method: APIV1Read.WebhookHttpMethod;
    name: string | undefined;
    path: string[];
    headers: ResolvedObjectProperty[];
    payload: ResolvedPayload;
    examples: ResolvedExampleWebhookPayload[];
}
export interface ResolvedExampleWebhookPayload {
    payload: unknown;
    // hast: Root;
}

export interface ResolvedPayload extends WithMetadata {
    shape: ResolvedTypeShape;
}

export interface ResolvedObjectShape extends WithMetadata {
    name: string | undefined;
    type: "object";
    extends: string[];
    properties: ResolvedObjectProperty[];
}

export interface ResolvedUndiscriminatedUnionShapeVariant extends WithMetadata {
    displayName: string | undefined;
    shape: ResolvedTypeShape;
}

export interface ResolvedUndiscriminatedUnionShape extends WithMetadata {
    name: string | undefined;
    type: "undiscriminatedUnion";
    variants: ResolvedUndiscriminatedUnionShapeVariant[];
}

export interface ResolvedDiscriminatedUnionShapeVariant extends WithMetadata {
    discriminantValue: string;
    extends: string[];
    properties: ResolvedObjectProperty[];
}

export interface ResolvedDiscriminatedUnionShape extends WithMetadata {
    name: string | undefined;
    type: "discriminatedUnion";
    discriminant: string;
    variants: ResolvedDiscriminatedUnionShapeVariant[];
}

export interface ResolvedOptionalShape extends WithMetadata {
    type: "optional";
    shape: NonOptionalTypeShape;
    defaultsTo: unknown | undefined;
}

export interface ResolvedListShape extends WithMetadata {
    type: "list";
    shape: ResolvedTypeShape;
}

export interface ResolvedSetShape extends WithMetadata {
    type: "set";
    shape: ResolvedTypeShape;
}

export interface ResolvedMapShape extends WithMetadata {
    type: "map";
    keyShape: ResolvedTypeShape;
    valueShape: ResolvedTypeShape;
}

export type ResolvedTypeDefinition =
    | ResolvedObjectShape
    | ResolvedUndiscriminatedUnionShape
    | ResolvedDiscriminatedUnionShape
    | ResolvedEnumShape
    | ResolvedAliasShape
    | (APIV1Read.TypeReference.Unknown & WithMetadata);

interface ResolvedEnumShape extends WithMetadata {
    name: string | undefined;
    type: "enum";
    values: ResolvedEnumValue[];
}

export interface ResolvedEnumValue extends WithMetadata {
    value: string;
}

interface ResolvedAliasShape extends WithMetadata {
    name: string | undefined;
    type: "alias";
    shape: ResolvedTypeShape;
}

export type ResolvedTypeShape =
    | ResolvedTypeDefinition
    | (APIV1Read.PrimitiveType & WithMetadata)
    | ResolvedOptionalShape
    | ResolvedListShape
    | ResolvedSetShape
    | ResolvedMapShape
    | (APIV1Read.LiteralType & WithMetadata)
    | (APIV1Read.TypeReference.Unknown & WithMetadata)
    | ResolvedReferenceShape;

export type DereferencedTypeShape = Exclude<ResolvedTypeShape, ResolvedReferenceShape>;
export type NonOptionalTypeShape = Exclude<DereferencedTypeShape, ResolvedOptionalShape>;

export interface ResolvedReferenceShape extends WithMetadata {
    type: "reference";
    typeId: string;
}

export declare namespace ResolvedFileUploadRequestProperty {
    interface BodyProperty extends ResolvedObjectProperty {
        type: "bodyProperty";
    }
}

export type ResolvedFileUploadRequestProperty = APIV1Read.FileProperty | ResolvedFileUploadRequestProperty.BodyProperty;

export interface ResolvedFileUploadRequest extends WithMetadata {
    name: string;
    properties: ResolvedFileUploadRequestProperty[];
}

export interface ResolvedFileUpload {
    type: "fileUpload";
    value: ResolvedFileUploadRequest | undefined;
}

export type ResolvedHttpRequestBodyShape =
    | ResolvedFileUpload
    | APIV1Read.HttpRequestBodyShape.Bytes
    | ResolvedTypeShape;

interface ResolvedHttpRequestBodyShapeVisitor<T> {
    fileUpload: (shape: ResolvedFileUpload) => T;
    bytes: (shape: APIV1Read.BytesRequest) => T;
    typeShape: (shape: ResolvedTypeShape) => T;
}

export function visitResolvedHttpRequestBodyShape<T>(
    shape: ResolvedHttpRequestBodyShape,
    visitor: ResolvedHttpRequestBodyShapeVisitor<T>,
): T {
    if (shape.type === "fileUpload") {
        return visitor.fileUpload(shape);
    } else if (shape.type === "bytes") {
        return visitor.bytes(shape);
    } else {
        return visitor.typeShape(shape);
    }
}

export interface ResolvedStreamShape {
    type: "stream";
    value: ResolvedTypeShape;
}

export type ResolvedHttpResponseBodyShape =
    | APIV1Read.HttpResponseBodyShape.FileDownload
    | APIV1Read.HttpResponseBodyShape.StreamingText
    | APIV1Read.HttpResponseBodyShape.StreamCondition
    | ResolvedStreamShape
    | ResolvedTypeShape;

interface ResolvedHttpResponseBodyShapeVisitor<T> {
    fileDownload: (shape: APIV1Read.HttpResponseBodyShape.FileDownload) => T;
    streamingText: (shape: APIV1Read.HttpResponseBodyShape.StreamingText) => T;
    streamCondition: (shape: APIV1Read.HttpResponseBodyShape.StreamCondition) => T;
    stream: (shape: ResolvedStreamShape) => T;
    typeShape: (shape: ResolvedTypeShape) => T;
}

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
