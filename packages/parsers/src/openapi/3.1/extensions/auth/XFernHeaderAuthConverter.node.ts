import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../../utils/extendType";
import { xFernHeaderAuthKey } from "../fernExtension.consts";
import { HeaderTokenSecurityScheme } from "./types/TokenSecurityScheme";

export declare namespace XFernHeaderAuthConverterNode {
    export interface Input {
        [xFernHeaderAuthKey]?: HeaderTokenSecurityScheme;
    }
}

export class XFernHeaderAuthConverterNode extends BaseOpenApiV3_1ConverterNode<
    unknown,
    HeaderTokenSecurityScheme
> {
    headerVariableName: string | undefined;
    headerEnvVar: string | undefined;
    headerPrefix: string | undefined;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        const headerAuth = extendType<XFernHeaderAuthConverterNode.Input>(
            this.input
        )[xFernHeaderAuthKey];
        this.headerVariableName = headerAuth?.name;
        this.headerEnvVar = headerAuth?.env;
        this.headerPrefix = headerAuth?.prefix;
    }

    convert(): HeaderTokenSecurityScheme | undefined {
        return {
            name: this.headerVariableName,
            env: this.headerEnvVar,
            prefix: this.headerPrefix,
        };
    }
}
