import { OpenAPIV3_1 } from "openapi-types";

import { isNonNullish } from "@fern-api/ui-core-utils";

import { FernRegistry } from "../../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { HttpMethod } from "../../../constants";
import { resolveResponseReference } from "../../../utils/3.1/resolveResponseReference";
import { isReferenceObject } from "../../guards/isReferenceObject";
import { ExampleObjectConverterNode } from "../ExampleObjectConverter.node";
import { ParameterBaseObjectConverterNode } from "../parameters/ParameterBaseObjectConverter.node";
import { RequestMediaTypeObjectConverterNode } from "../request/RequestMediaTypeObjectConverter.node";
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
    >,
    protected path: string,
    protected method: HttpMethod,
    protected statusCode: number,
    protected requests: RequestMediaTypeObjectConverterNode[],
    protected shapes: ExampleObjectConverterNode.Shapes
  ) {
    super(args);
    this.safeParse();
  }

  parse(streamingFormat: ResponseStreamingFormat | undefined): void {
    this.description = this.input.description;
    const input = resolveResponseReference(this.input, this.context.document);

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

    if (input.content == null) {
      this.responses ??= [];
      this.responses.push(
        new ResponseMediaTypeObjectConverterNode(
          {
            input: {},
            context: this.context,
            accessPath: this.accessPath,
            pathId: ["content"],
          },
          "empty",
          streamingFormat,
          this.path,
          this.method,
          this.statusCode,
          this.requests,
          this.shapes
        )
      );
    } else {
      Object.entries(input.content ?? {}).forEach(
        ([contentType, contentTypeObject]) => {
          this.responses ??= [];
          this.responses.push(
            new ResponseMediaTypeObjectConverterNode(
              {
                input: contentTypeObject,
                context: this.context,
                accessPath: this.accessPath,
                pathId: ["content", contentType],
              },
              contentType,
              streamingFormat,
              this.path,
              this.method,
              this.statusCode,
              this.requests,
              // TODO: add response headers, but this needs to be added to FDR shape
              this.shapes
            )
          );
        }
      );
    }
  }

  convert(): FernRegistry.api.latest.HttpResponseBodyShape[] | undefined {
    return this.responses
      ?.flatMap((response) => response.convert())
      .filter(isNonNullish);
  }
}
