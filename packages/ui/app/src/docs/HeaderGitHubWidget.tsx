import { GitHubLogoIcon, StarIcon } from "@radix-ui/react-icons";
import { GitFork } from "iconoir-react";
import React from "react";

export type GitHubProps = {
  repo: string;
  stars: number;
  forks: number;
}

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

export const HeaderGitHubWidget: React.FC<GitHubProps> = ({ repo, stars, forks }) => {
  return (
    <div className="flex items-center gap-3">
      <GitHubLogoIcon className="size-6" />
      <div>
        <a href={`https://github.com/${repo}`} target="_blank" className="hover:underline font-semibold" rel="noreferrer">{repo}</a>
        <div className="flex gap-2 text-xs">
          <GitHubStat icon={StarIcon} value={stars} />
          <GitHubStat icon={GitFork} value={forks} />
        </div>
      </div>
    </div>
  );
};