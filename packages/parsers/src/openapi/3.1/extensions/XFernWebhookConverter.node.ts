import { BaseOpenApiV3_1ConverterNode } from "../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../utils/extendType";
import { X_FERN_WEBHOOK } from "./fernExtension.consts";

export declare namespace XFernWebhookConverterNode {
    export interface Input {
        [X_FERN_WEBHOOK]?: boolean;
    }
}

export class XFernWebhookConverterNode extends BaseOpenApiV3_1ConverterNode<unknown, boolean> {
    isWebhook?: boolean;

    parse(): void {
        this.isWebhook = extendType<XFernWebhookConverterNode.Input>(this.input)[X_FERN_WEBHOOK];
    }
    convert(): boolean | undefined {
        return this.isWebhook ? undefined : undefined;
    }
}
