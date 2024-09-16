import { format, isToday } from "date-fns";
import { SdkActivityStack } from "./SdkActivityStack";
import { ZeroState } from "./ZeroState";
import { SdkLanguage } from "./mock-data/Sdk";

interface ActivityLogDataEntry {
    id: string;
    timestamp: number;
    title: string;
    author: string;
    impactedSdks: SdkLanguage[];
}

interface ActivityLogData {
    entries: ActivityLogDataEntry[];
    totalEntries: number;
    pageNumber: number;
}

export interface ActivityLogProps {
    groupId: string;
    repoURL: string;
    activityFilter?: string;
}

const ActivityLogEntry = (props: ActivityLogDataEntry) => {
    return (
        <div className="flex w-full flex-row justify-between">
            <div className="flex w-full flex-row gap-x-2">
                <div className="relative h-6 w-6">
                    <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
                    <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
                </div>
                <div className="flex flex-col gap-y-2">
                    <div>{props.title}</div>
                    <div className="text-sm text-gray-500">by {props.author}</div>
                </div>
            </div>
            <SdkActivityStack sdks={props.impactedSdks} />
        </div>
    );
};

const GroupedActivitiyLog = (props: { activity: Record<string, ActivityLogDataEntry[]> }) => {
    return (
        <div className="flex flex-col gap-y-6">
            {Object.keys(props.activity).map((key) => {
                const value = props.activity[key];

                return (
                    value && (
                        <div className="flex flex-col gap-y-6">
                            <span className="font-bold">{key}</span>
                            {value.map((entry) => (
                                <ActivityLogEntry key={entry.id} {...entry} />
                            ))}
                        </div>
                    )
                );
            })}
        </div>
    );
};

const DummyActivityLog: ActivityLogData = {
    totalEntries: 5,
    pageNumber: 0,
    entries: [
        {
            id: "1",
            timestamp: Date.now(),
            title: "Introduce a new feature to the API spec, maybe it's pagination related or something else that's really cool.",
            author: "armandobelardo",
            impactedSdks: [SdkLanguage.RUBY],
        },
        {
            id: "2",
            timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
            title: "Bump generator X",
            author: "dsingvi",
            impactedSdks: [SdkLanguage.PYTHON, SdkLanguage.JAVA, SdkLanguage.TYPESCRIPT],
        },
        {
            id: "3",
            timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
            title: "Bump Fern CLI",
            author: "armandobelardo",
            impactedSdks: [],
        },
        {
            id: "4",
            timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
            title: "Add OAuth configuration",
            author: "dsingvi",
            impactedSdks: [],
        },
        {
            id: "5",
            timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
            title: "Initialize Fern",
            author: "dsingvi",
            impactedSdks: [SdkLanguage.SWIFT],
        },
    ],
};

export const ActivityLog: React.FC<ActivityLogProps> = () => {
    // TODO: get this activity log from Github + our backend, given we need to understand the impacted SDKs
    const transformedActivity: Record<string, ActivityLogDataEntry[]> = DummyActivityLog.entries.reduce(
        (group, activity) => {
            const { timestamp } = activity;
            const stringifiedTimestamp = isToday(timestamp) ? "Today" : format(timestamp, "PPPP");
            group[stringifiedTimestamp] = group[stringifiedTimestamp] ?? [];
            group[stringifiedTimestamp]?.push(activity);
            return group;
        },
        {} as Record<string, ActivityLogDataEntry[]>,
    );

    return Object.keys(transformedActivity).length > 0 ? (
        <GroupedActivitiyLog activity={transformedActivity} />
    ) : (
        <ZeroState
            icon="code-commit"
            title="No activity found for group"
            description="No information could be found from git corresponding to this group."
        />
    );
};
