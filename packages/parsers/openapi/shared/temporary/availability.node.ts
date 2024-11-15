// import { FdrAPI } from "@fern-api/fdr-sdk";
// import { FernRegistry } from "@fern-api/fdr-sdk/src/client/generated";
// import { OpenAPIV3_1 } from "openapi-types";
// import { ApiNode, ApiNodeContext } from "../interfaces/api.node.interface";
// import { FdrStage } from "../interfaces/fdr.stage.interface";
// import { FdrApiStage } from "../stages/fdr/api.stage";

// // export class AvailabilityNode<T, InputNode extends ApiNode<unknown, T> & { "x-fern-availability": string }>
// //     implements
// //         ComposableApiNode<
// //             T,
// //             InputNode,
// //             T & {
// //                 availability: string;
// //             }
// //         >
// // {
// //     name = "availability";
// //     preProcessedInput: InputNode["preProcessedInput"];
// //     qualifiedId: string;

// //     constructor(
// //         readonly context: ApiNodeContext,
// //         readonly inputNode: InputNode,
// //         readonly accessPath: ApiNode<unknown, unknown>[],
// //     ) {
// //         this.qualifiedId = `${this.accessPath.map((node) => node.qualifiedId).join(".")}.${this.name}`;
// //         this.preProcessedInput = this.inputNode.preProcessedInput;
// //     }

// //     outputFdrShape(): T & {
// //         availability: string;
// //     } {
// //         const baseShape = this.inputNode.outputFdrShape();
// //         return {
// //             ...baseShape,
// //             availability: this.inputNode["x-fern-availability"],
// //         };
// //     }
// // }

// export class TypeNode implements ApiNode<OpenAPIV3_1.SchemaObject, FdrAPI.TypeId> {
//     name = "type";
//     qualifiedId: string;

//     reference?: string;

//     constructor(
//         readonly context: ApiNodeContext,
//         readonly preProcessedInput: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
//         readonly accessPath: ApiNode<unknown, unknown>[],
//     ) {
//         this.qualifiedId = `${accessPath.map((node) => node.qualifiedId).join(".")}.${this.name}`;
//         this.reference = "$ref" in preProcessedInput ? preProcessedInput.$ref : undefined;
//     }
//     input: OpenAPIV3_1.SchemaObject;
//     id: string;
//     parse: () =>
//         | { ok: true }
//         | {
//               ok: false;
//               //     implements
//               //         ComposableApiNode<
//               //             T,
//               //             InputNode,
//               //             T & {
//               //                 availability: string;
//               //             }
//               //         >
//               // {
//               //     name = "availability";
//               //     preProcessedInput: InputNode["preProcessedInput"];
//               //     qualifiedId: string;
//               //     constructor(
//               //         readonly context: ApiNodeContext,
//               //         readonly inputNode: InputNode,
//               //         readonly accessPath: ApiNode<unknown, unknown>[],
//               //     ) {
//               //         this.qualifiedId = `${this.accessPath.map((node) => node.qualifiedId).join(".")}.${this.name}`;
//               //         this.preProcessedInput = this.inputNode.preProcessedInput;
//               //     }
//               //     outputFdrShape(): T & {
//               //         availability: string;
//               //     } {
//               //         const baseShape = this.inputNode.outputFdrShape();
//               //         return {
//               //             ...baseShape,
//               //             availability: this.inputNode["x-fern-availability"],
//               //         };
//               //     }
//               // }
//               error: string;
//           };

//     outputFdrShape = (): FdrAPI.TypeId => {
//         // This is not correct, but it's a placeholder for now
//         return this.reference ? FdrAPI.TypeId(this.reference) : FdrAPI.TypeId("unknown");
//     };
// }

// export class ContainerDiscriminationStage implements FdrApiStage<OpenAPIV3_1.Non, FdrAPI.TypeId> {
//     id: string;
//     outputFdrShape: () => FdrAPI.TypeId;
// }

