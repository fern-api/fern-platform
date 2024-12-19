import { BaseOpenApiV3_1ConverterNode } from "../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../utils/extendType";
import { xFernWebhookKey } from "./fernExtension.consts";

export declare namespace XFernWebhookConverterNode {
    export interface Input {
        [xFernWebhookKey]?: boolean;
    }
}

export class XFernWebhookConverterNode extends BaseOpenApiV3_1ConverterNode<
    unknown,
    boolean
> {
    isWebhook?: boolean;

    parse(): void {
        this.isWebhook = extendType<XFernWebhookConverterNode.Input>(
            this.input
        )[xFernWebhookKey];
    }
    convert(): boolean | undefined {
        return this.isWebhook ? undefined : undefined;
    }
}
