// import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
// import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
// import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
// import { compact, mapValues } from "lodash-es";
// // import { captureSentryError } from "../analytics/sentry";
// // import type { FeatureFlags } from "../atoms";
// // import { serializeMdx } from "../mdx/bundler";
// // import type { FernSerializeMdxOptions } from "../mdx/types";
// import { visitDiscriminatedUnion } from "../utils/visitDiscriminatedUnion";
// // import { ApiTypeResolver } from "./ApiTypeResolver";
// import { sortKeysByShape } from "./sortKeysByShape";
// // import type {
// //     ResolvedExampleEndpointRequest,
// //     ResolvedExampleEndpointResponse,
// //     ResolvedFormData,
// //     ResolvedFormDataRequestProperty,
// //     ResolvedFormValue,
// //     ResolvedHttpRequestBodyShape,
// //     ResolvedHttpResponseBodyShape,
// //     ResolvedObjectProperty,
// //     ResolvedTypeDefinition,
// //     ResolvedTypeShape,
// // } from "./types";

// interface MergedAuthAndHeaders {
//     auth: APIV1Read.ApiAuth | undefined;
//     headers: ApiDefinition.ObjectProperty[];
// }

// export class ApiEndpointResolver {
//     public constructor(
//         private collector: FernNavigation.NodeCollector,
//         private holder: FernNavigation.ApiDefinitionHolder,
//         private typeResolver: ApiTypeResolver,
//         private resolvedTypes: Record<string, ApiDefinition.TypeDefinition>,
//         private featureFlags: FeatureFlags,
//         private mdxOptions: FernSerializeMdxOptions | undefined,
//     ) {}

//     // HACKHACK: this handles the case where FernIR is unable to interpret the security scheme for AsyncAPI
//     // and that we direct users to specify the websocket bindings instead.
//     mergeAuthAndHeaders(
//         authed: boolean,
//         auth: APIV1Read.ApiAuth | undefined,
//         headers: ApiDefinition.Parameter[],
//     ): MergedAuthAndHeaders {
//         if (authed && auth != null) {
//             return { auth, headers };
//         }

//         for (const header of headers) {
//             if (
//                 header.key.toLowerCase() === "authorization" ||
//                 header.key.toLowerCase().includes("api-key") ||
//                 header.key.toLowerCase().includes("apikey")
//             ) {
//                 const auth: APIV1Read.ApiAuth = {
//                     type: "header",
//                     headerWireValue: header.key,
//                 };
//                 return { auth, headers: headers.filter((h) => h.key !== header.key) };
//             }
//         }

//         return { auth: undefined, headers };
//     }

//     resolveRequestBodyShape(
//         requestBodyShape: APIV1Read.HttpRequestBodyShape,
//     ): Promise<ApiDefinition.HttpRequestBodyShape> {
//         return visitDiscriminatedUnion(requestBodyShape, "type")._visit<Promise<ApiDefinition.HttpRequestBodyShape>>({
//             object: async (object) => ({
//                 type: "object",
//                 name: undefined,
//                 extends: object.extends,
//                 properties: await this.typeResolver.resolveObjectProperties(object),
//                 description: undefined,
//                 availability: undefined,
//             }),
//             formData: this.resolveFormData,
//             fileUpload: (fileUpload) =>
//                 fileUpload.value != null
//                     ? this.resolveFormData(fileUpload.value)
//                     : Promise.resolve({
//                           type: "formData",
//                           name: "Form Data",
//                           properties: [],
//                           description: undefined,
//                           availability: undefined,
//                       }),
//             bytes: (bytes) => Promise.resolve(bytes),
//             reference: (reference) => this.typeResolver.resolveTypeReference(reference.value),
//             _other: () =>
//                 Promise.resolve({
//                     type: "unknown",
//                     availability: undefined,
//                     description: undefined,
//                 }),
//         });
//     }

//     async resolveFormData(formData: APIV1Read.FormDataRequest): Promise<ResolvedFormData> {
//         return {
//             type: "formData",
//             description: await serializeMdx(formData.description, {
//                 files: this.mdxOptions?.files,
//             }),
//             availability: formData.availability,
//             name: formData.name,
//             properties: await Promise.all(
//                 formData.properties.map(async (property): Promise<ResolvedFormDataRequestProperty> => {
//                     switch (property.type) {
//                         case "file": {
//                             const description = await serializeMdx(property.value.description, {
//                                 files: this.mdxOptions?.files,
//                             });
//                             return {
//                                 type: property.value.type,
//                                 key: property.value.key,
//                                 description,
//                                 availability: property.value.availability,
//                                 isOptional: property.value.isOptional,
//                                 contentType: property.value.contentType,
//                             };
//                         }
//                         case "bodyProperty": {
//                             const [description, valueShape] = await Promise.all([
//                                 serializeMdx(property.description, {
//                                     files: this.mdxOptions?.files,
//                                 }),
//                                 this.typeResolver.resolveTypeReference(property.valueType),
//                             ]);
//                             return {
//                                 type: "bodyProperty",
//                                 key: property.key,
//                                 description,
//                                 availability: property.availability,
//                                 valueShape,
//                                 hidden: false,
//                                 contentType: property.contentType,
//                             };
//                         }
//                     }
//                 }),
//             ),
//         };
//     }

