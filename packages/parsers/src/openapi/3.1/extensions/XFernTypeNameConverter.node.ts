// import {
//   BaseOpenApiV3_1ConverterNode,
//   BaseOpenApiV3_1ConverterNodeConstructorArgs,
// } from "../../BaseOpenApiV3_1Converter.node";
// import { extendType } from "../../utils/extendType";
// import { X_FERN_TYPE_NAME } from "./fernExtension.consts";

// export declare namespace XFernTypeNameConverterNode {
//   export interface Input {
//     [X_FERN_TYPE_NAME]?: string;
//   }
// }

// export class XFernTypeNameConverterNode extends BaseOpenApiV3_1ConverterNode<
//   unknown,
//   string
// > {
//   typeName?: string;

//   constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
//     super(args);
//     this.safeParse();
//   }

//   // This would be used to set a member on the node
//   parse(): void {
//     this.typeName = extendType<XFernTypeNameConverterNode.Input>(this.input)[
//       X_FERN_TYPE_NAME
//     ];
//   }

//   convert(): string | undefined {
//     return this.typeName;
//   }
// }
