import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../../utils/extendType";

const bearerFormatExtensionKey = "x-bearer-format";

export declare namespace XFernBearerFormatConverterNode {
    export interface Input {
        [bearerFormatExtensionKey]?: string;
    }
}

export class XFernBearerFormatConverterNode extends BaseOpenApiV3_1ConverterNode<unknown, string | undefined> {
    bearerFormat: string | undefined;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.bearerFormat = extendType<XFernBearerFormatConverterNode.Input>(this.input)[bearerFormatExtensionKey];
    }

    convert(): string | undefined {
        return this.bearerFormat;
    }
}
