// import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
// import { EndpointBaseRecord, ParameterRecord } from "../types.js";
// import { toDescription } from "./utils.js";

// interface CreateParameterRecordHttpOptions {
//     base: EndpointBaseRecord;
//     endpoint: ApiDefinition.EndpointDefinition;
//     types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
// }

// function toBreadcrumbs(path: ApiDefinition.KeyPathItem[]): {
//     key: string;
//     display_name: string | undefined;
//     optional: boolean | undefined;
// }[] {
//     return path.map(item => ({
//         key: item.
//     }))
// }

// export function createParameterRecordsHttp({
//     base,
//     endpoint,
//     types,
// }: CreateParameterRecordHttpOptions): ParameterRecord[] {
//     const records: ParameterRecord[] = [];

//     endpoint.requestHeaders?.forEach((property) => {
//         ApiDefinition.collectTypeDefinitionTreeForObjectProperty(property, types).forEach((item) => {
//             records.push({
//                 ...base,
//                 type: "parameter",
//                 section: "request",
//                 subsection_type: "header",
//                 parameter_breadcrumb: toBreadcrumbs(item.path),
//                 parameter_name: property.key,
//                 parameter_type: item.path,
//                 description: toDescription(item.descriptions),
//                 availability: item.availability,
//             });
//         });
//     });

//     endpoint.queryParameters?.forEach((property) => {
//         records.push(
//             ...collectTypeDefinitionTreeForObjectProperty(property, types, [
//                 { type: "meta", value: "request", displayName: "Request" },
//                 { type: "meta", value: "query", displayName: "Query Parameters" },
//             ]),
//         );
//     });

//     endpoint.pathParameters?.forEach((property) => {
//         records.push(
//             ...collectTypeDefinitionTreeForObjectProperty(property, types, [
//                 { type: "meta", value: "request", displayName: "Request" },
//                 { type: "meta", value: "path", displayName: "Path Parameters" },
//             ]),
//         );
//     });

//     if (endpoint.request) {
//         switch (endpoint.request.body.type) {
//             case "object":
//             case "alias":
//                 records.push(
//                     ...collectTypeDefinitionTree(endpoint.request.body, types, {
//                         path: [
//                             { type: "meta", value: "request", displayName: "Request" },
//                             { type: "meta", value: "body", displayName: undefined },
//                         ],
//                     }),
//                 );
//                 break;
//             case "bytes":
//             case "formData":
//                 // TODO: implement this
//                 break;
//         }
//     }

//     endpoint.responseHeaders?.forEach((property) => {
//         records.push(
//             ...collectTypeDefinitionTreeForObjectProperty(property, types, [
//                 { type: "meta", value: "response", displayName: "Response" },
//                 { type: "meta", value: "header", displayName: "Headers" },
//             ]),
//         );
//     });

//     if (endpoint.response) {
//         switch (endpoint.response.body.type) {
//             case "alias":
//             case "object":
//                 records.push(
//                     ...collectTypeDefinitionTree(endpoint.response.body, types, {
//                         path: [
//                             { type: "meta", value: "response", displayName: "Response" },
//                             { type: "meta", value: "body", displayName: undefined },
//                         ],
//                     }),
//                 );
//                 break;
//             case "stream":
//                 records.push(
//                     ...collectTypeDefinitionTree(endpoint.response.body.shape, types, {
//                         path: [
//                             { type: "meta", value: "response", displayName: "Response" },
//                             { type: "meta", value: "body", displayName: undefined },
//                             { type: "meta", value: "stream", displayName: undefined },
//                         ],
//                     }),
//                 );
//                 break;
//             case "fileDownload":
//             case "streamingText":
//                 // TODO: implement this
//                 break;
//         }
//     }

//     endpoint.errors?.forEach((error) => {
//         if (error.shape != null) {
//             records.push(
//                 ...collectTypeDefinitionTree(error.shape, types, {
//                     path: [
//                         { type: "meta", value: "response", displayName: "Response" },
//                         { type: "meta", value: "error", displayName: "Errors" },
//                         {
//                             type: "meta",
//                             value: convertNameToAnchorPart(error.name) ?? error.statusCode.toString(),
//                             displayName: error.name,
//                         },
//                     ],
//                 }),
//             );
//         }
//     });

//     return records;
// }
