import { EndpointDefinition } from "@fern-api/fdr-sdk/api-definition";
import { atom, useAtomValue } from "jotai";
import { useMemoOne } from "use-memo-one";
import { READ_APIS_ATOM } from "../../../atoms";
import { findEndpoint } from "../../../util/processRequestSnippetComponents";

export function useFindEndpoint(method: string, path: string): EndpointDefinition | undefined {
    return useAtomValue(
        useMemoOne(
            () =>
                atom((get) => {
                    let endpoint: EndpointDefinition | undefined;
                    for (const apiDefinition of Object.values(get(READ_APIS_ATOM))) {
                        endpoint = findEndpoint({
                            apiDefinition,
                            path,
                            method,
                        });
                        if (endpoint) {
                            break;
                        }
                    }
                    return endpoint;
                }),
            [method, path],
        ),
    );
}
