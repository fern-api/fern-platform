// import { ApiNode, ApiNodeContext } from "../interfaces/api.node.interface";

// import { FdrAPI } from "@fern-api/fdr-sdk";
// import { PathPartNode } from "./pathPart.node";

// export class PathNode implements ApiNode<string, FdrAPI.api.latest.PathPart[]> {
//     name = "path";
//     qualifiedId: string;

//     constructor(
//         readonly context: ApiNodeContext,
//         readonly preProcessedInput: string,
//         readonly accessPath: ApiNode<unknown, unknown>[],
//     ) {
//         this.qualifiedId = `${this.accessPath.map((node) => node.qualifiedId).join(".")}.${this.name}`;
//         this.accessPath.push(this);
//     }

//     outputFdrShape = (): FdrAPI.api.latest.PathPart[] => {
//         return this.preProcessedInput
//             .split("/")
//             .map((part) => new PathPartNode(this.context, part, this.accessPath).outputFdrShape());
//     };
// }
