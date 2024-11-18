// import { FdrAPI } from "@fern-api/fdr-sdk";
// import { OpenAPIV3_1 } from "openapi-types";
// import { v4 } from "uuid";
// import { ApiNode, ApiNodeContext } from "../shared/interfaces/api.node.interface";
// import { FdrApiStage } from "../shared/stages/fdr/api.stage";

// export class OpenApi3_1Node implements ApiNode<OpenAPIV3_1.Document, FdrAPI.api.latest.ApiDefinition> {
//     name = "OpenApi3_1";
//     context: ApiNodeContext;
//     qualifiedId: string = "OpenApi3_1";

//     constructor(
//         context: ApiNodeContext,
//         readonly preProcessedInput: OpenAPIV3_1.Document,
//     ) {
//         this.context = context;
//         this.accessPath = [this];
//     }
//     accessPath: ApiNode<unknown, unknown>[];

//     validate
//     toFdrShape = (): FdrAPI.api.latest.ApiDefinition => {
//         const { endpoints, websockets, webhooks } = new FdrApiStage(
//             this.context,
//             this.preProcessedInput.paths,
//             this.accessPath,
//         ).toFdrShape();

//         const types = new FdrTypesStage(
//             this.context,
//             this.preProcessedInput.components?.schemas,
//             this.accessPath,
//         ).toFdrShape();

//         const auths = new FdrAuthsStage(
//             this.context,
//             this.preProcessedInput.components?.securitySchemes,
//             this.accessPath,
//         ).toFdrShape();

//         const globalHeaders = new FdrGlobalHeadersStage(
//             this.context,
//             this.preProcessedInput.components?.headers,
//             this.accessPath,
//         ).toFdrShape();

//         return {
//             id: v4(),
//             endpoints,
//             websockets,
//             webhooks,
//             types,
//             subpackages: {},
//             auths,
//             globalHeaders,
//         };
//     };
// }
