"use client";

import { useState } from "react";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import { FdrAPI } from "@fern-api/fdr-sdk";

export declare namespace DocsSiteLink {
  export interface Props {
    docsSiteUrl: FdrAPI.dashboard.DocsSiteUrl;
  }
}

export function DocsSiteLink({ docsSiteUrl }: DocsSiteLink.Props) {
  const { domain, path } = docsSiteUrl;

  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={new URL(path ?? "", `https://${domain}`).toString()}
      target="_blank"
      className="text-gray-1100 hover:border-b-gray-1100 inline-flex items-center gap-1 border-b border-b-transparent dark:text-gray-400 dark:hover:border-b-gray-400"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {domain}
      {path}
      {isHovered && <ArrowTopRightOnSquareIcon className="size-4" />}
    </a>
  );
}