//     resolveResponseBodyShape(
//         responseBodyShape: APIV1Read.HttpResponseBodyShape,
//     ): Promise<ResolvedHttpResponseBodyShape> {
//         return Promise.resolve(
//             visitDiscriminatedUnion(responseBodyShape, "type")._visit<
//                 ResolvedHttpResponseBodyShape | Promise<ResolvedHttpResponseBodyShape>
//             >({
//                 object: async (object) => ({
//                     type: "object",
//                     name: undefined,
//                     extends: object.extends,
//                     properties: await this.typeResolver.resolveObjectProperties(object),
//                     description: undefined,
//                     availability: undefined,
//                 }),
//                 fileDownload: (fileDownload) => fileDownload,
//                 streamingText: (streamingText) => streamingText,
//                 streamCondition: (streamCondition) => streamCondition,
//                 reference: (reference) => this.typeResolver.resolveTypeReference(reference.value),
//                 stream: async (stream) => {
//                     if (stream.shape.type === "reference") {
//                         return {
//                             type: "stream",
//                             value: await this.typeResolver.resolveTypeReference(stream.shape.value),
//                         };
//                     }
//                     return {
//                         type: "stream",
//                         value: {
//                             type: "object",
//                             name: undefined,
//                             extends: stream.shape.extends,
//                             properties: await this.typeResolver.resolveObjectProperties(stream.shape),
//                             description: undefined,
//                             availability: undefined,
//                         },
//                     };
//                 },
//                 _other: () => ({ type: "unknown", availability: undefined, description: undefined }),
//             }),
//         );
//     }

//     resolveExampleEndpointRequest(
//         requestBodyV3: APIV1Read.ExampleEndpointRequest | undefined,
//         shape: ResolvedHttpRequestBodyShape | undefined,
//     ): ResolvedExampleEndpointRequest | undefined {
//         if (requestBodyV3 == null) {
//             return undefined;
//         }
//         return visitDiscriminatedUnion(requestBodyV3, "type")._visit<ApiDefinition.ExampleEndpointRequest | undefined>({
//             json: (json) => ({
//                 type: "json",
//                 value: this.safeSortKeysByShape(json.value, shape),
//             }),
//             form: (form) => ({
//                 type: "form",
//                 value: mapValues(form.value, (v, key) =>
//                     visitDiscriminatedUnion(v, "type")._visit<ResolvedFormValue>({
//                         json: (value) => {
//                             const property =
//                                 shape?.type === "formData"
//                                     ? shape.properties.find((p) => p.key === key && p.type === "bodyProperty")
//                                     : undefined;
//                             // this is a hack to allow the API Playground to send JSON blobs in form data
//                             // revert this once we have a better solution
//                             const contentType =
//                                 compact(property?.contentType)[0] ??
//                                 (this.featureFlags.usesApplicationJsonInFormDataValue ? "application/json" : undefined);
//                             return { type: "json" as const, value: value.value, contentType };
//                         },
//                         filename: (value) => ({
//                             type: "file",
//                             fileName: value.value,
//                             fileId: undefined,
//                             contentType: undefined,
//                         }),
//                         filenames: (value) => ({
//                             type: "fileArray",
//                             files: value.value.map((v) => ({
//                                 type: "file",
//                                 fileName: v,
//                                 fileId: undefined,
//                                 contentType: undefined,
//                             })),
//                         }),
//                         filenameWithData: (value) => ({
//                             type: "file",
//                             fileName: value.filename,
//                             fileId: value.data,
//                             contentType: undefined,
//                         }),
//                         filenamesWithData: (value) => ({
//                             type: "fileArray",
//                             files: value.value.map((v) => ({
//                                 type: "file",
//                                 fileName: v.filename,
//                                 fileId: v.data,
//                                 contentType: undefined,
//                             })),
//                         }),
//                         _other: () => ({ type: "json", value: undefined, contentType: undefined }),
//                     }),
//                 ),
//             }),
//             bytes: (bytes) => ({ type: "bytes", value: bytes.value.value, fileName: undefined }),
//             _other: () => undefined,
//         });
//     }

//     resolveExampleEndpointResponse(
//         responseBodyV3: APIV1Read.ExampleEndpointResponse | undefined,
//         shape: ApiDefinition.HttpResponseBodyShape | undefined,
//     ): ApiDefinition.ExampleEndpointResponse | undefined {
//         if (responseBodyV3 == null) {
//             return undefined;
//         }
//         return visitDiscriminatedUnion(responseBodyV3, "type")._visit<ResolvedExampleEndpointResponse | undefined>({
//             json: (json) => ({
//                 type: "json",
//                 value: json.value != null ? this.safeSortKeysByShape(json.value, shape) : undefined,
//             }),
//             filename: (filename) => ({ type: "filename", value: filename.value }),
//             stream: (stream) => ({
//                 type: "stream",
//                 value: stream.value.map((streamValue) => this.safeSortKeysByShape(streamValue, shape)),
//             }),
//             sse: (sse) => ({
//                 type: "sse",
//                 value: sse.value.map((sse) => ({
//                     event: sse.event,
//                     data: this.safeSortKeysByShape(sse.data, shape),
//                 })),
//             }),
//             _other: () => undefined,
//         });
//     }

//     safeSortKeysByShape(
//         value: unknown,
//         shape:
//             | ApiDefinition.TypeShape
//             | ApiDefinition.HttpRequestBodyShape
//             | ApiDefinition.HttpResponseBodyShape
//             | null
//             | undefined,
//     ): unknown {
//         if (value == null) {
//             return value;
//         }
//         try {
//             return this.stripUndefines(sortKeysByShape(value, shape, this.resolvedTypes));
//         } catch (e) {
//             // eslint-disable-next-line no-console
//             console.error("Failed to sort JSON keys by type shape", e);

//             return value;
//         }
//     }

//     stripUndefines(obj: unknown): unknown {
//         return JSON.parse(JSON.stringify(obj));
//     }
// }