// export class PrimitiveNode implements ApiNode<OpenAPIV3_1.SchemaObject, FdrAPI.TypeId> {
//     context: ApiNodeContext;
//     input: OpenAPIV3_1.SchemaObject;
//     accessPath: ApiNode<unknown, unknown>[];
//     id: string;
//     outputFdrShape: () => FdrAPI.TypeId;
// }

// export class PropertyNode implements ApiNode<OpenAPIV3_1.SchemaObject, FdrAPI.api.latest.ObjectProperty> {
//     id: string;
//     constructor(
//         readonly name: string,
//         readonly input: OpenAPIV3_1.SchemaObject,
//         readonly context: ApiNodeContext,
//         readonly accessPath: ApiNode<unknown, unknown>[],
//     ) {
//         this.id = `${accessPath.map((node) => node.id).join(".")}.PropertyNode:${name}`;

//         this.input.
//     }
//     outputFdrShape: () => FdrAPI.api.latest.ObjectProperty;
// }

// export class ExtraPropertyNode implements ApiNode<OpenAPIV3_1.SchemaObject, FdrAPI.api.latest.TypeReference> {
//     context: ApiNodeContext;
//     input: OpenAPIV3_1.SchemaObject;
//     accessPath: ApiNode<unknown, unknown>[];
//     id: string;
//     parse: () =>
//         | { ok: true }
//         | {
//               ok: false;
//               error: string;
//           };
//     outputFdrShape: () => FdrAPI.api.latest.TypeReference;
//     name = "extra-property";
// }

// export class SchemaNode
//     implements ApiNode<OpenAPIV3_1.SchemaObject, FdrAPI.api.latest.ObjectType | FdrAPI.api.latest.ListType>
// {
//     id: string;

//     arrayItem: SchemaNode | undefined;
//     extensions: TypeNode[] = [];
//     schemasToMerge: SchemaNode[] = [];
//     properties: PropertyNode[] = [];
//     extraProperties: ExtraPropertyNode | undefined;

//     constructor(
//         readonly input: OpenAPIV3_1.SchemaObject,
//         readonly context: ApiNodeContext,
//         readonly accessPath: ApiNode<unknown, unknown>[],
//     ) {
//         this.id = `${accessPath.map((node) => node.id).join(".")}.SchemaNode:${input.title ?? input.$schema ?? "unknown"}`;
//         if (this.input.type === "array") {
//             this.arrayItem = new SchemaNode(this.input.items, this.context, this.accessPath);
//         } else {
//             if (this.input.allOf && this.input.allOf.length > 0) {
//                 this.input.allOf.forEach((schema) => {
//                     // make this a guard
//                     if (typeof schema === "object" && "$ref" in schema) {
//                         this.extensions.push(new TypeNode(this.context, schema, this.accessPath));
//                     } else {
//                         this.schemasToMerge.push(new SchemaNode(schema, this.context, this.accessPath));
//                     }
//                 });
//             }

//             if (this.input.properties) {
//                 this.properties = Object.entries(this.input.properties).map(([name, property]) => {
//                     return new PropertyNode(name, property, this.context, this.accessPath);
//                 });
//             }
//         }
//     }

//     outputFdrShape = (): FdrAPI.api.latest.ObjectType => {
//         return {
//             extends: this.extensions.map((extension) => extension.outputFdrShape()),
//             properties: this.properties.map((property) => property.outputFdrShape()),
//             extraProperties: this.extraProperties?.outputFdrShape(),
//         };
//     };
// }

// export class AvailabilityNode<InputNode extends ApiNode<unknown, unknown>>
//     implements ApiNode<InputNode & { "x-fern-availability": string }, FernRegistry.Availability | undefined> {

//     id: string;

//     constructor(
//         readonly context: ApiNodeContext,
//         readonly input: InputNode,
//         readonly accessPath: ApiNode<unknown, unknown>[],
//     ) {
//         this.id = `${accessPath.map((node) => node.id).join(".")}.AvailabilityNode:${input.id}`;
//     }

