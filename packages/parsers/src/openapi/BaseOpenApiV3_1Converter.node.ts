import { OpenAPIV3_1 } from "openapi-types";
import {
  BaseApiConverterNode,
  BaseApiConverterNodeContext,
} from "../BaseApiConverter.node";
import { toOpenApiPath } from "./utils/toOpenApiPath";

export abstract class BaseOpenApiV3_1ConverterNodeContext extends BaseApiConverterNodeContext {
  public abstract document: OpenAPIV3_1.Document;
}

export type BaseOpenApiV3_1ConverterNodeConstructorArgs<Input> = {
  input: Input;
  context: BaseOpenApiV3_1ConverterNodeContext;
  readonly accessPath: string[];
  readonly pathId: string;
};

export abstract class BaseOpenApiV3_1ConverterNode<
  Input,
  Output,
> extends BaseApiConverterNode<Input, Output> {
  protected override readonly context: BaseOpenApiV3_1ConverterNodeContext;
  protected readonly accessPath: string[];
  protected readonly pathId: string;

  constructor({
    input,
    context,
    accessPath,
    pathId,
  }: BaseOpenApiV3_1ConverterNodeConstructorArgs<Input>) {
    super(input, context);

    this.context = context;
    this.accessPath = [...accessPath];
    this.pathId = pathId;

    if (
      this.pathId &&
      this.pathId !== this.accessPath[this.accessPath.length - 1]
    ) {
      this.accessPath.push(this.pathId);
      context.logger.debug(`Processing ${toOpenApiPath(this.accessPath)}`);
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

export abstract class BaseOpenApiV3_1ConverterNodeWithExample<
  Input,
  Output,
> extends BaseOpenApiV3_1ConverterNode<Input, Output> {
  abstract example(): unknown | undefined;
}
