import { Logger } from "@playwright/test";

export class ErrorCollector {
    errors: string[] = [];

    addError(error: string): void {
        this.errors.push(error);
    }
}

export interface ApiNodeContext {
    orgId: string;
    apiId: string;
    logger: Logger;
    errorCollector: ErrorCollector;
}

export interface ApiNode<InputShape, FdrShape> {
    context: ApiNodeContext;
    input: InputShape;

    accessPath: ApiNode<unknown, unknown>[];
    id: string;

    outputFdrShape: () => FdrShape;
}

export interface ComposableApiNode<T, InputNode extends ApiNode<unknown, T>, FdrShape>
    extends ApiNode<InputNode["input"], FdrShape> {
    inputNode: InputNode;

    outputFdrShape: () => T & FdrShape;
}