//     convertAvailability = (availability: string): FernRegistry.Availability | undefined => {
//         switch (availability) {
//             case "beta":
//                 return FernRegistry.Availability.Beta;
//             case "deprecated":
//                 return FernRegistry.Availability.Deprecated;
//             case "development":
//                 return FernRegistry.Availability.InDevelopment;
//             case "pre-release":
//                 return FernRegistry.Availability.PreRelease;
//             case "stabel":
//                 return FernRegistry.Availability.Stable;
//             case "generally-available":
//                     return FernRegistry.Availability.GenerallyAvailable;
//             default:
//                 return undefined;
//         }
//     };

//     outputFdrShape = (): FernRegistry.Availability | undefined => {
//         return "x-fern-availability" in this.input ? this.convertAvailability(this.input["x-fern-availability"] as string) : undefined;
//     };
// }

// export class DemoTypeStage implements FdrStage<OpenAPIV3_1.SchemaObject, FdrAPI.api.latest.TypeShape> {
//     id: string;

//     constructor(
//         readonly context: ApiNodeContext,
//         readonly input: OpenAPIV3_1.SchemaObject,
//         readonly accessPath: ApiNode<unknown, unknown>[],
//     ) {
//         this.id = `${accessPath.map((node) => node.id).join(".")}.DemoTypeStage:${input.title ?? input.$schema ?? "unknown"}`;

//         switch (input.type) {
//             case "object":
//                 return new DemoSchemaNode(this.context, this.input, this.accessPath);
//             case "array":
//                 return new DemoListNode(this.context, this.input, this.accessPath);
//             default:
//                 return new TypeNode(this.context, this.input, this.accessPath);
//         }
//     }
//     outputFdrShape: () => FdrAPI.api.latest.TypeShape {

//     };
// }

// export class DemoStringNode implements ApiNode<OpenAPIV3_1.SchemaObject, FdrAPI.api.latest.PrimitiveType> {
//     id: string;

//     regex: string | undefined;
//     format: string | undefined;
//     default: string | undefined;
//     minLength: number | undefined;
//     maxLength: number | undefined;

//     constructor(
//         readonly context: ApiNodeContext,
//         readonly input: OpenAPIV3_1.SchemaObject,
//         readonly accessPath: ApiNode<unknown, unknown>[],
//     ) {
//         this.id = `${accessPath.map((node) => node.id).join(".")}.DemoStringNode`;
//         this.regex = input.pattern;
//         // this.format = input.format;
//         this.default = input.default;
//         this.minLength = input.minLength;
//         this.maxLength = input.maxLength;
//     }

//     outputFdrShape = (): FdrAPI.api.latest.PrimitiveType => {
//         return {
//             type: "string",
//             regex: this.regex,
//             minLength: this.minLength,
//             maxLength: this.maxLength,
//             default: this.default,
//         }
//     };
// }

// export class DemoTypeShapeStage implements FdrStage<OpenAPIV3_1.SchemaObject, FdrAPI.api.latest.TypeShape> {
//     id: string;

//     stringNode: DemoStringNode | undefined;

//     constructor(
//         readonly context: ApiNodeContext,
//         readonly input: OpenAPIV3_1.SchemaObject,
//         readonly accessPath: ApiNode<unknown, unknown>[],
//     ) {
//         this.id = `${accessPath.map((node) => node.id).join(".")}.DemoTypeShapeStage`;

//         if (input.type === "string") {
//             this.stringNode = new DemoStringNode(this.context, this.input, this.accessPath);
//         }
//     }

//     outputFdrShape = (): FdrAPI.api.latest.TypeShape => {
//         // we include this because this is non-exhaustive for now, for demo purposes
//         if (!this.stringNode) {
//             throw new Error("String node is undefined");
//         }

//         return {
//             type: "alias",
//             value: {
//                 type: "primitive",
//                 value: this.stringNode.outputFdrShape(),
//             },
//         }
//     };
// }

