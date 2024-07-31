import { useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const FERN_CODE_GROUP_TAB = atomWithStorage<{ groupId: string; value: string }[]>("code-group-tab-id", []);
FERN_CODE_GROUP_TAB.debugLabel = "FERN_CODE_GROUP_TAB";

export interface Group {
    groupId: string;
    value: string;
}

export function useCodeGroup({ groupId }: { groupId?: string }): { selectedGroup?: Group; groupIds: Group[] } {
    const groupIds = useAtomValue(FERN_CODE_GROUP_TAB);
    if (groupId) {
        return { selectedGroup: groupIds.find((pair) => pair.groupId === groupId), groupIds };
    }
    return { selectedGroup: undefined, groupIds };
}
