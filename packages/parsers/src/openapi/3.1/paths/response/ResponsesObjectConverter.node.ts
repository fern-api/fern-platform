import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { HttpMethod } from "../../../constants";
import { maybeSingleValueToArray } from "../../../utils/maybeSingleValueToArray";
import { singleUndefinedArrayIfNullOrEmpty } from "../../../utils/singleUndefinedArrayIfNullOrEmpty";
import { STATUS_CODE_MESSAGES } from "../../../utils/statusCodes";
import { ExampleObjectConverterNode } from "../ExampleObjectConverter.node";
import { convertOperationObjectProperties } from "../parameters/ParameterBaseObjectConverter.node";
import { RequestMediaTypeObjectConverterNode } from "../request/RequestMediaTypeObjectConverter.node";
import { ResponseObjectConverterNode } from "./ResponseObjectConverter.node";

export declare namespace ResponsesObjectConverterNode {
  export type Output = {
    responses: {
      headers: FernRegistry.api.latest.ObjectProperty[] | undefined;
      response: FernRegistry.api.latest.HttpResponse;
      examples: FernRegistry.api.latest.ExampleEndpointCall[];
    }[];
    errors: FernRegistry.api.latest.ErrorResponse[];
  };
}

export class ResponsesObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
  OpenAPIV3_1.ResponsesObject,
  ResponsesObjectConverterNode.Output
> {
  responsesByStatusCode:
    | Record<string, ResponseObjectConverterNode>
    | undefined;
  errorsByStatusCode: Record<string, ResponseObjectConverterNode> | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.ResponsesObject>,
    protected path: string,
    protected method: HttpMethod,
    protected requests: RequestMediaTypeObjectConverterNode[],
    protected shapes: ExampleObjectConverterNode.Shapes
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    const defaultResponse = this.input.default;
    Object.entries(this.input).forEach(([statusCode, response]) => {
      if (statusCode === "default") {
        return;
      }

      if (parseInt(statusCode) >= 400) {
        this.errorsByStatusCode ??= {};
        this.errorsByStatusCode[statusCode] = new ResponseObjectConverterNode(
          {
            input: {
              ...defaultResponse,
              ...response,
            },
            context: this.context,
            accessPath: this.accessPath,
            pathId: "errors",
          },
          this.path,
          this.method,
          parseInt(statusCode),
          [],
          this.shapes
        );
      } else {
        this.responsesByStatusCode ??= {};
        this.responsesByStatusCode[statusCode] =
          new ResponseObjectConverterNode(
            {
              input: response,
              context: this.context,
              accessPath: this.accessPath,
              pathId: "responses",
            },
            this.path,
            this.method,
            parseInt(statusCode),
            this.requests,
            this.shapes
          );
      }
    });
  }

  convertResponseObjectToHttpResponses(): ResponsesObjectConverterNode.Output["responses"] {
    return Object.entries(this.responsesByStatusCode ?? {})
      .flatMap(([statusCode, response]) => {
        const bodies = response.convert();
        if (bodies == null) {
          return undefined;
        }

        return singleUndefinedArrayIfNullOrEmpty(
          convertOperationObjectProperties(response.headers)
        ).flatMap((headers) =>
          bodies?.map((body) => ({
            headers,
            response: {
              statusCode: parseInt(statusCode),
              body,
              description: response.description,
            },
            examples: (response.responses ?? []).flatMap((res) =>
              (res.examples ?? [])
                .map((example) => example.convert())
                .filter(isNonNullish)
            ),
          }))
        );
      })
      .filter(isNonNullish);
  }

  convertResponseObjectToErrors(): FernRegistry.api.latest.ErrorResponse[] {
    return Object.entries(this.errorsByStatusCode ?? {})
      .flatMap(([statusCode, response]) => {
        return response.responses?.flatMap((res) => {
          const schema = res.schema;
          const maybeShapes = maybeSingleValueToArray(schema?.convert());

          if (schema == null) {
            return undefined;
          }

          return maybeShapes
            ?.map((shape) => ({
              statusCode: parseInt(statusCode),
              shape,
              description: response.description ?? schema.description,
              availability: schema.availability?.convert(),
              name:
                schema.name ??
                STATUS_CODE_MESSAGES[parseInt(statusCode)] ??
                "UNKNOWN ERROR",
              examples: res.examples
                ?.map((example) => {
                  const convertedExample = example.convert();
                  if (convertedExample == null) {
                    return undefined;
                  }

                  if (convertedExample.responseBody?.type !== "json") {
                    return undefined;
                  }

                  return {
                    name: convertedExample.name,
                    description: convertedExample.description,
                    responseBody: convertedExample.responseBody,
                  };
                })
                .filter(isNonNullish),
            }))
            .filter(isNonNullish);
        });
      })
      .filter(isNonNullish);
  }

  convert(): ResponsesObjectConverterNode.Output | undefined {
    return {
      responses: this.convertResponseObjectToHttpResponses(),
      errors: this.convertResponseObjectToErrors(),
    };
  }
}
