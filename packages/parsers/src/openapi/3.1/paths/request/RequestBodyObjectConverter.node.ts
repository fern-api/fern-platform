import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { resolveRequestReference } from "../../../utils/3.1/resolveRequestReference";
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
    >,
    protected path: string,
    protected responseStatusCode: number
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
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
          new RequestMediaTypeObjectConverterNode(
            {
              input: contentTypeObject,
              context: this.context,
              accessPath: this.accessPath,
              pathId: "content",
            },
            contentType,
            this.path,
            this.responseStatusCode
          );
      }
    );
  }

  convert(): FernRegistry.api.latest.HttpRequest[] {
    return Object.entries(this.requestBodiesByContentType ?? {})
      .flatMap(([contentType, mediaTypeObject]) => {
        const bodies = mediaTypeObject.convert();

        if (bodies == null) {
          return undefined;
        }

        return bodies.map((body) => {
          if (body == null) {
            return undefined;
          }

          return {
            description: this.description,
            contentType,
            body,
          };
        });
      })
      .filter(isNonNullish);
  }
}
