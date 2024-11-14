import { Logger } from "@playwright/test";

export interface ApiNodeContext {
    orgId: string;
    apiId: string;
    logger: Logger;
}

export interface ApiNode<InputShape, FdrShape> {
    context: ApiNodeContext;
    preProcessedInput: InputShape;

    accessPath: ApiNode<unknown, unknown>[];
    name: string;

    qualifiedId: string;

    outputFdrShape: () => FdrShape;
}

export interface ComposableApiNode<T, InputNode extends ApiNode<unknown, T>, FdrShape>
    extends ApiNode<InputNode["preProcessedInput"], FdrShape> {
    inputNode: InputNode;

    outputFdrShape: () => T & FdrShape;
}
