import { GitHubLogoIcon, StarIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { GitFork } from "iconoir-react";
import React from "react";
import useSWR from "swr";
import { FernLinkButton } from "../components/FernLinkButton";

export type GitHubProps = {
    url: string;
};

const GitHubStat: React.FC<{
    icon: React.ElementType;
    value: number;
}> = ({ icon: Icon, value }) => {
    return (
        <div className="flex items-center gap-1">
            <Icon className="size-3" />
            {value >= 0 ? value : ""}
        </div>
    );
};

interface GitHubInfo {
    stars: number;
    forks: number;
    repo: string;
}

export const HeaderGitHubWidget: React.FC<GitHubProps> = ({ url }) => {
    const repo = url.match(/^https:\/\/(www\.)?github\.com\/([\w-]+\/[\w-]+)\/?$/)?.[2];
    const { data } = useSWR<GitHubInfo | null>(
        url,
        async () => {
            if (repo == null) {
                return null;
            }
            const res = await fetch(`https://api.github.com/repos/${repo}`);
            if (res.ok) {
                const result = await res.json();
                return {
                    repo: result.full_name,
                    stars: result.stargazers_count,
                    forks: result.forks,
                };
            }
            return null;
        },
        {
            refreshInterval: 1000 * 60 * 60, // 1 hour
            keepPreviousData: true,
        },
    );

    if (repo == null) {
        return null;
    }

    return (
        <FernLinkButton href={url} icon={<GitHubLogoIcon className="!size-5" />} variant="minimal" className="h-10">
            <div className="font-medium">{data?.repo ?? repo}</div>
            <div
                className={clsx("flex gap-2 text-xs", {
                    invisible: data == null,
                })}
            >
                <GitHubStat icon={StarIcon} value={data?.stars ?? 0} />
                <GitHubStat icon={GitFork} value={data?.forks ?? 0} />
            </div>
        </FernLinkButton>
    );
};
