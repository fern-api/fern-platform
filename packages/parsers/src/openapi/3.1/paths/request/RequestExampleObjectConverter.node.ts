import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";
import { FernRegistry } from "../../../../client/generated";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { RequestMediaTypeObjectConverterNode } from "./RequestMediaTypeObjectConverter.node";

export class RequestExampleObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
    OpenAPIV3_1.ExampleObject,
    FernRegistry.api.latest.ExampleEndpointCall
> {
    constructor(
        args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.ExampleObject>,
        protected path: string,
        protected responseStatusCode: number,
        protected requestBody: RequestMediaTypeObjectConverterNode,
    ) {
        super(args);
        this.safeParse();
    }

    // TODO: clean and move to a common place

    isFileWithData(valueObject: object): valueObject is { filename: string; data: string } {
        return (
            "filename" in valueObject &&
            "data" in valueObject &&
            typeof valueObject.filename === "string" &&
            typeof valueObject.data === "string"
        );
    }
    validateFormDataExample(): boolean {
        // Record check
        if (typeof this.input.value !== "object") {
            return false;
        }

        return Object.entries(this.requestBody.fields ?? {}).reduce((result, [key, field]) => {
            const value = this.input.value[key];
            switch (field.multipartType) {
                case "file":
                    return result && (this.isFileWithData(value) || typeof value === "string");
                case "files": {
                    return (
                        result &&
                        Array.isArray(value) &&
                        value.every((value) => this.isFileWithData(value) || typeof value === "string")
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
        }, true);
    }

    parse(): void {
        if (this.requestBody.resolvedSchema == null) {
            this.context.errors.error({
                message: "Request body schema is required",
                path: this.accessPath,
            });
            return;
        }

        // TODO: align on terse examples
        // if (!new Ajv().validate(this.requestBody.resolvedSchema, this.input.value)) {
        //     this.context.errors.warning({
        //         message: "Invalid example object",
        //         path: this.accessPath,
        //     });
        // }

        switch (this.requestBody.contentType) {
            case "json": {
                if (typeof this.input.value !== "object") {
                    this.context.errors.error({
                        message: "Invalid example object, expected object for json",
                        path: this.accessPath,
                    });
                }
                break;
            }
            case "bytes": {
                if (typeof this.input.value !== "string") {
                    this.context.errors.error({
                        message: "Invalid example object, expected string for bytes",
                        path: this.accessPath,
                    });
                }
                break;
            }
            case "form-data": {
                if (!this.validateFormDataExample()) {
                    this.context.errors.error({
                        message: "Invalid example object, expected valid form-data",
                        path: this.accessPath,
                    });
                }
                break;
            }
            case undefined:
                break;
            default:
                new UnreachableCaseError(this.requestBody.contentType);
                this.context.errors.error({
                    message: "Invalid example object, unsupported content type",
                    path: this.accessPath,
                });
        }
    }

    convertFormDataExampleRequest(): FernRegistry.api.latest.ExampleEndpointRequest | undefined {
        if (this.requestBody.fields == null) {
            return undefined;
        }
        switch (this.requestBody.contentType) {
            case "form-data": {
                const formData = Object.fromEntries(
                    Object.entries(this.requestBody.fields)
                        .map(([key, field]) => {
                            const value = this.input.value[key];
                            switch (field.multipartType) {
                                case "file": {
                                    if (this.isFileWithData(value)) {
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
                                        if (value.every((value) => this.isFileWithData(value))) {
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
                                        } else if (value.every((value) => typeof value === "string")) {
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
                        .filter(isNonNullish),
                );
                return {
                    type: "form",
                    value: formData,
                };
            }

            case "json":
                return {
                    type: "json",
                    value: this.input.value,
                };
            case "bytes":
                return typeof this.input.value === "string"
                    ? {
                          type: "bytes",
                          value: {
                              type: "base64",
                              value: this.input.value,
                          },
                      }
                    : undefined;
            default:
                return undefined;
        }
    }

    convert(): FernRegistry.api.latest.ExampleEndpointCall | undefined {
        return {
            path: this.path,
            responseStatusCode: this.responseStatusCode,
            name: this.input.summary,
            description: this.input.description,
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: this.convertFormDataExampleRequest(),
            responseBody: undefined,
            snippets: undefined,
        };
    }
}
