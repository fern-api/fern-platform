import jp from "jsonpath";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../../utils/extendType";

const headerVariableNameExtensionKey = "x-fern-access-token-locator";

export declare namespace XFernAccessTokenLocatorConverterNode {
    export interface Input {
        [headerVariableNameExtensionKey]?: string;
    }
}

export class XFernAccessTokenLocatorConverterNode extends BaseOpenApiV3_1ConverterNode<unknown, string> {
    accessTokenLocator: string | undefined;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.accessTokenLocator = extendType<XFernAccessTokenLocatorConverterNode.Input>(this.input)[
            headerVariableNameExtensionKey
        ];
        if (this.accessTokenLocator != null) {
            try {
                jp.parse(this.accessTokenLocator);
            } catch (e) {
                this.context.errors.error({
                    message: "Invalid access token locator, must be a valid jq path",
                    path: this.accessPath,
                });
                this.accessTokenLocator = undefined;
            }
        }
    }

    convert(): string | undefined {
        return this.accessTokenLocator;
    }
}
