import { FernDefinition } from "@fern-fern/docs-parsers-fern-definition";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../utils/extendType";
import {
    ParameterBaseObjectConverterNode,
    RequestBodyObjectConverterNode,
    ResponsesObjectConverterNode,
} from "../paths";
import { xFernExamplesKey } from "./fernExtension.consts";

export declare namespace XFernEndpointExampleConverterNode {
    interface Input {
        [xFernExamplesKey]?: FernDefinition.ExampleEndpointCallSchema[];
        example?: OpenAPIV3_1.ExampleObject;
    }
}

export class XFernEndpointExampleConverterNode extends BaseOpenApiV3_1ConverterNode<
    unknown,
    FernRegistry.api.latest.ExampleEndpointCall
> {
    examples: FernDefinition.ExampleEndpointCallSchema[] | undefined;
    openApiExample: OpenAPIV3_1.ExampleObject | undefined;
    description: string | undefined;

    constructor(
        args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>,
        protected path: string,
        protected responseStatusCode: number,
        protected requests: RequestBodyObjectConverterNode | undefined,
        protected responses: ResponsesObjectConverterNode | undefined,
        protected pathParameters: Record<string, ParameterBaseObjectConverterNode> | undefined,
        protected queryParameters: Record<string, ParameterBaseObjectConverterNode> | undefined,
        protected requestHeaders: Record<string, ParameterBaseObjectConverterNode> | undefined,
    ) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        const input = extendType<XFernEndpointExampleConverterNode.Input>(this.input);
        this.examples = input[xFernExamplesKey];
        this.openApiExample = input.example?.value;
        this.description = input.example?.description;

        // if (!ajv.validate(this.request?.requestBodiesByContentType, this.openApiExample)) {
        //     this.context.errors.error({
        //         message: "Invalid example object",
        //         path: [...this.accessPath, "example"],
        //     });
        // }
    }

    convert(): FernRegistry.api.latest.ExampleEndpointCall[] | undefined {
        if (this.examples == null) {
            return undefined;
        }

        return this.examples.map((example) => ({
            path: this.path,
            responseStatusCode: this.responseStatusCode,
            name: example.name,
            description: this.description,
            pathParameters: example["path-parameters"],
            queryParameters: example["query-parameters"],
            headers: example.headers,
            requestBody: example.request,
            responseBody: example.response,
            snippets: example["code-samples"],
        }));
    }
}
