"use client";

import { useEffect, useState } from "react";

import { FdrAPI } from "@fern-api/fdr-sdk";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { constructDocsUrlParam } from "@/lib/constructDocsUrlParam";
import { getDocsSiteUrl } from "@/lib/getDocsSiteUrl";
import { DocsUrl } from "@/lib/types";

export declare namespace DocsSiteSelect {
  export interface Props {
    currentDocsUrl: string | undefined;
    docsSites: FdrAPI.dashboard.DocsSite[];
  }
}

export const DocsSiteSelect = ({
  currentDocsUrl,
  docsSites,
}: DocsSiteSelect.Props) => {
  const [localValue, setLocalValue] = useState(currentDocsUrl);
  useEffect(() => {
    setLocalValue(currentDocsUrl);
  }, [currentDocsUrl]);

  const onClickUrl = async (newUrl: DocsUrl) => {
    if (newUrl === currentDocsUrl) {
      return;
    }
    setLocalValue(newUrl);
    window.location.href = `/docs/${constructDocsUrlParam(newUrl)}`;
  };

  return (
    <Select
      value={localValue}
      onValueChange={onClickUrl}
      disabled={docsSites.length === 0}
    >
      <SelectTrigger className="min-w-[180px]">
        <SelectValue placeholder="Organization" />
      </SelectTrigger>
      <SelectContent>
        {docsSites.map((docsSite) => {
          const url = getDocsSiteUrl(docsSite);
          return (
            <SelectItem key={url} value={url}>
              {url}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
