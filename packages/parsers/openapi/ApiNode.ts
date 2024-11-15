import { Logger } from "@playwright/test";
import { ErrorCollector } from "./ErrorCollector";

export interface ApiNodeContext {
    orgId: string;
    apiId: string;
    logger: Logger;
    errorCollector: ErrorCollector;
}

abstract class ApiNode<InputShape, FdrShape> {
    context: ApiNodeContext;
    input: InputShape;

    accessPath: string[];

    constructor(context: ApiNodeContext, input: InputShape, accessPath: string[]) {
        this.context = context;
        this.input = input;
        this.accessPath = accessPath;
    }

    abstract toFdrShape: () => FdrShape | undefined;
}

export abstract class InputApiNode<InputShape, FdrShape> extends ApiNode<InputShape, FdrShape> {
    constructor(context: ApiNodeContext, input: InputShape, accessPath: string[], pathId?: string) {
        if (pathId) {
            accessPath.push(pathId);
            context.logger.log("a", "info", `Processing #/${accessPath.join("/")}/${pathId}`);
        }
        super(context, input, accessPath);
    }
}

export abstract class OutputApiNode<InputShape, FdrShape> extends ApiNode<InputShape, FdrShape> {}
