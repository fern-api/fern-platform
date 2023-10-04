import { getSlugForFirstNavigatableEndpointOrWebhook } from "../../subpackage";
import { definition, subpackageEmpty, subpackageWith2Endpoints, subpackageWithNestedSubpackages } from "./mock";

describe("getSlugForFirstNavigatableEndpointOrWebhook()", () => {
    describe("correctly gets the first navigatable slug", () => {
        it("within empty subpackage", () => {
            const result = getSlugForFirstNavigatableEndpointOrWebhook(subpackageEmpty, [], definition);
            expect(result).toEqual(undefined);
        });

        it("within subpackage with 2 endpoints", () => {
            const result = getSlugForFirstNavigatableEndpointOrWebhook(subpackageWith2Endpoints, [], definition);
            expect(result).toEqual("ep_1");
        });

        it("within subpackage with nested subpackages", () => {
            const result = getSlugForFirstNavigatableEndpointOrWebhook(subpackageWithNestedSubpackages, [], definition);
            expect(result).toEqual("sub_2/ep_1");
        });
    });
});
