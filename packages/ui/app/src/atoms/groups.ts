import { useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const FERN_GROUPS = atomWithStorage<{ key: string; value: string }[]>("group-id", []);
FERN_GROUPS.debugLabel = "FERN_GROUPS";

export interface Group {
    key: string;
    value: string;
}

export function useGroup({ key }: { key?: string }): { selectedGroup?: Group; groups: Group[] } {
    const groups = useAtomValue(FERN_GROUPS);
    if (key) {
        return { selectedGroup: groups.find((group) => group.key === key), groups };
    }
    return { selectedGroup: undefined, groups };
}
