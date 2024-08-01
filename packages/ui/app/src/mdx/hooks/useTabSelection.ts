import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { FERN_GROUPS, Group, useGroup } from "../../atoms";

export const useTabSelection:  = ({
    groupId,
}: {
    groupId?: string;
}): { selected: string; setSelected: (val: string) => void } => {
    const { selectedGroup } = useGroup({ key: groupId });
    const [_, setGroups] = useAtom<Group>(FERN_GROUPS);
    const [selectedTabIndex, setSelectedTabIndex] = useState("0");

    useEffect(() => {
        if (groupId && selectedGroup && selectedGroup[groupId]) {
            setSelectedTabIndex(selectedGroup[groupId] as string);
        }
    }, [groupId, selectedGroup]);

    const setSelected = (value: string) => {
        if (groupId) {
            setGroups((prev) => {
                return { ...prev, [groupId]: value };
            });
        } else {
            setSelectedTabIndex(value);
        }
    };

    return { selected: selectedTabIndex, setSelected };
};
