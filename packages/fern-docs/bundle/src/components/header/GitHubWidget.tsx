import React from "react";

import clsx from "clsx";
import { GitFork, GithubCircle, Star } from "iconoir-react";
import useSWR from "swr";

import { FernLinkButton } from "../components/FernLinkButton";
import { GitHubInfo, getGitHubInfo } from "../util/github";

const GitHubStat: React.FC<{
  icon: React.ElementType;
  value: number;
}> = ({ icon: Icon, value }) => {
  return (
    <div className="flex items-center gap-1">
      <Icon className="size-icon-sm" />
      {value}
    </div>
  );
};

export const GitHubWidget: React.FC<{
  repo: string;
  className?: string;
  id?: string;
}> = ({ repo, className, id }) => {
  const { data } = useSWR<GitHubInfo | null>(repo, getGitHubInfo);

  if (!data) {
    return null;
  }

  return (
    <FernLinkButton
      href={`https://github.com/${repo}`}
      icon={<GithubCircle className="!size-icon-lg" strokeWidth={1} />}
      variant="minimal"
      id={id}
      className={clsx("h-10", className)}
    >
      <div className="font-medium">{repo}</div>
      <div className="flex gap-2 text-xs">
        <GitHubStat icon={Star} value={data.stars} />
        <GitHubStat icon={GitFork} value={data.forks} />
      </div>
    </FernLinkButton>
  );
};
