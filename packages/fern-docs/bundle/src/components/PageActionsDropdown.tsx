"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Check, ChevronDown, Copy } from "lucide-react";

import { FernButton, FernDropdown } from "@fern-docs/components";
import { getEdgeFlags } from "@fern-docs/edge-config";

import {
  CopyPageOption,
  OpenWithLLM,
  ViewAsMarkdownOption,
} from "./PageActionsDropdownOptions";

export function PageActionsDropdown({ markdown }: { markdown: string }) {
  const [showCopied, setShowCopied] = useState<boolean>(false);
  const [isAskAiEnabled, setIsAskAiEnabled] = useState<boolean>(false);
  const { domain, slug } = useParams();

  useEffect(() => {
    const fetchEdgeFlags = async () => {
      try {
        const flags = await getEdgeFlags(domain as string);
        setIsAskAiEnabled(flags.isAskAiEnabled || false);
      } catch (error) {
        console.log("Failed to fetch edge flags:", error);
        setIsAskAiEnabled(false);
      }
    };

    void fetchEdgeFlags();
  }, []);

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
      >
        <FernButton variant="outlined" className="rounded-l-none px-2">
          <ChevronDown className="size-icon" />
        </FernButton>
      </FernDropdown>
    </div>
  );
}
