import type { APIV1Read } from "@fern-api/fdr-sdk";
import { atom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { APIS_ATOM } from "./apis";

// Capture all possible environments in a list, in useEffect at top level
export const ALL_ENVIRONMENTS_ATOM = atom((get) => {
    const allEnvironmentIds = new Set<string>();
    Object.values(get(APIS_ATOM)).forEach((api) => {
        Object.values(api.endpoints).forEach((endpoint) => {
            endpoint.environments.forEach((environment: APIV1Read.Environment) => {
                allEnvironmentIds.add(environment.id);
            });
        });
        Object.values(api.websockets).forEach((websocket) => {
            websocket.environments.forEach((environment: APIV1Read.Environment) => {
                allEnvironmentIds.add(environment.id);
            });
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
