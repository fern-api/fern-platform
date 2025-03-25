"use client";

import { useEffect, useState } from "react";

import { DocsSite } from "@fern-platform/fdr";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDocsSiteUrl } from "@/lib/getDocsSiteUrl";

export declare namespace DocsSiteSelect {
  export interface Props {
    currentDomain: string;
    docsSites: DocsSite[];
  }
}

export const DocsSiteSelect = ({
  currentDomain,
  docsSites,
}: DocsSiteSelect.Props) => {
  const [localValue, setLocalValue] = useState(currentDomain);
  useEffect(() => {
    setLocalValue(currentDomain);
  }, [currentDomain]);

  const onClickDomain = async (newDomain: string) => {
    if (newDomain === currentDomain) {
      return;
    }
    setLocalValue(currentDomain);
    window.location.href = `/docs/${encodeURIComponent(newDomain)}`;
  };

  return (
    <Select
      value={localValue}
      onValueChange={onClickDomain}
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
