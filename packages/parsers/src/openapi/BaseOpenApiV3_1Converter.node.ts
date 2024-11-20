import { BaseAPIConverterNode, BaseAPIConverterNodeContext } from "../BaseApiConverter.node";
import { toOpenApiPath } from "./utils/toOpenApiPath";

export abstract class BaseOpenApiV3_1Node<Input, Output> extends BaseAPIConverterNode<Input, Output> {
    constructor(
        input: Input,
        context: BaseAPIConverterNodeContext,
        readonly accessPath: string[],
        pathId: string,
    ) {
        super(input, context);
        if (pathId && pathId !== accessPath[accessPath.length - 1]) {
            accessPath.push(pathId);
            context.logger.info(`Processing ${toOpenApiPath(accessPath)}`);
        }
    }
}
