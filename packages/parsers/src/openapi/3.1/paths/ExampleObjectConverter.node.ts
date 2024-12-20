import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { resolveExampleReference } from "../../utils/3.1/resolveExampleReference";
import { RedocExampleConverterNode } from "../extensions/examples/RedocExampleConverter.node";
import { isExampleSseEvent } from "../guards/isExampleSseEvent";
import { isFileWithData } from "../guards/isFileWithData";
import { RequestMediaTypeObjectConverterNode } from "./request/RequestMediaTypeObjectConverter.node";
import { ResponseMediaTypeObjectConverterNode } from "./response/ResponseMediaTypeObjectConverter.node";

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
}

export class ExampleObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
  ExampleObjectConverterNode.Input,
  FernRegistry.api.latest.ExampleEndpointCall
> {
  resolvedRequestInput: OpenAPIV3_1.ExampleObject | undefined;
  resolvedResponseInput: OpenAPIV3_1.ExampleObject | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<ExampleObjectConverterNode.Input>,
    protected path: string,
    protected responseStatusCode: number,
    protected name: string | undefined,
    protected requestBody: RequestMediaTypeObjectConverterNode | undefined,
    protected responseBody: ResponseMediaTypeObjectConverterNode | undefined,
    // TODO: generate examples from parameter objects, which naturally resolve as schema objects
    // protected pathParameters: Record<string, ParameterBaseObjectConverterNode> | undefined,
    // protected queryParameters: Record<string, ParameterBaseObjectConverterNode> | undefined,
    // protected requestHeaders: Record<string, ParameterBaseObjectConverterNode> | undefined,
    protected redocExamplesNode: RedocExampleConverterNode | undefined
  ) {
    super(args);
    this.safeParse();
  }

  validateFormDataRequestExample(): boolean {
    // Record check
    if (typeof this.resolvedRequestInput?.value !== "object") {
      return false;
    }

    return Object.entries(this.requestBody?.fields ?? {}).reduce(
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

    if (this.requestBody && this.resolvedRequestInput) {
      switch (this.requestBody?.contentType) {
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
          new UnreachableCaseError(this.requestBody.contentType);
          this.context.errors.error({
            message: "Invalid example, unsupported content type",
            path: this.accessPath,
          });
          return;
      }
    }

    if (this.responseBody && this.resolvedResponseInput) {
      switch (this.responseBody.contentType) {
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
          new UnreachableCaseError(this.responseBody.contentType);
          return undefined;
      }
    }
  }

  convertFormDataExampleRequest():
    | FernRegistry.api.latest.ExampleEndpointRequest
    | undefined {
    if (this.resolvedRequestInput == null || this.requestBody?.fields == null) {
      return undefined;
    }
    switch (this.requestBody.contentType) {
      case "form-data": {
        const formData = Object.fromEntries(
          Object.entries(this.requestBody.fields)
            .map(([key, field]) => {
              const value = this.resolvedRequestInput?.value[key];
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
      return `An example request and response for the ${this.path} path.\n Request: ${this.resolvedRequestInput.description}\n Response: ${this.resolvedResponseInput.description}`;
    } else if (this.resolvedRequestInput != null) {
      return this.resolvedRequestInput.description;
    } else if (this.resolvedResponseInput != null) {
      return this.resolvedResponseInput.description;
    }
    return undefined;
  }

  convert(): FernRegistry.api.latest.ExampleEndpointCall | undefined {
    let requestBody: FernRegistry.api.latest.ExampleEndpointRequest | undefined;
    if (this.requestBody != null && this.resolvedRequestInput != null) {
      switch (this.requestBody.contentType) {
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
          new UnreachableCaseError(this.requestBody.contentType);
          return undefined;
      }
    }

    let responseBody:
      | FernRegistry.api.latest.ExampleEndpointResponse
      | undefined;
    if (this.responseBody != null && this.resolvedResponseInput != null) {
      // Note: if there is a 'value' fielt in an example, we assume that it is an openapi ExampleObject, and not part of the actual example
      // To circumvent this, one can nest the object in a 'value' field, since ExampleObject is at minimum just an empty object
      switch (this.responseBody.contentType) {
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
          break;
        default:
          new UnreachableCaseError(this.responseBody.contentType);
          return undefined;
      }
    }

    return {
      path: this.path,
      responseStatusCode: this.responseStatusCode,
      name: this.name,
      description: this.convertDescription(),
      // pathParameters: Object.fromEntries(
      //     Object.entries(this.pathParameters ?? {}).map(([key, value]) => {
      //         return [key, value.generateDefault()];
      //     }),
      // ),
      // queryParameters: Object.fromEntries(
      //     Object.entries(this.queryParameters ?? {}).map(([key, value]) => {
      //         return [key, value.generateDefault()];
      //     }),
      // ),
      // headers: Object.fromEntries(
      //     Object.entries(this.requestHeaders ?? {}).map(([key, value]) => {
      //         return [key, value.generateDefault()];
      //     }),
      // ),
      pathParameters: undefined,
      queryParameters: undefined,
      headers: undefined,
      requestBody,
      responseBody,
      snippets: this.redocExamplesNode?.convert(),
    };
  }
}
