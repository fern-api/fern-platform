import { vi } from "vitest";
import { ApiNodeContext } from "../openapi/ApiNode";

import { createLogger } from "@fern-api/logger";

export function createMockContext(): ApiNodeContext {
    return {
        orgId: "orgId",
        apiId: "apiId",
        logger: createLogger(() => undefined),
        errorCollector: {
            addError: vi.fn(),
            errors: [],
        },
    };
}
