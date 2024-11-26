import { OpenAPIV3_1 } from "openapi-types";
import { vi } from "vitest";
import { BaseOpenApiV3_1ConverterNodeContext } from "../openapi/BaseOpenApiV3_1Converter.node";

export function createMockContext(document?: OpenAPIV3_1.Document): BaseOpenApiV3_1ConverterNodeContext {
    return {
        document: document ?? ({} as OpenAPIV3_1.Document),
        logger: {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
            log: vi.fn(),
        },
        errors: {
            error: vi.fn(),
            warning: vi.fn(),
            warnings: [],
            errors: [],
        },
    };
}
