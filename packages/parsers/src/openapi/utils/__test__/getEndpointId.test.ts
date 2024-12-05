import { getEndpointId } from "../getEndpointId";

describe("getEndpointId", () => {
    it("converts method and path to kebab case", () => {
        expect(getEndpointId("GET", "/users")).toBe("get-users");
    });

    it("handles multiple path segments", () => {
        expect(getEndpointId("POST", "/users/orders/items")).toBe("post-users-orders-items");
    });

    it("handles uppercase methods", () => {
        expect(getEndpointId("DELETE", "/users")).toBe("delete-users");
    });

    it("handles path parameters", () => {
        expect(getEndpointId("PUT", "/users/{userId}")).toBe("put-users-user-id");
    });

    it("handles empty path", () => {
        expect(getEndpointId("GET", "")).toBe("get");
    });

    it("handles path with trailing slash", () => {
        expect(getEndpointId("POST", "/users/")).toBe("post-users");
    });
});
