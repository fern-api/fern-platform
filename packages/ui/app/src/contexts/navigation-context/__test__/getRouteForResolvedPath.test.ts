import { getRouteForResolvedPath } from "../getRouteForResolvedPath";

describe("getRouteForResolvedPath", () => {
    it("correctly combines slugs from resolved path and router asPath", () => {
        type Tuple = [fullSlug: string, asPath: string];
        const args: Tuple[] = [
            ["introduction", "/introduction"],
            ["payments-api/create-a-payment", "/payments-api/create-a-payment"],
            [
                "v1/payments-api/create-a-payment",
                "/v1/payments-api/create-a-payment#payments_api-create_payment-response-status",
            ],
            [
                "api-reference/payments-api/authorize-a-payment",
                "/v2/api-reference/payments-api/authorize-a-payment#payments_api-authorize_payment-response-transactions",
            ],
        ];
        const expectedRoutes = [
            "/introduction",
            "/payments-api/create-a-payment",
            "/v1/payments-api/create-a-payment#payments_api-create_payment-response-status",
            "/api-reference/payments-api/authorize-a-payment#payments_api-authorize_payment-response-transactions",
        ];
        expect(args.map(([resolvedSlug, asPath]) => getRouteForResolvedPath({ resolvedSlug, asPath }))).toEqual(
            expectedRoutes,
        );
    });
});
