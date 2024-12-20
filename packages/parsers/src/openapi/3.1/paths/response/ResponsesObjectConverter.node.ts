import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { STATUS_CODE_MESSAGES } from "../../../utils/statusCodes";
import { convertOperationObjectProperties } from "../parameters/ParameterBaseObjectConverter.node";
import { ResponseObjectConverterNode } from "./ResponseObjectConverter.node";

export class ResponsesObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
  OpenAPIV3_1.ResponsesObject,
  {
    responses: {
      headers: FernRegistry.api.latest.ObjectProperty[] | undefined;
      response: FernRegistry.api.latest.HttpResponse;
    }[];
    errors: FernRegistry.api.latest.ErrorResponse[];
  }
> {
  responsesByStatusCode:
    | Record<string, ResponseObjectConverterNode>
    | undefined;
  errorsByStatusCode: Record<string, ResponseObjectConverterNode> | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.ResponsesObject>
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    const defaultResponse = this.input["default"];
    Object.entries(this.input).forEach(([statusCode, response]) => {
      if (parseInt(statusCode) >= 400) {
        this.errorsByStatusCode ??= {};
        this.errorsByStatusCode[statusCode] = new ResponseObjectConverterNode({
          input: {
            ...defaultResponse,
            ...response,
          },
          context: this.context,
          accessPath: this.accessPath,
          pathId: "errors",
        });
      } else {
        this.responsesByStatusCode ??= {};
        this.responsesByStatusCode[statusCode] =
          new ResponseObjectConverterNode({
            input: {
              ...defaultResponse,
              ...response,
            },
            context: this.context,
            accessPath: this.accessPath,
            pathId: "responses",
          });
      }
    });
  }

  convertResponseObjectToHttpResponses(): {
    headers: FernRegistry.api.latest.ObjectProperty[] | undefined;
    response: FernRegistry.api.latest.HttpResponse;
  }[] {
    return Object.entries(this.responsesByStatusCode ?? {})
      .map(([statusCode, response]) => {
        // TODO: support multiple response types per response status code
        this.context.logger.info(
          "Accessing first response from ResponsesObjectConverterNode conversion."
        );
        const body = response.convert()?.[0];
        if (body == null) {
          return undefined;
        }
        return {
          headers: convertOperationObjectProperties(response.headers),
          response: {
            statusCode: parseInt(statusCode),
            body,
            description: response.description,
          },
        };
      })
      .filter(isNonNullish);
  }

  convertResponseObjectToErrors(): FernRegistry.api.latest.ErrorResponse[] {
    return Object.entries(this.errorsByStatusCode ?? {})
      .map(([statusCode, response]) => {
        this.context.logger.info(
          "Accessing first response from ResponseMediaTypeObjectConverterNode conversion."
        );

        // TODO: resolve reference here, if not done already
        const schema = response.responses?.[0]?.schema;
        const shape = schema?.convert();

        if (shape == null || schema == null) {
          return undefined;
        }

        return {
          statusCode: parseInt(statusCode),
          shape,
          description: response.description ?? schema.description,
          availability: schema.availability?.convert(),
          name:
            schema.name ??
            STATUS_CODE_MESSAGES[parseInt(statusCode)] ??
            "UNKNOWN ERROR",
          examples: Array.isArray(schema.examples)
            ? schema.examples.map((example) => ({
                name: schema.name,
                description: schema.description,
                responseBody: {
                  type: "json" as const,
                  value: example,
                },
              }))
            : [
                {
                  name: schema.name,
                  description: schema.description,
                  responseBody: {
                    type: "json" as const,
                    value: schema.examples,
                  },
                },
              ],
        };
      })
      .filter(isNonNullish);
  }

  convert():
    | {
        responses: {
          headers: FernRegistry.api.latest.ObjectProperty[] | undefined;
          response: FernRegistry.api.latest.HttpResponse;
        }[];
        errors: FernRegistry.api.latest.ErrorResponse[];
      }
    | undefined {
    return {
      responses: this.convertResponseObjectToHttpResponses(),
      errors: this.convertResponseObjectToErrors(),
    };
  }
}
