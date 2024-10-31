import { BaseRecord, NavigationRecord } from "../types";

interface CreateNavigationRecordOptions {
    base: BaseRecord;
    node_type: string;
}

export function createNavigationRecord({ base, node_type }: CreateNavigationRecordOptions): NavigationRecord {
    return {
        ...base,
        objectID: `${base.objectID}__navigation_record`,
        type: "navigation",
        node_type,
    };
}
