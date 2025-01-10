import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { maybeSingleValueToArray } from "../../../utils/maybeSingleValueToArray";
import { STATUS_CODE_MESSAGES } from "../../../utils/statusCodes";
import { RedocExampleConverterNode } from "../../extensions/examples/RedocExampleConverter.node";
import { convertOperationObjectProperties } from "../parameters/ParameterBaseObjectConverter.node";
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
    protected redocExamplesNode: RedocExampleConverterNode | undefined
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    const defaultResponse = this.input.default;
    Object.entries(this.input).forEach(([statusCode, response]) => {
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
          parseInt(statusCode),
          this.redocExamplesNode
        );
      } else {
        this.responsesByStatusCode ??= {};
        this.responsesByStatusCode[statusCode] =
          new ResponseObjectConverterNode(
            {
              input: {
                ...defaultResponse,
                ...response,
              },
              context: this.context,
              accessPath: this.accessPath,
              pathId: "responses",
            },
            this.path,
            parseInt(statusCode),
            this.redocExamplesNode
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
        return (
          convertOperationObjectProperties(response.headers) ?? [undefined]
        ).flatMap((headers) =>
          bodies?.map((body) => ({
            headers,
            response: {
              statusCode: parseInt(statusCode),
              body,
              description: response.description,
            },
            examples: (response.responses ?? []).flatMap((response) =>
              (response.examples ?? [])
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
        // TODO: resolve reference here, if not done already
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
