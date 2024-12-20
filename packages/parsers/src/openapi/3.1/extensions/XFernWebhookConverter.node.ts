import { BaseOpenApiV3_1ConverterNode } from "../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../utils/extendType";
import { X_FERN_WEBHOOK } from "./fernExtension.consts";

export declare namespace XFernWebhookConverterNode {
<<<<<<< HEAD
    export interface Input {
        [X_FERN_WEBHOOK]?: boolean;
    }
=======
  export interface Input {
    [X_FERN_WEBHOOK]?: boolean;
  }
>>>>>>> main
}

export class XFernWebhookConverterNode extends BaseOpenApiV3_1ConverterNode<
  unknown,
  boolean
> {
  isWebhook?: boolean;

<<<<<<< HEAD
    parse(): void {
        this.isWebhook = extendType<XFernWebhookConverterNode.Input>(this.input)[X_FERN_WEBHOOK];
    }
    convert(): boolean | undefined {
        return this.isWebhook ? undefined : undefined;
    }
=======
  parse(): void {
    this.isWebhook = extendType<XFernWebhookConverterNode.Input>(this.input)[
      X_FERN_WEBHOOK
    ];
  }
  convert(): boolean | undefined {
    return this.isWebhook ? undefined : undefined;
  }
>>>>>>> main
}
