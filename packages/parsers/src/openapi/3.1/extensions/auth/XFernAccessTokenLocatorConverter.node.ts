import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../../utils/extendType";
import { isValidJsonPath } from "../../../utils/isValidJsonPath";
import { X_FERN_ACCESS_TOKEN_LOCATOR } from "../fernExtension.consts";

export declare namespace XFernAccessTokenLocatorConverterNode {
    export interface Input {
        [X_FERN_ACCESS_TOKEN_LOCATOR]?: string;
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
            X_FERN_ACCESS_TOKEN_LOCATOR
        ];
        if (this.accessTokenLocator != null) {
            if (!isValidJsonPath(this.accessTokenLocator)) {
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
