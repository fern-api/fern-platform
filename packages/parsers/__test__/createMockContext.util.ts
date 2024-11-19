import { createLogger } from "@fern-api/logger";
import { BaseAPIConverterNodeContext } from "../BaseApiConverter.node";
import { ErrorCollector } from "../ErrorCollector";

export function createMockContext(): BaseAPIConverterNodeContext {
    return {
        orgId: "orgId",
        apiId: "apiId",
        logger: createLogger(() => undefined),
        errors: new ErrorCollector(),
    };
}
