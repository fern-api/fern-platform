import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { ConstArrayToType } from "../../types/format.types";
import { extendType } from "../../utils/extendType";

const AVAILABILITY = ["pre-release", "in-development", "generally-available", "deprecated"] as const;
export type Availability = ConstArrayToType<typeof AVAILABILITY>;

export class AvailabilityConverterNode extends BaseOpenApiV3_1ConverterNode<
    OpenAPIV3_1.SchemaObject,
    FdrAPI.Availability | undefined
> {
    availability?: Availability;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.SchemaObject>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        if (this.input.deprecated) {
            this.availability = "deprecated";
        } else {
            const maybeAvailability = extendType<{
                "x-fern-availability"?: Availability;
            }>(this.input)["x-fern-availability"];
            if (maybeAvailability != null && AVAILABILITY.includes(maybeAvailability)) {
                this.availability = maybeAvailability;
            } else {
                this.context.errors.warning({
                    message: `Expected one of: ${AVAILABILITY.join(", ")}. Received: ${maybeAvailability}`,
                    path: this.accessPath,
                });
                this.availability = undefined;
            }
        }
    }

    convert(): FdrAPI.Availability | undefined {
        switch (this.availability) {
            case "pre-release":
                return FdrAPI.Availability.Beta;
            case "in-development":
                return FdrAPI.Availability.InDevelopment;
            case "generally-available":
                return FdrAPI.Availability.GenerallyAvailable;
            case "deprecated":
                return FdrAPI.Availability.Deprecated;
            case undefined:
                return undefined;
            default:
                new UnreachableCaseError(this.availability);
                return undefined;
        }
    }
}
