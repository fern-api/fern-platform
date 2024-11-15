// import { FdrAPI } from "@fern-api/fdr-sdk";
// import { OpenAPIV3_1 } from "openapi-types";
// import { ApiNode, ApiNodeContext } from "../interfaces/api.node.interface";
// import { PathNode } from "./path.node";
// import { AuthSchemeIdsNode } from "./authScheme.node";

// export class EndpointNode implements ApiNode<OpenAPIV3_1.OperationObject, FdrAPI.api.latest.EndpointDefinition> {
//     name = "endpoint";
//     qualifiedId: string;

//     constructor(
//         private readonly id: string,
//         private readonly method: FdrAPI.HttpMethod,
//         private readonly path: string,
//         readonly context: ApiNodeContext,
//         readonly preProcessedInput: OpenAPIV3_1.OperationObject,
//         readonly accessPath: ApiNode<unknown, unknown>[],
//     ) {
//         this.qualifiedId = `${this.accessPath.map((node) => node.qualifiedId).join(".")}.${this.name}`;
//         this.accessPath.push(this);
//     }

//     outputFdrShape = (): FdrAPI.api.latest.EndpointDefinition => {
//         return {
//             id: FdrAPI.EndpointId(this.id),
//             method: this.method,
//             path: new PathNode(this.context, this.path, this.accessPath).outputFdrShape(),
//             auth: this.preProcessedInput.security
//                 ? new AuthSchemeIdsNode(this.context, this.preProcessedInput.security, this.accessPath).outputFdrShape()
//                 : undefined,
//             defaultEnvironment: undefined,
//             environments: undefined,
//             pathParameters: undefined,
//             queryParameters: undefined,
//         };
//     };
// }
