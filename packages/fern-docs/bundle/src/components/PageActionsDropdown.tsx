"use client";

import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { useState } from "react";


import { Check, ChevronDown, Copy } from "lucide-react";

import { FernButton, FernDropdown } from "@fern-docs/components";

import {
  CopyPageOption,
  OpenWithLLM,
  ViewAsMarkdownOption,
} from "./PageActionsDropdownOptions";

export function PageActionsDropdown({ markdown }: { markdown: string }) {
  const [showCopied, setShowCopied] = useState<boolean>(false);
  const { domain, slug } = useParams();
  const { theme, resolvedTheme } = useTheme();

  const activeTheme = theme === "system" ? resolvedTheme : theme;
  
  
  const copyOption = CopyPageOption();
  const viewAsMarkdownOption = ViewAsMarkdownOption(activeTheme ?? "light");

  const options: FernDropdown.Option[] = [
    copyOption,
    { type: "separator" } as FernDropdown.SeparatorOption,
    viewAsMarkdownOption,
    { type: "separator" } as FernDropdown.SeparatorOption,
    OpenWithLLM({ domain, slug, llm: "ChatGPT", theme: activeTheme ?? "light" }),
    { type: "separator" } as FernDropdown.SeparatorOption,
    OpenWithLLM({ domain, slug, llm: "Claude", theme: activeTheme ?? "light" }),
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
    <div className="fern-page-actions">
      <FernButton
        variant="minimal"
        className="w-fit rounded-r-none px-2"
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
        <FernButton variant="minimal" className="rounded-l-none px-2">
          <ChevronDown className="size-icon" />
        </FernButton>
      </FernDropdown>
    </div>
  );
}
