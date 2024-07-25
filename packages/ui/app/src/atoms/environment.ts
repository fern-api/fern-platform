import { atom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Environment } from "../../../../fdr-sdk/src/client/generated/api/resources/api/resources/v1/resources/read";
import { isEndpoint, isWebSocket } from "../resolver/types";
import { FLATTENED_APIS_ATOM } from "./apis";

// Capture all possible environments in a list, in useEffect at top level
export const ALL_ENVIRONMENTS_ATOM = atom((get) => {
    const flatApis = get(FLATTENED_APIS_ATOM);
    const allEnvironmentIds = new Set<string>();
    Object.values(flatApis).forEach((api) => {
        api.apiDefinitions.forEach((apiDefinition) => {
            if (isEndpoint(apiDefinition) || isWebSocket(apiDefinition)) {
                apiDefinition.environments.forEach((environment: Environment) => {
                    allEnvironmentIds.add(environment.id);
                });
            }
        });
    });
    return Array.from(allEnvironmentIds);
});

// Get or select an environment
export const SELECTED_ENVIRONMENT_ATOM = atomWithStorage<string | undefined>("selected-environment-atom", undefined);

export const useSelectedEnvironmentId = (): string | undefined => {
    return useAtomValue(SELECTED_ENVIRONMENT_ATOM);
};
