import { FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { convertToObjectProperties } from "../../../utils/3.1/convertToObjectProperties";
import { ResponseObjectConverterNode } from "./ResponseObjectConverter.node";

export class ResponsesObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
    OpenAPIV3_1.ResponsesObject,
    {
        responses: {
            headers: FdrAPI.api.latest.ObjectProperty[] | undefined;
            response: FdrAPI.api.latest.HttpResponse;
        }[];
        errors: FdrAPI.api.latest.ErrorResponse[];
    }
> {
    responsesByStatusCode: Record<string, ResponseObjectConverterNode> | undefined;
    errorsByStatusCode: Record<string, ResponseObjectConverterNode> | undefined;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.ResponsesObject>) {
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
                this.responsesByStatusCode[statusCode] = new ResponseObjectConverterNode({
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
        headers: FdrAPI.api.latest.ObjectProperty[] | undefined;
        response: FdrAPI.api.latest.HttpResponse;
    }[] {
        return Object.entries(this.responsesByStatusCode ?? {})
            .map(([statusCode, response]) => {
                // TODO: support multiple response types per response status code
                const body = response.convert()?.[0];
                if (body == null) {
                    return undefined;
                }
                return {
                    headers: convertToObjectProperties(response.headers),
                    response: {
                        statusCode: parseInt(statusCode),
                        body,
                        description: response.description,
                    },
                };
            })
            .filter(isNonNullish);
    }

    convertResponseObjectToErrors(): FdrAPI.api.latest.ErrorResponse[] {
        return Object.entries(this.errorsByStatusCode ?? {})
            .map(([statusCode, response]) => {
                const schema = response.responses?.[0]?.schema;
                const shape = schema?.convert();

                if (shape == null || schema == null) {
                    return undefined;
                }
                // console.log(JSON.stringify(response, null, 2));
                return {
                    statusCode: parseInt(statusCode),
                    shape,
                    description: response.description ?? schema.description,
                    availability: schema.availability?.convert(),
                    name: "dummy error",
                    examples: undefined,
                };
            })
            .filter(isNonNullish);
    }

    convert():
        | {
              responses: {
                  headers: FdrAPI.api.latest.ObjectProperty[] | undefined;
                  response: FdrAPI.api.latest.HttpResponse;
              }[];
              errors: FdrAPI.api.latest.ErrorResponse[];
          }
        | undefined {
        return {
            responses: this.convertResponseObjectToHttpResponses(),
            errors: this.convertResponseObjectToErrors(),
        };
    }
}
