import { getSlugForFirstNavigatableEndpointOrWebhook } from "../../subpackage.js";
import {
    DEFINITION,
    SUBPACKAGE_EMPTY,
    SUBPACKAGE_WITH_2_ENDPOINTS,
    SUBPACKAGE_WITH_NESTED_SUBPACKAGES,
} from "./mock.js";

describe("getSlugForFirstNavigatableEndpointOrWebhook()", () => {
    describe("correctly gets the first navigatable slug", () => {
        it("within empty subpackage", () => {
            const result = getSlugForFirstNavigatableEndpointOrWebhook(SUBPACKAGE_EMPTY, [], DEFINITION);
            expect(result).toEqual(undefined);
        });

        it("within subpackage with 2 endpoints", () => {
            const result = getSlugForFirstNavigatableEndpointOrWebhook(SUBPACKAGE_WITH_2_ENDPOINTS, [], DEFINITION);
            expect(result).toEqual("ep_1");
        });

        it("within subpackage with nested subpackages", () => {
            const result = getSlugForFirstNavigatableEndpointOrWebhook(
                SUBPACKAGE_WITH_NESTED_SUBPACKAGES,
                [],
                DEFINITION,
            );
            expect(result).toEqual("sub_2/ep_1");
        });
    });
});
