import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../../client/generated";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { resolveResponseReference } from "../../../utils/3.1/resolveResponseReference";
import { isReferenceObject } from "../../guards/isReferenceObject";
import { ParameterBaseObjectConverterNode } from "../parameters/ParameterBaseObjectConverter.node";
import {
    ResponseMediaTypeObjectConverterNode,
    ResponseStreamingFormat,
} from "./ResponseMediaTypeObjectConverter.node";

export class ResponseObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
    OpenAPIV3_1.ResponseObject | OpenAPIV3_1.ReferenceObject,
    FernRegistry.api.latest.HttpResponseBodyShape[]
> {
    headers: Record<string, ParameterBaseObjectConverterNode> | undefined;
    responses: ResponseMediaTypeObjectConverterNode[] | undefined;
    description: string | undefined;

    constructor(
        args: BaseOpenApiV3_1ConverterNodeConstructorArgs<
            OpenAPIV3_1.ResponseObject | OpenAPIV3_1.ReferenceObject
        >
    ) {
        super(args);
        this.safeParse();
    }

    parse(streamingFormat: ResponseStreamingFormat | undefined): void {
        this.description = this.input.description;
        const input = resolveResponseReference(
            this.input,
            this.context.document
        );

        if (input == null) {
            this.context.errors.error({
                message: isReferenceObject(this.input)
                    ? `Undefined reference: ${this.input.$ref}`
                    : "Expected response, received null",
                path: this.accessPath,
            });
            return;
        }

        Object.entries(input.headers ?? {}).forEach(([headerName, schema]) => {
            this.headers ??= {};
            this.headers[headerName] = new ParameterBaseObjectConverterNode({
                input: schema,
                context: this.context,
                accessPath: this.accessPath,
                pathId: "headers",
            });
        });
        Object.entries(input.content ?? {}).forEach(
            ([contentType, contentTypeObject]) => {
                this.responses ??= [];
                this.responses.push(
                    new ResponseMediaTypeObjectConverterNode(
                        {
                            input: contentTypeObject,
                            context: this.context,
                            accessPath: this.accessPath,
                            pathId: "content",
                        },
                        contentType,
                        streamingFormat
                    )
                );
            }
        );
    }

    convert(): FernRegistry.api.latest.HttpResponseBodyShape[] | undefined {
        return this.responses
            ?.map((response) => response.convert())
            .filter(isNonNullish);
    }
}
