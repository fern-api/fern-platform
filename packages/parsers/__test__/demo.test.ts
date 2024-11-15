import { expect } from "vitest";

import { ComponentsNode } from "../openapi/demo";

import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { describe, it } from "vitest";
import { ApiNodeContext, ErrorCollector } from "../openapi/base.node.interface";

describe("ComponentsNode", () => {
    describe("outputFdrShape", () => {
        it("should convert OpenAPI components to FDR type definitions", () => {
            const context: ApiNodeContext = {
                orgId: "test-org",
                apiId: "test-api",
                // @ts-expect-error logger is not required
                logger: console,
                errorCollector: new ErrorCollector(),
            };

            const input: OpenAPIV3_1.ComponentsObject = {
                schemas: {
                    Person: {
                        // @ts-expect-error availability is not an out of the box OpenApi Property
                        "x-fern-availability": "generally-available",
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                            },
                        },
                    },
                },
            };

            const componentsNode = new ComponentsNode(context, input, []);
            const result = componentsNode.outputFdrShape();

            expect(result).toHaveLength(1);

            const personType = result[0];
            expect(personType?.name).toBe("Person");
            expect(personType?.availability).toBe(FdrAPI.Availability.GenerallyAvailable);
            expect(context.errorCollector.errors).toHaveLength(0);
        });

        it("should handle invalid availability value", () => {
            const context: ApiNodeContext = {
                orgId: "test-org",
                apiId: "test-api",
                // @ts-expect-error logger is not required
                logger: console,
                errorCollector: new ErrorCollector(),
            };

            const input: OpenAPIV3_1.ComponentsObject = {
                schemas: {
                    Person: {
                        // @ts-expect-error availability is not an out of the box OpenApi Property
                        "x-fern-availability": "deep",
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                            },
                        },
                    },
                },
            };

            const componentsNode = new ComponentsNode(context, input, []);
            const result = componentsNode.outputFdrShape();

            expect(result).toHaveLength(1);
            const personType = result[0];
            expect(personType?.name).toBe("Person");
            expect(personType?.availability).toBeUndefined();
            expect(context.errorCollector.errors).toHaveLength(1);
        });

        it("should handle non-string availability value", () => {
            const context: ApiNodeContext = {
                orgId: "test-org",
                apiId: "test-api",
                // @ts-expect-error logger is not required
                logger: console,
                errorCollector: new ErrorCollector(),
            };

            const input: OpenAPIV3_1.ComponentsObject = {
                schemas: {
                    Person: {
                        // @ts-expect-error availability is not an out of the box OpenApi Property
                        "x-fern-availability": true,
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                            },
                        },
                    },
                },
            };

            const componentsNode = new ComponentsNode(context, input, []);
            const result = componentsNode.outputFdrShape();

            expect(result).toHaveLength(1);
            const personType = result[0];
            expect(personType?.name).toBe("Person");
            expect(personType?.availability).toBeUndefined();
            expect(context.errorCollector.errors).toHaveLength(1);
        });

        it("should handle deprecated flag", () => {
            const context: ApiNodeContext = {
                orgId: "test-org",
                apiId: "test-api",
                // @ts-expect-error logger is not required
                logger: console,
                errorCollector: new ErrorCollector(),
            };

            const input: OpenAPIV3_1.ComponentsObject = {
                schemas: {
                    Person: {
                        deprecated: true,
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                            },
                        },
                    },
                },
            };

            const componentsNode = new ComponentsNode(context, input, []);
            const result = componentsNode.outputFdrShape();

            expect(result).toHaveLength(1);
            const personType = result[0];
            expect(personType?.name).toBe("Person");
            expect(personType?.availability).toBe("Deprecated");
            expect(context.errorCollector.errors).toHaveLength(0);
        });
    });
});
