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
import { constructDocsUrlParam } from "@/utils/constructDocsUrlParam";
import { getDocsSiteUrl } from "@/utils/getDocsSiteUrl";
import { DocsUrl } from "@/utils/types";

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
      onValueChange={(value) => void onClickUrl(value as DocsUrl)}
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
