import { ActivityLog } from "@/components/sdks/ActivityLog";
import { BreadcrumbHeader } from "@/components/sdks/BreadcrumbHeader";
import { SdkCardGroup, SdkGroupGroup } from "@/components/sdks/SdkContextCard";
import { ZeroState } from "@/components/sdks/ZeroState";
import { Api, DummyApis } from "@/components/sdks/mock-data/Api";
import { DummyGroups } from "@/components/sdks/mock-data/Sdk";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import ReactSplit, { GutterTheme, SplitDirection } from "@devbookhq/splitter";
import { FernButton, FernButtonGroup, FernDropdown, FernInput, FernTooltip } from "@fern-ui/components";
import { Cross1Icon, ExternalLinkIcon, InfoCircledIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createLazyFileRoute("/api/$apiId")({
    component: () => <ApiContent />,
});

const ApiContent = () => {
    const { apiId } = Route.useParams();

    // [Data] TODO: Fetch the SDKs for the current API
    const api = DummyApis.find((a: Api) => a.id === apiId);
    return api != null ? (
        <>
            <BreadcrumbHeader
                entries={[
                    { name: api.name, options: DummyApis.map((api) => ({ name: api.name, path: `/api/${api.id}` })) },
                ]}
            />
            <div className="h-[calc(100vh-4rem)] relative top-16">
                <ReactSplit
                    direction={SplitDirection.Horizontal}
                    classes={["min-w-[55%]", "min-w-[25%]"]}
                    initialSizes={[60, 40]}
                    gutterTheme={GutterTheme.Light}
                >
                    <SdkPane apiName={api.name} />
                    <ActivityPane />
                </ReactSplit>
            </div>
        </>
    ) : (
        <ZeroState title="No API Found" description="An API for the specified ID could not be found." />
    );
};

const SdkPane = ({ apiName }: { apiName: string }): JSX.Element => {
    // TODO: add groups into here, new SDK button becomes New Group, and we keep the "New SDK" button
    const linkIcon = <ExternalLinkIcon />;
    const manageApiOptions: FernDropdown.Option[] = [
        {
            type: "value",
            label: "Edit API Spec",
            icon: linkIcon,
            value: "edit",
            href: "[Data] TODO: Link to github API spec",
        },
        {
            type: "value",
            label: "Edit Overrides",
            icon: linkIcon,
            value: "edit-overrides",
            href: "[Data] TODO: Link to github overrides file",
        },
        {
            type: "value",
            label: "Edit Settings",
            icon: linkIcon,
            value: "edit-settings",
            href: "[Data] TODO: Link to github generators.yml",
        },
    ];
    return (
        <div className="flex flex-col gap-y-6 overflow-hidden h-[calc(100vh-4rem)] p-10">
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-col">
                    <h2>Your SDKs</h2>
                    <span>For API {apiName}</span>
                </div>
                <FernButtonGroup>
                    <FernDropdown options={manageApiOptions}>
                        <FernButton icon="wrench" disabled>
                            Manage API
                        </FernButton>
                    </FernDropdown>
                </FernButtonGroup>
            </div>
            <Separator decorative />
            <ScrollArea className="flex flex-col flex-grow shrink px-6 gap-y-6" type="auto">
                {/* Only show the groups segmentation if there are multiple groups 
                    [Data] TODO: fetch data of the form `DummyGroupContext`
                */}
                <div className="flex flex-col gap-y-6">
                    {DummyGroups.length > 1 ? (
                        <SdkGroupGroup groups={DummyGroups} />
                    ) : (
                        <SdkCardGroup sdks={DummyGroups[0].sdks} />
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

const ActivityPane = (): JSX.Element => {
    // [Data] TODO: Fetch the activity log for the API

    // TODO: see what search filters GitHub exposes on a get commits endpoint
    // if nothing we will likely have to move this over to the backend.
    // This would also let us enrich it with metadata about impacted SDKs, etc.
    const [search, setSearch] = useState<string | undefined>();

    return (
        <div className="flex flex-col px-2 py-6 gap-y-6 overflow-hidden h-[calc(100vh-4rem)]">
            <div className="flex flex-row justify-between items-end px-4">
                <h4>Activity</h4>
                <FernInput
                    leftIcon={<MagnifyingGlassIcon />}
                    value={search}
                    onValueChange={setSearch}
                    rightElement={
                        (search || "").length > 0 ? (
                            <FernButton variant="minimal" onClick={() => setSearch(undefined)}>
                                <Cross1Icon />
                            </FernButton>
                        ) : (
                            <FernTooltip content="Search through commits, authors and more.">
                                <InfoCircledIcon />
                            </FernTooltip>
                        )
                    }
                    placeholder="Search activity"
                    className="border"
                />
            </div>
            <div className="px-4">
                <Separator decorative />
            </div>
            <ScrollArea className="flex flex-grow shrink px-6" type="auto">
                <ActivityLog
                    groupId="TODO: we need to factor groups into this mix"
                    repoURL="[Data] TODO: github repo URL"
                    activityFilter={search}
                />
            </ScrollArea>
        </div>
    );
};
