import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";

import { isNonNullish, titleCase } from "@fern-api/ui-core-utils";

import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { resolveExampleReference } from "../../utils/3.1/resolveExampleReference";
import { replacePathParameters } from "../../utils/replacePathParameters";
import { isExampleSseEvent } from "../guards/isExampleSseEvent";
import { isFileWithData } from "../guards/isFileWithData";
import { ParameterBaseObjectConverterNode } from "./parameters";
import { RequestMediaTypeObjectConverterNode } from "./request/RequestMediaTypeObjectConverter.node";
import { ResponseMediaTypeObjectConverterNode } from "./response/ResponseMediaTypeObjectConverter.node";

export const GLOBAL_EXAMPLE_NAME = "";

export declare namespace ExampleObjectConverterNode {
  export type Input =
    | {
        requestExample:
          | OpenAPIV3_1.ReferenceObject
          | OpenAPIV3_1.ExampleObject
          | undefined;
        responseExample:
          | OpenAPIV3_1.ReferenceObject
          | OpenAPIV3_1.ExampleObject
          | undefined;
      }
    | undefined;

  export type Shapes = {
    requestBody?: RequestMediaTypeObjectConverterNode;
    responseBody?: ResponseMediaTypeObjectConverterNode;
    pathParameters?: Record<string, ParameterBaseObjectConverterNode>;
    queryParameters?: Record<string, ParameterBaseObjectConverterNode>;
    requestHeaders?: Record<string, ParameterBaseObjectConverterNode>;
  };
}
export class ExampleObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
  ExampleObjectConverterNode.Input,
  FernRegistry.api.latest.ExampleEndpointCall
