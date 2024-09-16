import { APIResponse } from "@fern-api/venus-api-sdk/core";

export function getAPIResponse<Success, Failure>(response?: APIResponse<Success, Failure>): Success | undefined {
    if (!response) {
        return undefined;
    }
    if (response.ok) {
        return response.body;
    }
    throw new Error(`Received error from response: ${JSON.stringify(response.error)}`);
}
