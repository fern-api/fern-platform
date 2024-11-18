import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";
import { BaseAPIConverterNodeContext } from "../../../BaseApiConverter.node";
import { FdrStringType } from "../../../types/fdr.types";
import { ConstArrayToType, OPENAPI_STRING_TYPE_FORMAT } from "../../../types/format.types";
import { BaseOpenApiV3_1Node } from "../../BaseOpenApiV3_1Converter.node";

export declare namespace StringConverterNode {
    export interface Input extends OpenAPIV3_1.NonArraySchemaObject {
        type: "string";
    }
}

function isOpenApiStringTypeFormat(format: unknown): format is ConstArrayToType<typeof OPENAPI_STRING_TYPE_FORMAT> {
    return OPENAPI_STRING_TYPE_FORMAT.includes(format as ConstArrayToType<typeof OPENAPI_STRING_TYPE_FORMAT>);
}

export class StringConverterNode extends BaseOpenApiV3_1Node<StringConverterNode.Input, FdrStringType> {
    type: FdrStringType["type"] | undefined;
    regex: string | undefined;
    default: string | undefined;
    minLength: number | undefined;
    maxLength: number | undefined;

    private mapToFdrType = (
        format: ConstArrayToType<typeof OPENAPI_STRING_TYPE_FORMAT>,
    ): FdrStringType["type"] | undefined => {
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
    };
    constructor(
        input: StringConverterNode.Input,
        context: BaseAPIConverterNodeContext,
        accessPath: string[],
        pathId: string,
    ) {
        super(input, context, accessPath, pathId);

        if (typeof input.default !== "string") {
            this.context.errors.warning({
                message: "The default value for an string type should be an string",
                path: this.accessPath,
            });
        }
        this.default = input.default;

        if (input.format != null && isOpenApiStringTypeFormat(input.format)) {
            this.type = this.mapToFdrType(input.format);
        }
    }

    public convert(): FdrStringType | undefined {
        if (this.type == null) {
            return undefined;
        }

        return {
            type: this.type,
            regex: this.regex,
            minLength: this.minLength,
            maxLength: this.maxLength,
            default: this.default,
        };
    }
}
