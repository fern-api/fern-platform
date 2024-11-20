import { vi } from "vitest";
import { BaseAPIConverterNodeContext } from "../BaseApiConverter.node";

export function createMockContext(): BaseAPIConverterNodeContext {
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
