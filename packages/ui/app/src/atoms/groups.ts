import { useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type Group = Record<string, string>;

export const FERN_GROUPS = atomWithStorage<Group>("group-id", {});
FERN_GROUPS.debugLabel = "FERN_GROUPS";

export function useGroup({ key }: { key?: string }): { selectedGroup?: Group; group: Group } {
    const group = useAtomValue(FERN_GROUPS);

    if (key) {
        if (key in group && group[key]) {
            return { selectedGroup: { [key]: group[key] }, group };
        }
        return { selectedGroup: undefined, group };
    }

    return { selectedGroup: undefined, group };
}
