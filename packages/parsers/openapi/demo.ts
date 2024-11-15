import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { z } from "zod";
import { ApiNodeContext, InputApiNode } from "./base.node.interface";
import { FdrStage } from "./shared/interfaces/fdr.stage.interface";

export class AvailabilityNode implements InputApiNode<unknown, FdrAPI.Availability | undefined> {
    id: string;
    availability: FdrAPI.Availability | undefined;

    "x-fern-availability-shape" = z.object({
        "x-fern-availability": z.optional(
            z.enum(["beta", "deprecated", "development", "pre-release", "stable", "generally-available"]),
        ),
    });

    deprecatedShape = z.object({
        deprecated: z.boolean(),
    });

    constructor(
        readonly context: ApiNodeContext,
        readonly input: unknown,
        readonly accessPath: InputApiNode<unknown, unknown>[],
    ) {
        this.id = `${accessPath.map((node) => node.id).join(".")}.AvailabilityNode`;
        if (input && typeof input === "object" && "x-fern-availability" in input) {
            const result = this["x-fern-availability-shape"].safeParse(input);
            if (result.success) {
                this.availability = this.convertAvailability(result.data["x-fern-availability"] ?? "");
            } else {
                context.errorCollector.addError(`Availability is not defined for ${this.id}`);
            }
            return;
        }

        if (input && typeof input === "object" && "deprecated" in input && typeof input.deprecated === "boolean") {
            const result = this.deprecatedShape.safeParse(input);
            if (result.success) {
                this.availability = result.data.deprecated ? FdrAPI.Availability.Deprecated : undefined;
            } else {
                context.errorCollector.addError(`Availability is not defined for ${this.id}`);
            }
            return;
        }
    }

    convertAvailability = (availability: string): FdrAPI.Availability | undefined => {
        switch (availability) {
            case "beta":
                return FdrAPI.Availability.Beta;
            case "deprecated":
                return FdrAPI.Availability.Deprecated;
            case "development":
                return FdrAPI.Availability.InDevelopment;
            case "pre-release":
                return FdrAPI.Availability.PreRelease;
            case "stable":
                return FdrAPI.Availability.Stable;
            case "generally-available":
                return FdrAPI.Availability.GenerallyAvailable;
            default:
                return undefined;
        }
    };

    outputFdrShape = (): FdrAPI.Availability | undefined => {
        return this.availability;
    };
}

export class DemoStringNode implements InputApiNode<OpenAPIV3_1.SchemaObject, FdrAPI.api.latest.PrimitiveType> {
    id: string;

    regex: string | undefined;
    format: string | undefined;
    default: string | undefined;
    minLength: number | undefined;
    maxLength: number | undefined;

    constructor(
        readonly context: ApiNodeContext,
        readonly input: OpenAPIV3_1.SchemaObject,
        readonly accessPath: InputApiNode<unknown, unknown>[],
    ) {
        this.id = `${accessPath.map((node) => node.id).join(".")}.DemoStringNode`;
        this.regex = input.pattern;
        // this.format = input.format;
        this.default = input.default;
        this.minLength = input.minLength;
        this.maxLength = input.maxLength;
    }

    outputFdrShape = (): FdrAPI.api.latest.PrimitiveType => {
        return {
            type: "string",
            regex: this.regex,
            minLength: this.minLength,
            maxLength: this.maxLength,
            default: this.default,
        };
    };
}

export class DemoTypeShapeStage implements FdrStage<OpenAPIV3_1.SchemaObject, FdrAPI.api.latest.TypeShape> {
    id: string;

    stringNode: DemoStringNode | undefined;
    properties: DemoPropertyNode[] = [];
    constructor(
        readonly context: ApiNodeContext,
        readonly input: OpenAPIV3_1.SchemaObject,
        readonly accessPath: InputApiNode<unknown, unknown>[],
    ) {
        this.id = `${accessPath.map((node) => node.id).join(".")}.DemoTypeShapeStage`;

        // This should be decomposed into container and primitive nodes, but this is a bit too much for now
        if (input.type === "object") {
            this.properties = Object.entries(input.properties ?? {}).map(([name, schema]) => {
                return new DemoPropertyNode(name, this.context, schema, this.accessPath);
            });
        } else if (input.type === "string") {
            this.stringNode = new DemoStringNode(this.context, this.input, this.accessPath);
        }
    }

