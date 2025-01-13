import type { OpenrpcDocument } from "@open-rpc/meta-schema";
import {
  BaseApiConverterNode,
  BaseApiConverterNodeContext,
} from "../BaseApiConverter.node";

export abstract class BaseOpenrpcConverterNodeContext extends BaseApiConverterNodeContext {
  public abstract document: OpenrpcDocument;
}

export type BaseOpenrpcConverterNodeConstructorArgs<Input> = {
  input: Input;
  context: BaseOpenrpcConverterNodeContext;
  readonly accessPath: string[];
  readonly pathId: string;
};

export abstract class BaseOpenrpcConverterNode<
  Input,
  Output,
> extends BaseApiConverterNode<Input, Output> {
  protected override readonly context: BaseOpenrpcConverterNodeContext;
  protected readonly accessPath: string[];
  protected readonly pathId: string;

  constructor({
    input,
    context,
    accessPath,
    pathId,
  }: BaseOpenrpcConverterNodeConstructorArgs<Input>) {
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
