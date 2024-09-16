import { cn } from "@/lib/utils";
import { FernButton, RemoteFontAwesomeIcon } from "@fern-ui/components";
import pluralize from "pluralize";
import { Separator } from "../ui/separator";
import { DummyGroupContext, DummySdkContext, SdkChecksStatus, SdkLanguage, SdkPublishStatus } from "./mock-data/Sdk";

export function getIconForSdk(language: SdkLanguage) {
    switch (language) {
        case SdkLanguage.PYTHON:
            return "fa-brands fa-python";
        case SdkLanguage.TYPESCRIPT:
            return "fa-brands fa-js";
        case SdkLanguage.GO:
            return "fa-brands fa-golang";
        case SdkLanguage.RUBY:
            return "fa-solid fa-gem";
        case SdkLanguage.JAVA:
            return "fa-brands fa-java";
        case SdkLanguage.CSHARP:
            return "fa-brands fa-microsoft"; // TODO: change to csharp icon
        case SdkLanguage.SWIFT:
            return "fa-brands fa-swift";
        default:
            return "fa-solid fa-code";
    }
}

// TODO(armandobelardo): This should effectively come from Github
interface CheckStatusContent {
    icon: string;
    color: string;
    text: string;
}
function getCheckStatusContent(status: SdkChecksStatus): CheckStatusContent {
    switch (status) {
        case SdkChecksStatus.SUCCESSFUL:
            return {
                icon: "circle-check",
                color: "text-green",
                text: "Checks passing",
            };
        case SdkChecksStatus.RUNNING:
            return {
                icon: "retweet",
                color: "text-muted",
                text: "Checks running",
            };
        case SdkChecksStatus.FAILED:
            return {
                icon: "circle-exclamation",
                color: "text-red",
                text: "Checks failed",
            };
    }
}

// TODO(armandobelardo): This should effectively come from Fern
interface PublishStatusContent {
    icon: string;
    color: string;
    text: string;
    buttonStatus?: "PRIMARY" | "DISABLED";
}
function getPublishStatusContent(status: SdkPublishStatus): PublishStatusContent {
    switch (status) {
        case SdkPublishStatus.UP_TO_DATE:
            return {
                icon: "circle-check",
                color: "text-green",
                text: "Up to Date",
                buttonStatus: "DISABLED",
            };
        case SdkPublishStatus.OUT_OF_DATE:
            return {
                icon: "circle-up",
                color: "text-primary",
                text: "Publish New Release",
                buttonStatus: "PRIMARY",
            };
        case SdkPublishStatus.PUBLISHING:
            return {
                icon: "fa-duotone fa-loader",
                color: "text-amber",
                text: "Publishing...",
            };
    }
}

export const SdkGroupGroup: React.FC<{ groups: DummyGroupContext[] }> = ({ groups }) => {
    return (
        <div className="flex flex-col gap-y-6">
            {groups.map((group) => (
                <SdkGroupContextCard group={group} />
            ))}
            <FernButton icon="circle-plus" variant="outlined" disabled full>
                New Group
            </FernButton>
        </div>
    );
};

export const SdkGroupContextCard: React.FC<{ group: DummyGroupContext }> = ({ group }) => {
    return (
        <div className="flex flex-col gap-y-6 rounded-sm border p-6">
            <div className="flex flex-row justify-between">
                <h2>{group.name}</h2>
                <FernButton icon="circle-up" disabled>
                    Release All SDKs
                </FernButton>
            </div>
            <SdkCardGroup sdks={group.sdks} />
        </div>
    );
};

export const SdkCardGroup: React.FC<{ sdks: DummySdkContext[] }> = ({ sdks }) => {
    return (
        <div className="flex flex-col gap-y-6">
            <div className="flex flex-col gap-y-6">
                {sdks.map((sdk) => (
                    <SdkContextCard key={sdk.id} sdk={sdk} />
                ))}
            </div>
            <FernButton icon="circle-plus" variant="outlined" disabled>
                New SDK
            </FernButton>
        </div>
    );
};

export interface DummySdkContextCardProps {
    sdk: DummySdkContext;
}

export const SdkContextCard: React.FC<DummySdkContextCardProps> = (props) => {
    const icon = <RemoteFontAwesomeIcon size={10} icon={getIconForSdk(props.sdk.language)} />;

    // TODO(armandobelardo): Check status should come from Github
    const checkValues = [SdkChecksStatus.FAILED, SdkChecksStatus.SUCCESSFUL, SdkChecksStatus.RUNNING];
    const randomCheck = checkValues[Math.floor(Math.random() * checkValues.length)];
    const checkContent = getCheckStatusContent(randomCheck);

    // TODO(armandobelardo): Issues should come from Github
    const issuesIconColor = props.sdk.issues.length > 0 ? "text-red" : "text-green";
    const issuesText = props.sdk.issues.length > 0 ? pluralize("issues", props.sdk.issues.length, true) : "No issues";

    // TODO(armandobelardo): Publish status should come from fern maybe
    const publishStatusValues = [
        SdkPublishStatus.OUT_OF_DATE,
        SdkPublishStatus.PUBLISHING,
        SdkPublishStatus.UP_TO_DATE,
    ];
    const randomStatus = publishStatusValues[Math.floor(Math.random() * publishStatusValues.length)];
    const publishStatusContent = getPublishStatusContent(randomStatus);

    return (
        <div className="flex flex-col border rounded-md">
            <div className="flex flex-row justify-between p-4">
                <div className="flex flex-row gap-x-4 items-center">
                    {icon}
                    <div className="flex flex-col gap-y-1">
                        <div className="flex flex-row gap-x-1">
                            <span>{props.sdk.name}</span>
                            <span>{props.sdk.packageVersion}</span>
                        </div>
                        <span>{"out of date"}</span>
                    </div>
                </div>
                {/* <div className="flex flex-row py-3 gap-x-3"> */}
                <FernButton
                    icon={publishStatusContent.icon}
                    variant="outlined"
                    className={clsx(publishStatusContent.color, {
                        "shadow-[0px_0px_5px_0px_#4C1EC0AA]": publishStatusContent.buttonStatus === "PRIMARY",
                    })}
                    disabled
                >
                    {publishStatusContent.text}
                </FernButton>
                {/* </div> */}
            </div>
            <div className="border-t flex flex-row px-4 py-3 justify-between">
                <div className="flex flex-row gap-x-5">
                    <div className="flex flex-row gap-x-2 items-center">
                        <span>Generator version</span>
                        <span>{props.sdk.generatorVersion}</span>
                    </div>
                    <Separator orientation="vertical" decorative className="min-h-6" />
                    <div className="flex flex-row gap-x-2 items-center">
                        <RemoteFontAwesomeIcon icon={checkContent.icon} className={checkContent.color} />
                        <span>{checkContent.text}</span>
                    </div>
                    <Separator orientation="vertical" decorative className="min-h-6" />
                    <div className="flex flex-row gap-x-2 items-center">
                        <RemoteFontAwesomeIcon icon="fa-regular circle-dot" className={issuesIconColor} />
                        <span>{issuesText}</span>
                    </div>
                </div>
                <FernButton
                    variant="outlined"
                    icon={<RemoteFontAwesomeIcon size={4} icon="fa-brands fa-github" />}
                    onClick={() => {
                        return () => {
                            window.open(props.sdk.githubUrl, "_blank", "noopener");
                        };
                    }}
                    disabled
                />
            </div>
        </div>
    );
};
