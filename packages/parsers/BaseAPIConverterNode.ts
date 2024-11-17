import { ErrorCollector } from "./ErrorCollector";

/**
 * Base context class for API converter nodes.
 * Provides logging and error collection capabilities.
 */
export abstract class BaseAPIConverterNodeContext {
    public readonly logger: Console = console;
    public readonly errors: ErrorCollector = new ErrorCollector();
}

/**
 * APIConverterNode is responsible for converting API concepts between different API definition formats.
 * It takes an input from one API definition format and transforms it into an equivalent output
 * in another format. For example, it can convert an OpenAPI operation into an FDR endpoint definition,
 * preserving the semantic meaning while adapting to the target format's structure.
 *
 * @typeparam Input - The type from the source format
 * @typeparam Output - The type from the target format
 */
export abstract class BaseAPIConverterNode<Input, Output> {
    constructor(
        protected readonly input: Input,
        protected readonly context: BaseAPIConverterNodeContext,
    ) {}

    /**
     * @returns The converted API definition in the target output format
     */
    public abstract convert(): Output;
}
