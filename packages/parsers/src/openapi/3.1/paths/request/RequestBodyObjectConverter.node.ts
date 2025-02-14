import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { HttpMethod } from "../../../constants";
import { resolveRequestReference } from "../../../utils/3.1/resolveRequestReference";
import { maybeSingleValueToArray } from "../../../utils/maybeSingleValueToArray";
import { RequestMediaTypeObjectConverterNode } from "./RequestMediaTypeObjectConverter.node";

export class RequestBodyObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
  OpenAPIV3_1.RequestBodyObject | OpenAPIV3_1.ReferenceObject,
  FernRegistry.api.latest.HttpRequest[]
> {
  description: string | undefined;
  requestBodiesByContentType:
    | Record<string, RequestMediaTypeObjectConverterNode>
    | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<
      OpenAPIV3_1.RequestBodyObject | OpenAPIV3_1.ReferenceObject
    > & { method: HttpMethod; path: string }
  ) {
    super(args);
    this.safeParse(args);
  }

  parse({ method, path }: { method: HttpMethod; path: string }): void {
    const requestBody = resolveRequestReference(
      this.input,
      this.context.document
    );

    if (requestBody == null) {
      this.context.errors.error({
        message: "Expected request body. Received: null",
        path: this.accessPath,
      });
      return undefined;
    }

    Object.entries(requestBody.content).forEach(
      ([contentType, contentTypeObject]) => {
        this.requestBodiesByContentType ??= {};
        this.requestBodiesByContentType[contentType] =
          new RequestMediaTypeObjectConverterNode({
            input: contentTypeObject,
            context: this.context,
            accessPath: this.accessPath,
            pathId: "content",
            contentType,
            method,
            path,
          });
      }
    );
  }

  convert(): FernRegistry.api.latest.HttpRequest[] {
    return Object.entries(this.requestBodiesByContentType ?? {})
      .flatMap(([contentType, mediaTypeObject]) => {
        const maybeBodies = maybeSingleValueToArray(mediaTypeObject.convert());

        return maybeBodies?.map((body) => ({
          description: this.description,
          contentType,
          body,
        }));
      })
      .filter(isNonNullish);
  }

  convertToWebhookPayload():
    | FernRegistry.api.latest.WebhookPayload[]
    | undefined {
    return Object.values(this.requestBodiesByContentType ?? {})
      .flatMap((mediaTypeObject) => {
        const maybeBodies = maybeSingleValueToArray(mediaTypeObject.convert());

        return maybeBodies?.map((body) => {
          if (body.type !== "alias" && body.type !== "object") {
            return undefined;
          }

          return {
            description: this.description,
            shape: body,
          };
        });
      })
      .filter(isNonNullish);
  }

  webhookExample(): FernRegistry.api.v1.read.ExampleWebhookPayload | undefined {
    return {
      payload: this.requestBodiesByContentType?.[
        "application/json"
      ]?.schema?.example({
        includeOptionals: true,
        override: undefined,
      }),
    };
  }
}
