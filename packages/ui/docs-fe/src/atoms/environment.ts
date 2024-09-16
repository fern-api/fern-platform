import type { APIV1Read } from "@fern-api/fdr-sdk";
import { atom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { isEndpoint, isWebSocket } from "../resolver/types";
import { FLATTENED_APIS_ATOM } from "./apis";

// Capture all possible environments in a list, in useEffect at top level
export const ALL_ENVIRONMENTS_ATOM = atom((get) => {
    const flatApis = get(FLATTENED_APIS_ATOM);
    const allEnvironmentIds = new Set<string>();
    Object.values(flatApis).forEach((api) => {
        api.endpoints.forEach((endpoint) => {
            if (isEndpoint(endpoint) || isWebSocket(endpoint)) {
                endpoint.environments.forEach((environment: APIV1Read.Environment) => {
                    allEnvironmentIds.add(environment.id);
                });
            }
        });
    });
    return Array.from(allEnvironmentIds);
});

// Get or select an environment
export const SELECTED_ENVIRONMENT_ATOM = atomWithStorage<string | undefined>("selected-environment", undefined);

export const useSelectedEnvironmentId = (): string | undefined => {
    return useAtomValue(SELECTED_ENVIRONMENT_ATOM);
};

export const useAllEnvironmentIds = (): string[] => {
    return useAtomValue(ALL_ENVIRONMENTS_ATOM);
};
