import { UnreachableCaseError } from "ts-essentials";
import { ApiNodeContext, OutputApiNode } from "../../../../base.node.interface";
import { SchemaObject } from "../../../openapi.types";
import { FdrIntegerType } from "../types/fdr.types";
import { OpenApiIntegerTypeFormat } from "../types/format.types";

function isOpenApiIntegerTypeFormat(format: string | undefined): format is OpenApiIntegerTypeFormat {
    return format === "int32" || format === "int64" || format === undefined;
}

export class IntegerNode extends OutputApiNode<SchemaObject, Pick<FdrIntegerType, "type">> {
    type: FdrIntegerType["type"] = "integer";

    constructor(context: ApiNodeContext, input: SchemaObject, accessPath: string[], accessorKey?: string) {
        super(context, input, accessPath);

        if (input.type !== "integer") {
            context.errorCollector.addError(
                `Expected type "integer" for numerical primitive, but got "${input.type}"`,
                accessPath,
                accessorKey,
            );
            return;
        }

        if (!isOpenApiIntegerTypeFormat(input.format)) {
            context.errorCollector.addError(
                `Expected format for integer primitive, but got "${input.format}"`,
                accessPath,
                accessorKey,
            );
            return;
        }

        switch (input.format) {
            case "int64":
                this.type = "long";
                break;
            case "int8":
            case "int16":
            case "int32":
            case "uint8":
            case "sf-integer":
            case undefined:
                this.type = "integer";
                break;
            default:
                new UnreachableCaseError(input.format);
        }
    }

    // In this, we pick only the non-shared types, so that we can push up the shared types to the parent for maximum reuse
    outputFdrShape = (): Pick<FdrIntegerType, "type"> => {
        return {
            type: this.type,
        };
    };
}
