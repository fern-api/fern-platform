"use client";

import { ParamValue } from "next/dist/server/request/params";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";

import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  FileText,
  MessageCircleQuestion,
} from "lucide-react";

import { FernButton, FernDropdown } from "@fern-docs/components";

const CopyPageOption = (): FernDropdown.ValueOption => {
  return {
    type: "value",
    value: "copy-page",
    label: "Copy Page",
    helperText: "Copy this page as Markdown for LLMs",
    icon: <Copy className="size-icon" />,
  } as FernDropdown.ValueOption;
};

const ViewAsMarkdownOption = (): FernDropdown.ValueOption => {
  const pathname = usePathname();
  return {
    type: "value",
    value: "view-as-markdown",
    label: "View as Markdown",
    helperText: "View this page as plain text",
    icon: <FileText className="size-icon" />,
    href: `${pathname}.md`,
    rightElement: <ExternalLink className="size-icon" />,
  } as FernDropdown.ValueOption;
};

const OpenInChatGPTOption = ({
  domain,
  slug,
}: {
  domain: ParamValue;
  slug: ParamValue;
}): FernDropdown.ValueOption => {
  const resolveParam = (param: ParamValue): string => {
    if (typeof param === "string") {
      return decodeURIComponent(param);
    } else if (Array.isArray(param)) {
      return decodeURIComponent(param.join("/"));
    } else {
      return "";
    }
  };

  const decodedDomain = resolveParam(domain);
  const decodedSlug = resolveParam(slug);

  const prompt = `I'm trying to understand the content on the following page: ${decodedDomain}${decodedSlug}. Read it so you can answer my questions.`;

  return {
    type: "value",
    value: "open-chatgpt",
    label: "Open in ChatGPT",
    helperText: "Ask questions about this page",
    icon: <MessageCircleQuestion className="size-icon" />,
    href: `https://chat.openai.com/?hint=search&q=${encodeURIComponent(prompt)}`,
    rightElement: <ExternalLink className="size-icon" />,
  } as FernDropdown.ValueOption;
};

export function PageActionsDropdown({ markdown }: { markdown: string }) {
  const [showCopied, setShowCopied] = useState<boolean>(false);
  const { domain, slug } = useParams();

  const copyOption = CopyPageOption();
  const viewAsMarkdownOption = ViewAsMarkdownOption();
  const openInChatGPTOption = OpenInChatGPTOption({ domain, slug });

  const options: FernDropdown.Option[] = [
    copyOption,
    { type: "separator" } as FernDropdown.SeparatorOption,
    viewAsMarkdownOption,
    { type: "separator" } as FernDropdown.SeparatorOption,
    openInChatGPTOption,
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
            <span>Copy Page</span>
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