    outputFdrShape = (): FdrAPI.api.latest.TypeShape => {
        // we include this because this is non-exhaustive for now, for demo purposes
        if (this.stringNode) {
            return {
                type: "alias",
                value: {
                    type: "primitive",
                    value: this.stringNode.outputFdrShape(),
                },
            };
        } else {
            return {
                type: "object",
                properties: this.properties.map((property) => property.outputFdrShape()),
                extends: [],
                extraProperties: undefined,
            };
        }
    };
}

export class DemoPropertyNode
    implements InputApiNode<OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject, FdrAPI.api.latest.ObjectProperty>
{
    id: string;

    propertyShape: DemoTypeShapeStage | undefined = undefined;
    availability: AvailabilityNode | undefined = undefined;

    constructor(
        readonly name: string,
        readonly context: ApiNodeContext,
        readonly input: OpenAPIV3_1.SchemaObject,
        readonly accessPath: InputApiNode<unknown, unknown>[],
    ) {
        this.id = `${accessPath.map((node) => node.id).join(".")}.DemoPropertyNode`;
        if (input.type === "string") {
            this.propertyShape = new DemoTypeShapeStage(this.context, this.input, this.accessPath);
        }
        this.availability = new AvailabilityNode(this.context, this.input, this.accessPath);
    }

    outputFdrShape = (): FdrAPI.api.latest.ObjectProperty => {
        // we include this because this is non-exhaustive for now, for demo purposes
        if (!this.propertyShape) {
            throw new Error("Property shape is undefined");
        }

        return {
            key: FdrAPI.PropertyKey(this.name),
            valueShape: this.propertyShape.outputFdrShape(),
            description: this.input.description,
            availability: this.availability?.outputFdrShape(),
        };
    };
}

export class DemoSchemaNode implements InputApiNode<OpenAPIV3_1.SchemaObject, FdrAPI.api.latest.TypeDefinition> {
    id: string;

    shape: DemoTypeShapeStage | undefined = undefined;
    availability: AvailabilityNode;

    constructor(
        readonly name: string,
        readonly context: ApiNodeContext,
        readonly input: OpenAPIV3_1.SchemaObject,
        readonly accessPath: InputApiNode<unknown, unknown>[],
    ) {
        this.id = `${accessPath.map((node) => node.id).join(".")}.DemoTypeDefinitionNode`;
        if (this.input.type === "object") {
            this.shape = new DemoTypeShapeStage(this.context, this.input, this.accessPath);
        }
        this.availability = new AvailabilityNode(this.context, this.input, this.accessPath);
    }

    outputFdrShape = (): FdrAPI.api.latest.TypeDefinition => {
        // we include this because this is non-exhaustive for now, for demo purposes
        if (!this.shape) {
            throw new Error("Shape is undefined");
        }

        return {
            name: this.name,
            shape: this.shape.outputFdrShape(),
            description: this.input.description,
            availability: this.availability.outputFdrShape(),
        };
    };
}

export class ComponentsNode implements InputApiNode<OpenAPIV3_1.ComponentsObject, FdrAPI.api.latest.TypeDefinition[]> {
    id: string;

    schemas: DemoSchemaNode[] = [];

    constructor(
        readonly context: ApiNodeContext,
        readonly input: OpenAPIV3_1.ComponentsObject,
        readonly accessPath: InputApiNode<unknown, unknown>[],
    ) {
        this.id = `${accessPath.map((node) => node.id).join(".")}.ComponentsNode`;
        this.schemas = Object.entries(this.input.schemas ?? {}).map(([name, schema]) => {
            return new DemoSchemaNode(name, this.context, schema, this.accessPath);
        });
    }

    outputFdrShape = (): FdrAPI.api.latest.TypeDefinition[] => {
        return this.schemas.map((schema) => schema.outputFdrShape());
    };
}
