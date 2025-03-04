"use client";

import React from "react";
import { preload } from "react-dom";

import { GitFork, Github, Star } from "lucide-react";
import useSWRImmutable from "swr/immutable";

import { cn } from "@fern-docs/components";

import { FernLinkButton } from "@/components/FernLinkButton";

/* eslint-disable @typescript-eslint/no-deprecated */

type GitHubInfo = {
  repo: string;
  stars: number;
  forks: number;
};

function GitHubStat({
  icon: Icon,
  value,
}: {
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  value: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <Icon className="size-icon-sm" />
      {value}
    </div>
  );
}

export function GitHubWidget({
  repo,
  className,
  id,
}: {
  repo: string;
  className?: string;
  id?: string;
}) {
  const href = `https://api.github.com/repos/${repo}`;
  preload(href, { as: "fetch" });

  const { data } = useSWRImmutable<GitHubInfo | null>(
    href,
    async () => {
      const res = await fetch(href, { cache: "force-cache" });
      if (!res.ok) {
        return null;
      }
      const result = await res.json();
      return {
        repo: result.full_name,
        stars: result.stargazers_count,
        forks: result.forks,
      };
    },
    { revalidateOnFocus: false }
  );

  if (!data) {
    return null;
  }

  return (
    <FernLinkButton
      href={`https://github.com/${repo}`}
      icon={<Github className="!size-icon-lg" strokeWidth={1} />}
      variant="minimal"
      id={id}
      className={cn("h-10", className)}
      scroll={true}
    >
      <div className="font-medium">{repo}</div>
      <div className="flex gap-2 text-xs">
        <GitHubStat icon={Star} value={data.stars} />
        <GitHubStat icon={GitFork} value={data.forks} />
      </div>
    </FernLinkButton>
  );
}
