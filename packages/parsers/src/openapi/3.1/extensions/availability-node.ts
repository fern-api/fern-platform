import { FdrAPI } from "@fern-api/fdr-sdk";
import { UnreachableCaseError } from "ts-essentials";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";

type Availability = "beta" | "in-development" | "deprecated";

export class AvailabilityNode<T> extends BaseOpenApiV3_1ConverterNode<T, FdrAPI.Availability | undefined> {
    availability?: FdrAPI.Availability;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<T>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        const inputWithAvailability = this.input as T & {
            "x-fern-availability"?: Availability;
        };
        switch (inputWithAvailability["x-fern-availability"]) {
            case "beta":
                this.availability = FdrAPI.Availability.Beta;
                break;
            case "in-development":
                this.availability = FdrAPI.Availability.InDevelopment;
                break;
            case "deprecated":
                this.availability = FdrAPI.Availability.Deprecated;
                break;
            case undefined:
                this.availability = undefined;
                break;
            default:
                new UnreachableCaseError(inputWithAvailability["x-fern-availability"]);
                return undefined;
        }
    }

    convert(): FdrAPI.Availability | undefined {
        return this.availability;
    }
}
