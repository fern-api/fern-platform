// import { FdrAPI } from "@fern-api/fdr-sdk";
// import { OpenAPIV3_1 } from "openapi-types";
// import { v4 } from "uuid";
// import { ApiNode, ApiNodeContext } from "../../interfaces/api.node.interface";
// import { FdrStage } from "../../interfaces/fdr.stage.interface";
// import { EndpointNode, Method } from "../../nodes/endpoint.node";

// type ApiProcessingStageOutput = {
//     endpoints: FdrAPI.api.latest.ApiDefinition["endpoints"];
//     websockets: FdrAPI.api.latest.ApiDefinition["websockets"];
//     webhooks: FdrAPI.api.latest.ApiDefinition["webhooks"];
// };

// export class FdrApiStage implements FdrStage<OpenAPIV3_1.Document, ApiProcessingStageOutput> {
//     stageName = "ApiProcessingStage";
//     name = "ApiProcessingStage";
//     qualifiedId: string;

//     endpoints: ApiProcessingStageOutput["endpoints"] = {};
//     websockets: ApiProcessingStageOutput["websockets"] = {};
//     webhooks: ApiProcessingStageOutput["webhooks"] = {};

//     private processEndpoint(method: Method, path: string, pathItem: OpenAPIV3_1.PathItemObject) {
//         const id = v4();
//         this.endpoints[FdrAPI.EndpointId(id)] = new EndpointNode(
//             id,
//             method,
//             path,
//             this.context,
//             pathItem,
//             this.accessPath,
//         ).outputFdrShape();
//     }

//     constructor(
//         readonly context: ApiNodeContext,
//         readonly preProcessedInput: OpenAPIV3_1.Document["paths"],
//         readonly accessPath: ApiNode<unknown, unknown>[],
//     ) {
//         this.qualifiedId = `${this.accessPath.map((node) => node.qualifiedId).join(".")}.${this.name}`;
//         this.accessPath.push(this);

//         if (this.preProcessedInput != null) {
//             for (const [path, pathItem] of Object.entries(this.preProcessedInput)) {
//                 // handle $ref
//                 if (pathItem != null) {
//                     if (pathItem.get != null) {
//                         this.processEndpoint("GET", path, pathItem.get);
//                     }
//                     if (pathItem.post != null) {
//                         this.processEndpoint("POST", path, pathItem.post);
//                     }
//                     if (pathItem.put != null) {
//                         this.processEndpoint("PUT", path, pathItem.put);
//                     }
//                     if (pathItem.delete != null) {
//                         this.processEndpoint("DELETE", path, pathItem.delete);
//                     }
//                     // Right now, we only support the 4 methods above, head, options, and trace... are not supported
//                 }
//             }
//         }
//     }

//     outputFdrShape = (): ApiProcessingStageOutput => {
//         return {
//             endpoints: {},
//             webhooks: {},
//             websockets: {},
//         };
//     };
// }
