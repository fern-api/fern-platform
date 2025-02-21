// import {
//   BaseOpenApiV3_1ConverterNode,
//   BaseOpenApiV3_1ConverterNodeConstructorArgs,
// } from "../../BaseOpenApiV3_1Converter.node";
// import { extendType } from "../../utils/extendType";
// import { X_FERN_IGNORE } from "./fernExtension.consts";

// export declare namespace XFernIgnoreConverterNode {
//   export interface Input {
//     [X_FERN_IGNORE]?: boolean;
//   }
// }

// export class XFernIgnoreConverterNode extends BaseOpenApiV3_1ConverterNode<
//   unknown,
//   boolean
// > {
//   ignore?: boolean;

//   constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
//     super(args);
//     this.safeParse();
//   }

//   // This would be used to set a member on the node
//   parse(): void {
//     this.ignore = extendType<XFernIgnoreConverterNode.Input>(this.input)[
//       X_FERN_IGNORE
//     ];
//   }

//   convert(): boolean | undefined {
//     return this.ignore;
//   }
// }
