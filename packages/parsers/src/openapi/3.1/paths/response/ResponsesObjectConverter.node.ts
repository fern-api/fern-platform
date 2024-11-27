import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { isNonNullish } from "../../../../../../commons/core-utils/src/isNonNullish";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { ResponseObjectConverterNode } from "./ResponseObjectConverter.node";

export class ResponsesObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
    OpenAPIV3_1.ResponsesObject,
    FdrAPI.api.latest.HttpResponse[]
> {
    responsesByStatusCode: Record<string, ResponseObjectConverterNode> | undefined;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.ResponsesObject>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.responsesByStatusCode = Object.fromEntries(
            Object.entries(this.input).map(([statusCode, response]) => {
                return [
                    statusCode,
                    new ResponseObjectConverterNode({
                        input: response,
                        context: this.context,
                        accessPath: this.accessPath,
                        pathId: "responses",
                    }),
                ];
            }),
        );
    }

    convertResponseObjectToHttpResponses(): FdrAPI.api.latest.HttpResponse[] {
        return Object.entries(this.responsesByStatusCode ?? {})
            .map(([statusCode, response]) => {
                // TODO: support multiple response types per response status code
                const body = response.convert()?.[0];
                if (body == null) {
                    return undefined;
                }
                return {
                    statusCode: parseInt(statusCode),
                    body,
                    description: response.description,
                };
            })
            .filter(isNonNullish);
    }

    convert(): FdrAPI.api.latest.HttpResponse[] | undefined {
        return this.convertResponseObjectToHttpResponses();
    }
}
