import type { OpenrpcDocument } from "@open-rpc/meta-schema";
import {
  BaseApiConverterNode,
  BaseApiConverterNodeContext,
} from "../BaseApiConverter.node";

export abstract class BaseOpenrpc_ConverterNodeContext extends BaseApiConverterNodeContext {
  public abstract document: OpenrpcDocument;
}

export type BaseOpenrpc_ConverterNodeConstructorArgs<Input> = {
  input: Input;
  context: BaseOpenrpc_ConverterNodeContext;
  readonly accessPath: string[];
  readonly pathId: string;
};

export abstract class BaseOpenApiV3_1ConverterNode<
  Input,
  Output,
> extends BaseApiConverterNode<Input, Output> {
  protected override readonly context: BaseOpenrpc_ConverterNodeContext;
  protected readonly accessPath: string[];
  protected readonly pathId: string;

  constructor({
    input,
    context,
    accessPath,
    pathId,
  }: BaseOpenrpc_ConverterNodeConstructorArgs<Input>) {
    super(input, context);

    this.context = context;
    this.accessPath = [...accessPath];
    this.pathId = pathId;

    if (
      this.pathId &&
      this.pathId !== this.accessPath[this.accessPath.length - 1]
    ) {
      this.accessPath.push(this.pathId);
      context.logger.debug(`Processing #/${this.accessPath.join("/")}`);
    }
  }

  abstract parse(...additionalArgs: unknown[]): void;

  safeParse(...additionalArgs: unknown[]): void {
    try {
      this.parse(...additionalArgs);
    } catch {
      this.context.errors.error({
        message:
          "Error converting node. Please contact support if the error persists",
        path: this.accessPath,
      });
    }
  }
}
