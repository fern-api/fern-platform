import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";
import { FdrStringType } from "../../../types/fdr.types";
import { BaseOpenApiV3_1Node, BaseOpenApiV3_1NodeConstructorArgs } from "../../BaseOpenApiV3_1Converter.node";
import { ConstArrayToType, OPENAPI_STRING_TYPE_FORMAT } from "../../types/format.types";
import { EnumConverterNode } from "./EnumConverter.node";

export declare namespace StringConverterNode {
    export interface Input extends OpenAPIV3_1.NonArraySchemaObject {
        type: "string";
    }
    export interface Output extends FdrAPI.api.latest.TypeShape.Alias {
        type: "alias";
        value: {
            type: "primitive";
            value: FdrStringType;
        };
    }
}

function isOpenApiStringTypeFormat(format: unknown): format is ConstArrayToType<typeof OPENAPI_STRING_TYPE_FORMAT> {
    return OPENAPI_STRING_TYPE_FORMAT.includes(format as ConstArrayToType<typeof OPENAPI_STRING_TYPE_FORMAT>);
}

export class StringConverterNode extends BaseOpenApiV3_1Node<
    StringConverterNode.Input,
    StringConverterNode.Output | FdrAPI.api.latest.TypeShape.Enum
> {
    type: FdrStringType["type"] = "string";
    regex: string | undefined;
    default: string | undefined;
    minLength: number | undefined;
    maxLength: number | undefined;
    enum: EnumConverterNode | undefined;

    constructor(...args: BaseOpenApiV3_1NodeConstructorArgs<StringConverterNode.Input>) {
        super(...args);
        this.safeParse();
    }

    mapToFdrType(format: ConstArrayToType<typeof OPENAPI_STRING_TYPE_FORMAT>): FdrStringType["type"] {
        switch (format) {
            case "base64url":
            case "binary":
            case "byte":
            case "sf-binary":
                return "base64";
            case "date-time":
                return "datetime";
            case "int64":
                return "bigInteger";
            case "date":
                return "date";
            case "uuid":
                return "uuid";
            case "char":
            case "commonmark":
            case "decimal":
            case "decimal128":
            case "duration":
            case "email":
            case "hostname":
            case "html":
            case "http-date":
            case "idn-email":
            case "idn-hostname":
            case "ipv4":
            case "ipv6":
            case "iri-reference":
            case "iri":
            case "json-pointer":
            case "media-range":
            case "password":
            case "regex":
            case "relative-json-pointer":
            case "sf-boolean":
            case "sf-string":
            case "sf-token":
            case "time":
            case "uri-reference":
            case "uri-template":
            case "uri":
            case undefined:
                return "string";
            default:
                this.context.errors.warning({
                    message:
                        "The format for an string type should be one of the following: " +
                        OPENAPI_STRING_TYPE_FORMAT.join(", "),
                    path: this.accessPath,
                });
                new UnreachableCaseError(format);
                return "string";
        }
    }

    parse(): void {
        if (this.input.default != null && typeof this.input.default !== "string") {
            this.context.errors.warning({
                message: "The default value for an string type should be an string",
                path: this.accessPath,
            });
        }
        this.default = this.input.default;

        if (this.input.format != null && isOpenApiStringTypeFormat(this.input.format)) {
            this.type = this.mapToFdrType(this.input.format);
        }

        if (this.input.enum != null) {
            this.enum = new EnumConverterNode(this.input, this.context, this.accessPath, "enum");
        }
    }

    convert(): StringConverterNode.Output | FdrAPI.api.latest.TypeShape.Enum | undefined {
        if (this.enum != null) {
            return this.enum.convert();
        }
        return {
            type: "alias",
            value: {
                type: "primitive",
                value: {
                    type: this.type,
                    regex: this.regex,
                    minLength: this.minLength,
                    maxLength: this.maxLength,
                    default: this.default,
                },
            },
        };
    }
}
