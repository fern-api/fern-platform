// import {
//   BaseOpenApiV3_1ConverterNode,
//   BaseOpenApiV3_1ConverterNodeConstructorArgs,
// } from "../../BaseOpenApiV3_1Converter.node";
// import { extendType } from "../../utils/extendType";
// import { X_FERN_STREAMING } from "./fernExtension.consts";

// export declare namespace XFernStreamingConverterNode {
//   export interface Input {
//     [X_FERN_STREAMING]?: boolean;
//   }
// }

// export class XFernStreamingConverterNode extends BaseOpenApiV3_1ConverterNode<
//   unknown,
//   boolean
// > {
//   streaming?: boolean;

//   constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
//     super(args);
//     this.safeParse();
//   }

//   // This would be used to set a member on the node
//   parse(): void {
//     this.streaming = extendType<XFernStreamingConverterNode.Input>(this.input)[
//       X_FERN_STREAMING
//     ];
//   }

//   convert(): boolean | undefined {
//     return this.streaming;
//   }
// }
