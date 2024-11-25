import { OpenAPIV3_1 } from "openapi-types";
import { BaseAPIConverterNode, BaseAPIConverterNodeContext } from "../BaseApiConverter.node";
import { toOpenApiPath } from "./utils/toOpenApiPath";

export abstract class BaseOpenApiV3_1ConverterNodeContext extends BaseAPIConverterNodeContext {
    public abstract document: OpenAPIV3_1.Document;
}

export type BaseOpenApiV3_1NodeConstructorArgs<Input> = ConstructorParameters<
    typeof BaseOpenApiV3_1Node<Input, unknown>
>;

export abstract class BaseOpenApiV3_1Node<Input, Output> extends BaseAPIConverterNode<Input, Output> {
    protected override context: BaseOpenApiV3_1ConverterNodeContext;

    constructor(
        input: Input,
        context: BaseOpenApiV3_1ConverterNodeContext,
        protected readonly accessPath: string[],
        protected readonly pathId: string,
    ) {
        super(input, context);

        this.context = context;

        if (pathId && pathId !== accessPath[accessPath.length - 1]) {
            accessPath.push(pathId);
            context.logger.info(`Processing ${toOpenApiPath(accessPath)}`);
        }
    }

    abstract parse(...additionalArgs: unknown[]): void;

    safeParse(...additionalArgs: unknown[]): void {
        try {
            this.parse(...additionalArgs);
        } catch (error: Error | unknown) {
            this.context.errors.error({
                message: "Error converting node. Please contact support if the error persists.",
                path: this.accessPath,
            });
        }
    }
}
