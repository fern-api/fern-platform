// import { ApiNode, ApiNodeContext } from "../interfaces/api.node.interface";

// import { FdrAPI } from "@fern-api/fdr-sdk";

// export class PathPartNode implements ApiNode<string, FdrAPI.api.latest.PathPart> {
//     name = "pathPart";
//     qualifiedId: string;

//     constructor(
//         readonly context: ApiNodeContext,
//         readonly preProcessedInput: string,
//         readonly accessPath: ApiNode<unknown, unknown>[],
//     ) {
//         this.qualifiedId = `${this.accessPath.map((node) => node.qualifiedId).join(".")}.${this.name}`;
//         this.accessPath.push(this);
//     }

//     outputFdrShape = (): FdrAPI.api.latest.PathPart => {
//         return this.preProcessedInput.startsWith("{") && this.preProcessedInput.endsWith("}")
//             ? {
//                   type: "pathParameter",
//                   value: FdrAPI.PropertyKey(this.preProcessedInput.slice(1, -1)),
//               }
//             : {
//                   type: "literal",
//                   value: this.preProcessedInput,
//               };
//     };
// }
