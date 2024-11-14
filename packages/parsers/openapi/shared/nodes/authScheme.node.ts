// import { FdrAPI } from "@fern-api/fdr-sdk";
// import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
// import { ApiNode, ApiNodeContext } from "../interfaces/api.node.interface";

// export class AuthSchemeIdsNode
//     implements ApiNode<OpenAPIV3_1.SecurityRequirementObject[], FdrAPI.api.latest.AuthSchemeId[]>
// {
//     name = "authSchemeIds";

//     constructor(
//         readonly context: ApiNodeContext,
//         readonly preProcessedInput: OpenAPIV3_1.SecurityRequirementObject[],
//         readonly accessPath: ApiNode<unknown, unknown>[],
//     ) {
//         this.id = `${this.accessPath.map((node) => node.id).join(".")}.AuthSchemeIdsNode`;
//         this.accessPath.push(this);
//     }
//     input: OpenAPIV3.SecurityRequirementObject[];
//     id: string;

//     outputFdrShape = (): FdrAPI.api.latest.AuthSchemeId[] => {
//         return this.preProcessedInput.map((authScheme) => FdrAPI.AuthSchemeId(authScheme[0]));
//     };
// }