> {
  resolvedRequestInput: OpenAPIV3_1.ExampleObject | undefined;
  resolvedResponseInput: OpenAPIV3_1.ExampleObject | undefined;
  summary: string | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<ExampleObjectConverterNode.Input>,
    protected path: string,
    protected responseStatusCode: number,
    protected name: string | undefined,
    protected shapes: ExampleObjectConverterNode.Shapes
  ) {
    super(args);
    this.safeParse();
  }

  validateFormDataRequestExample(): boolean {
    // Record check
    if (typeof this.resolvedRequestInput?.value !== "object") {
      return false;
    }

    return Object.entries(this.shapes.requestBody?.fields ?? {}).reduce(
      (result, [key, field]) => {
        const value = this.resolvedRequestInput?.value[key];
        switch (field.multipartType) {
          case "file":
            return (
              result && (isFileWithData(value) || typeof value === "string")
            );
          case "files": {
            return (
              result &&
              Array.isArray(value) &&
              value.every(
                (value) => isFileWithData(value) || typeof value === "string"
              )
            );
          }
          case "property": {
            return result;
          }
          case undefined:
            return result && false;
          default:
            new UnreachableCaseError(field.multipartType);
            return result;
        }
      },
      true
    );
  }

  parse(): void {
    this.resolvedRequestInput = resolveExampleReference(
      this.input?.requestExample,
      this.context.document
    );
    this.resolvedResponseInput = resolveExampleReference(
      this.input?.responseExample,
      this.context.document
    );

    // TODO: align on terse examples
    // if (!new Ajv().validate(this.requestBody.resolvedSchema, this.input.value)) {
    //     this.context.errors.warning({
    //         message: "Invalid example object",
    //         path: this.accessPath,
    //     });
    // }

    this.summary =
      this.input?.requestExample?.summary ??
      this.input?.responseExample?.summary;

    if (this.shapes.requestBody != null && this.resolvedRequestInput != null) {
      switch (this.shapes.requestBody?.contentType) {
        case "json": {
          if (typeof this.resolvedRequestInput.value !== "object") {
            this.context.errors.error({
              message: "Invalid example, expected object for json",
              path: this.accessPath,
            });
            return;
          }
          break;
        }
        case "bytes": {
          if (typeof this.resolvedRequestInput.value !== "string") {
            this.context.errors.error({
              message: "Invalid example, expected string for bytes",
              path: this.accessPath,
            });
            return;
          }
          break;
        }
        case "form-data": {
          if (!this.validateFormDataRequestExample()) {
            this.context.errors.error({
              message: "Invalid example, expected valid form-data",
              path: this.accessPath,
            });
            return;
          }
          break;
        }
        case undefined:
          break;
        default:
          new UnreachableCaseError(this.shapes.requestBody?.contentType);
          this.context.errors.error({
            message: "Invalid example, unsupported content type",
            path: this.accessPath,
          });
          return;
      }
    }

    if (
      this.shapes.responseBody != null &&
      this.resolvedResponseInput != null
    ) {
      switch (this.shapes.responseBody?.contentType) {
        case "application/json":
          if (
            (this.resolvedResponseInput != null &&
              typeof this.resolvedResponseInput !== "object") ||
            (this.resolvedResponseInput.value != null &&
              typeof this.resolvedResponseInput.value !== "object")
          ) {
            this.context.errors.error({
              message: "Invalid example, expected object for json",
              path: this.accessPath,
            });
            return;
          }
          break;
        case "text/event-stream":
          if (
            this.resolvedResponseInput.value != null &&
            !Array.isArray(this.resolvedResponseInput.value) &&
            !this.resolvedResponseInput.value.every(isExampleSseEvent)
          ) {
            this.context.errors.error({
              message:
                "Invalid example, expected array of SSE events for event-stream",
              path: this.accessPath,
            });
            return;
          }
          break;
        case "application/octet-stream":
          if (
            this.resolvedResponseInput.value != null &&
            typeof this.resolvedResponseInput.value !== "string" &&
            !Array.isArray(this.resolvedResponseInput.value)
          ) {
            this.context.errors.error({
              message:
                "Invalid example, expected string or array for octet-stream",
              path: this.accessPath,
            });
            return;
          }
          break;
        case undefined:
          break;
        default:
          new UnreachableCaseError(this.shapes.responseBody?.contentType);
          return;
      }
    }
  }

  convertFormDataExampleRequest():
    | FernRegistry.api.latest.ExampleEndpointRequest
    | undefined {
    if (
      this.resolvedRequestInput == null ||
      this.shapes.requestBody?.fields == null
    ) {
      return undefined;
    }
    switch (this.shapes.requestBody?.contentType) {
      case "form-data": {
        const formData = Object.fromEntries(
          Object.entries(this.shapes.requestBody.fields)
            .map(([key, field]) => {
              const value = this.resolvedRequestInput?.value?.[key];
              switch (field.multipartType) {
                case "file": {
                  if (isFileWithData(value)) {
                    return [
                      key,
                      {
                        type: "filenameWithData",
                        filename: value.filename,
                        data: FernRegistry.FileId(value.data),
                      },
                    ];
                  } else {
                    return [
                      key,
                      {
                        type: "filename",
                        value,
                      },
                    ];
                  }
                }
                case "files": {
                  if (Array.isArray(value)) {
                    if (value.every((value) => isFileWithData(value))) {
                      return [
                        key,
                        {
                          type: "filenamesWithData",
                          value: value.map((value) => ({
                            filename: value.filename,
                            data: FernRegistry.FileId(value.data),
                          })),
                        },
                      ];
                    } else if (
                      value.every((value) => typeof value === "string")
                    ) {
                      return [
                        key,
                        {
                          type: "filenames",
                          value,
                        },
                      ];
                    }
                  }
                  return undefined;
                }
                case "property":
                  return [
                    key,
                    {
                      type: "json",
                      value,
                    },
                  ];
                case undefined:
                  return undefined;
                default:
                  new UnreachableCaseError(field.multipartType);
                  return undefined;
              }
            })
            .filter(isNonNullish)
        );
        return {
          type: "form",
          value: formData,
        };
      }
      case "json":
        return {
          type: "json",
          value: this.resolvedRequestInput.value,
        };
      case "bytes":
        return typeof this.resolvedRequestInput.value === "string"
          ? {
              type: "bytes",
              value: {
                type: "base64",
                value: this.resolvedRequestInput.value,
              },
            }
          : undefined;
      default:
        return undefined;
    }
  }

  convertDescription(): string | undefined {
    if (
      this.resolvedRequestInput != null &&
      this.resolvedResponseInput != null
    ) {
      // TODO: figure out what this should be -- maybe plumb a new description with an extension
      return this.resolvedResponseInput.description;
    } else if (this.resolvedRequestInput != null) {
      return this.resolvedRequestInput.description;
    } else if (this.resolvedResponseInput != null) {
      return this.resolvedResponseInput.description;
    }
    return undefined;
  }

  convert(): FernRegistry.api.latest.ExampleEndpointCall | undefined {
    let requestBody: FernRegistry.api.latest.ExampleEndpointRequest | undefined;
    if (this.shapes.requestBody != null && this.resolvedRequestInput != null) {
      switch (this.shapes.requestBody.contentType) {
        case "form-data":
          requestBody = this.convertFormDataExampleRequest();
          break;
        case "json":
          requestBody = {
            type: "json",
            value: this.resolvedRequestInput.value,
          };
          break;
        case "bytes":
          requestBody = {
            type: "bytes",
            value: {
              type: "base64",
              value: this.resolvedRequestInput.value,
            },
          };
          break;
        case undefined:
          break;
        default:
          new UnreachableCaseError(this.shapes.requestBody?.contentType);
          break;
      }
    }

    let responseBody:
      | FernRegistry.api.latest.ExampleEndpointResponse
      | undefined;
    if (
      this.shapes.responseBody != null &&
      this.resolvedResponseInput != null
    ) {
      // Note: if there is a 'value' field in an example, we assume that it is an openapi ExampleObject, and not part of the actual example
      // To circumvent this, one can nest the object in a 'value' field, since ExampleObject is at minimum just an empty object
      switch (this.shapes.responseBody.contentType) {
        case "application/json": {
          responseBody = {
            type: "json",
            value:
              this.resolvedResponseInput?.value ?? this.resolvedResponseInput,
          };
          break;
        }
        case "text/event-stream":
          responseBody = {
            type: "sse",
            value: this.resolvedResponseInput?.value,
          };
          break;
        case "application/octet-stream":
          responseBody = {
            type:
              typeof this.resolvedResponseInput?.value === "string"
                ? "filename"
                : "stream",
            value:
              this.resolvedResponseInput?.value ?? this.resolvedResponseInput,
          };
          break;
        case undefined:
          responseBody = {
            type: "json",
            value:
              this.resolvedResponseInput?.value ?? this.resolvedResponseInput,
          };
          break;
        default:
          new UnreachableCaseError(this.shapes.responseBody?.contentType);
          break;
      }
    }

    const pathParameters = Object.fromEntries(
      Object.entries(this.shapes.pathParameters ?? {}).map(([key, value]) => {
        return [
          key,
          value.example({
            includeOptionals: false,
            override: key,
          }),
        ];
      })
    );

    const queryParameters = Object.fromEntries(
      Object.entries(this.shapes.queryParameters ?? {}).map(([key, value]) => {
        return [
          key,
          value.example({
            includeOptionals: false,
            override: key,
          }),
        ];
      })
    );

    const requestHeaders = Object.fromEntries(
      Object.entries(this.shapes.requestHeaders ?? {}).map(([key, value]) => {
        return [
          key,
          value.example({
            includeOptionals: false,
            override: key,
          }),
        ];
      })
    );

    return {
      path: replacePathParameters(
        this.path,
        pathParameters as Record<string, string>
      ),
      responseStatusCode: this.responseStatusCode,
      name:
        this.name != null
          ? titleCase(this.name)
          : this.summary != null
            ? titleCase(this.summary)
            : undefined,
      description: this.convertDescription(),
      pathParameters:
        Object.keys(pathParameters).length > 0 ? pathParameters : undefined,
      queryParameters:
        Object.keys(queryParameters).length > 0 ? queryParameters : undefined,
      headers:
        Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
      requestBody,
      responseBody,
      snippets: undefined,
    };
  }
}