// export class DemoPropertyNode implements ApiNode<OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject, FdrAPI.api.latest.ObjectProperty> {
//     id: string;

//     propertyShape: DemoTypeShapeStage | undefined = undefined;
//     availability: AvailabilityNode<this> | undefined = undefined;

//     constructor(
//         readonly name: string,
//         readonly context: ApiNodeContext,
//         readonly input: OpenAPIV3_1.SchemaObject,
//         readonly accessPath: ApiNode<unknown, unknown>[],
//     ) {
//         this.id = `${accessPath.map((node) => node.id).join(".")}.DemoPropertyNode`;

//         if (input.type === "string") {
//             this.propertyShape = new DemoTypeShapeStage(this.context, this.input, this.accessPath);
//         }
//         this.availability = new AvailabilityNode(this.context, this, this.accessPath);
//     }

//     outputFdrShape = (): FdrAPI.api.latest.ObjectProperty => {
//         // we include this because this is non-exhaustive for now, for demo purposes
//         if (!this.propertyShape) {
//             throw new Error("Property shape is undefined");
//         }

//         return {
//             key: FdrAPI.PropertyKey(this.name),
//             valueShape: this.propertyShape.outputFdrShape(),
//             description: this.input.description,
//             availability: this.availability?.outputFdrShape(),
//         }
//     };
// }

// export class DemoTypeDiscriminationStage implements FdrApiStage<OpenAPIV3_1.SchemaObject, FdrAPI.api.latest.TypeShape> {
//     id: string;

//     properties: DemoPropertyNode[] = [];

//     constructor(
//         readonly context: ApiNodeContext,
//         readonly input: OpenAPIV3_1.SchemaObject,
//         readonly accessPath: ApiNode<unknown, unknown>[],
//     ) {
//         this.id = `${accessPath.map((node) => node.id).join(".")}.DemoTypeDiscriminationStage`;

//         if (input.type === "object" && input.properties) {
//             this.properties = Object.entries(input.properties).map(([name, property]) => {
//                 return new DemoPropertyNode(name, property, this.context, this.accessPath);
//             });
//         }
//     }

//     outputFdrShape = (): FdrAPI.api.latest.TypeShape => {

//     };
// }

// export class DemoSchemaNode implements ApiNode<OpenAPIV3_1.SchemaObject, FdrAPI.api.latest.TypeDefinition> {
//     id: string;

//     constructor(
//         readonly name: string,
//         readonly context: ApiNodeContext,
//         readonly input: OpenAPIV3_1.SchemaObject,
//         readonly accessPath: ApiNode<unknown, unknown>[],
//     ) {
//         this.id = `${accessPath.map((node) => node.id).join(".")}.DemoTypeDefinitionNode`;
//         this.shape = new DemoTypeDiscriminationStage(this.context, this.input, this.accessPath);
//     }

//     outputFdrShape = (): FdrAPI.api.latest.TypeDefinition => {
//         return {
//             name: this.name,
//             shape:
//         }
//     };
// }

// export class ComponentsNode implements ApiNode<OpenAPIV3_1.ComponentsObject, FdrAPI.api.latest.TypeDefinition[]> {
//     id: string;

//     schemas: DemoSchemaNode[] = [];

//     constructor(
//         readonly context: ApiNodeContext,
//         readonly input: OpenAPIV3_1.ComponentsObject,
//         readonly accessPath: ApiNode<unknown, unknown>[],
//     ) {
//         this.id = `${accessPath.map((node) => node.id).join(".")}.ComponentsNode`;
//         this.schemas = Object.entries(this.input.schemas ?? {}).map(([name, schema]) => {
//             return new DemoSchemaNode(name, this.context, schema, this.accessPath);
//         });
//     }

//     outputFdrShape = (): FdrAPI.api.latest.TypeDefinition[] => {
//         return this.schemas.map((schema) => schema.outputFdrShape());
//     };

// }
