import { FernDefinition } from "@fern-fern/docs-parsers-fern-definition";
import { FernRegistry } from "../../../../client/generated";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";

export class ExampleEndpointCallConverterNode extends BaseOpenApiV3_1ConverterNode<
    FernDefinition.ExampleEndpointCallSchema,
    FernRegistry.api.latest.ExampleEndpointCall
> {
    name: string | undefined;

    constructor(
        args: BaseOpenApiV3_1ConverterNodeConstructorArgs<FernDefinition.ExampleEndpointCallSchema>,
        protected path: string,
        protected responseStatusCode: number,
        protected description: string,
    ) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.name = this.input.name;
        this.input["path-parameters"];
    }

    convert(): FernRegistry.api.latest.ExampleEndpointCall | undefined {
        return {
            name: this.name,
            description: this.description,
            path: this.path,
            responseStatusCode: this.responseStatusCode,
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: undefined,
            responseBody: undefined,
            snippets: undefined,
        };
    }
}
