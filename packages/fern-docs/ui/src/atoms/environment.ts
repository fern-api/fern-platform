import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// Capture all possible environments in a list, in useEffect at top level
export const ALL_ENVIRONMENTS_ATOM = atom<string[]>([]);

export const useSetAllEnvironments = (allEnvironmentIds: string[]): void => {
    const setAllEnvironments = useSetAtom(ALL_ENVIRONMENTS_ATOM);
    setAllEnvironments(allEnvironmentIds);
};

// Get or select an environment
export const SELECTED_ENVIRONMENT_ATOM = atomWithStorage<string | undefined>(
    "selected-environment",
    undefined
);

export const useSelectedEnvironmentId = (): string | undefined => {
    return useAtomValue(SELECTED_ENVIRONMENT_ATOM);
};

export const useAllEnvironmentIds = (): string[] => {
    return useAtomValue(ALL_ENVIRONMENTS_ATOM);
};
