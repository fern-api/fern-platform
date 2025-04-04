"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { Check, ChevronDown, Copy } from "lucide-react";

import { FernButton, FernDropdown } from "@fern-docs/components";

import { useIsAskAiEnabled } from "@/state/search";

import {
  CopyPageOption,
  OpenWithLLM,
  ViewAsMarkdownOption,
} from "./PageActionsDropdownOptions";

export function PageActionsDropdown({ markdown }: { markdown: string }) {
  const [showCopied, setShowCopied] = useState<boolean>(false);
  const isAskAiEnabled = useIsAskAiEnabled();
  const { domain, slug } = useParams();

  const copyOption = CopyPageOption();
  const viewAsMarkdownOption = ViewAsMarkdownOption();

  const options: FernDropdown.Option[] = [
    copyOption,
    { type: "separator" } as FernDropdown.SeparatorOption,
    viewAsMarkdownOption,
    ...(!isAskAiEnabled
      ? [
          { type: "separator" } as FernDropdown.SeparatorOption,
          OpenWithLLM({ domain, slug, llm: "ChatGPT" }),
          { type: "separator" } as FernDropdown.SeparatorOption,
          OpenWithLLM({ domain, slug, llm: "Claude" }),
        ]
      : []),
  ];

  const handleValueChange = async (value: string) => {
    if (value === "copy-page") {
      if (markdown) {
        await navigator.clipboard.writeText(markdown).then(() => {
          setShowCopied(true);

          setTimeout(() => {
            setShowCopied(false);
          }, 2000);
        });
      }
    }
  };

  return (
    <div className="flex">
      <FernButton
        variant="outlined"
        className="w-[120px] min-w-[120px] rounded-r-none border-r-0"
        onClick={() => handleValueChange("copy-page")}
      >
        {showCopied ? (
          <div className="flex items-center gap-2">
            <Check className="size-icon" />
            <span>Copied!</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Copy className="size-icon" />
            <span>Copy page</span>
          </div>
        )}
      </FernButton>
      <FernDropdown
        options={options}
        onValueChange={handleValueChange}
        dropdownMenuElement={<a target="_blank" rel="noopener noreferrer" />}
        className={isAskAiEnabled === undefined ? "pointer-events-none" : ""}
        aria-disabled={isAskAiEnabled === undefined}
      >
        <FernButton variant="outlined" className="rounded-l-none px-2">
          <ChevronDown className="size-icon" />
        </FernButton>
      </FernDropdown>
    </div>
  );
}
