import { vi } from "vitest";

export function createMockContext(): BaseOpenApiV3_1ConverterNodeContext {
    return {
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
