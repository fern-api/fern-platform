import { UnreachableCaseError } from "ts-essentials";
import { ApiNodeContext, OutputApiNode } from "../../../../base.node.interface";
import { SchemaObject } from "../../../openapi.types";
import { FdrFloatType } from "../types/fdr.types";
import { ConstArrayToType, OPENAPI_NUMBER_TYPE_FORMAT } from "../types/format.types";

function isOpenApiNumberTypeFormat(format: unknown): format is ConstArrayToType<typeof OPENAPI_NUMBER_TYPE_FORMAT> {
    return OPENAPI_NUMBER_TYPE_FORMAT.includes(format as ConstArrayToType<typeof OPENAPI_NUMBER_TYPE_FORMAT>);
}

export class FloatNode extends OutputApiNode<SchemaObject, Pick<FdrFloatType, "type">> {
    type: FdrFloatType["type"] | undefined = undefined;

    constructor(context: ApiNodeContext, input: SchemaObject, accessPath: string[], accessorKey?: string) {
        super(context, input, accessPath);

        if (input.type !== "number") {
            context.errorCollector.addError(
                `Expected type "number" for numerical primitive, but got "${input.type}"`,
                accessPath,
                accessorKey,
            );
            return;
        }

        if (!isOpenApiNumberTypeFormat(input.format)) {
            context.errorCollector.addError(
                `Expected format for number primitive, but got "${input.format}"`,
                accessPath,
                accessorKey,
            );
            return;
        }

        switch (input.format) {
            case "decimal":
            case "decimal128":
            case "double-int":
            case "double":
            case "float":
            case "sf-decimal":
            case undefined:
                this.type = "double";
                break;
            default:
                new UnreachableCaseError(input.format);
        }
    }

    // In this, we pick only the non-shared types, so that we can push up the shared types to the parent for maximum reuse
    outputFdrShape = (): Pick<FdrFloatType, "type"> | undefined => {
        if (this.type === undefined) {
            return undefined;
        }
        return {
            type: this.type,
        };
    };
}
