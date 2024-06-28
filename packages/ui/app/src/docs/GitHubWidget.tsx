import { GitHubLogoIcon, StarIcon } from "@radix-ui/react-icons";
import { GitFork } from "iconoir-react";
import React from "react";
import useSWR from "swr";
import { FernLinkButton } from "../components/FernLinkButton";
import { GitHubInfo, getGitHubInfo } from "../util/github";

const GitHubStat: React.FC<{
    icon: React.ElementType;
    value: number;
}> = ({ icon: Icon, value }) => {
    return (
        <div className="flex items-center gap-1">
            <Icon className="size-3" />
            {value}
        </div>
    );
};

export const GitHubWidget: React.FC<{ repo: string }> = ({ repo }) => {
    const { data } = useSWR<GitHubInfo | null>(repo, getGitHubInfo);

    if (!data) {
        return null;
    }

    return (
        <FernLinkButton
            href={`https://github.com/${repo}`}
            icon={<GitHubLogoIcon className="!size-5" />}
            variant="minimal"
            className="h-10"
        >
            <div className="font-medium">{repo}</div>
            <div className="flex gap-2 text-xs">
                <GitHubStat icon={StarIcon} value={data.stars} />
                <GitHubStat icon={GitFork} value={data.forks} />
            </div>
        </FernLinkButton>
    );
};
