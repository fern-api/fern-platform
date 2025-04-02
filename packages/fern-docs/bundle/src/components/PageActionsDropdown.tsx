"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import {
  Check,
  ChevronDown,
  Copy,
  FileText,
  MessageCircleQuestion,
} from "lucide-react";

import { FernButton, FernDropdown } from "@fern-docs/components";

import { FernLink } from "./FernLink";
import { ParamValue } from "next/dist/server/request/params";

const CopyPageOption = (markdown: string): FernDropdown.ValueOption => {
  return {
    type: "value",
    value: "copy-page",
    label: "Copy Page",
    helperText: "Copy this page as Markdown for LLMs",
    icon: <Copy className="size-icon" />,
    onClick: async () => {
      if (markdown) {
        await navigator.clipboard.writeText(markdown);
      }
    },
  } as FernDropdown.ValueOption;
};

const ViewAsMarkdownOption = ({
  domain,
  slug
}: {
  domain: ParamValue,
  slug: ParamValue,
}): FernDropdown.ValueOption => {
  return {
    type: "value",
    value: "view-as-markdown",
    label: (
      <FernLink
        href={`${domain}/api/fern-docs/markdown?slug=${slug}`}
        showExternalLinkIcon
        target="_blank"
      >
        View as Markdown
      </FernLink>
    ),
    helperText: "View this page as plain text",
    icon: <FileText className="size-icon" />,
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
    label: (
      <FernLink
        href={`https://chat.openai.com/?hint=search&q=${encodeURIComponent(prompt)}`}
        showExternalLinkIcon
      >
        Open in ChatGPT
      </FernLink>
    ),
    helperText: "Ask questions about this page",
    icon: <MessageCircleQuestion className="size-icon" />,
  } as FernDropdown.ValueOption;
};


export function PageActionsDropdown({ markdown }: { markdown: string }) {
  const [showCopied, setShowCopied] = useState<boolean>(false);
  const { domain, slug } = useParams();

  const copyOption = CopyPageOption(markdown);
  const viewAsMarkdownOption = ViewAsMarkdownOption({ domain, slug });
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
        await navigator.clipboard.writeText(markdown)
          .then(() => {
            setShowCopied(true);
            
            setTimeout(() => {
              setShowCopied(false);
            }, 2000);
          })
      }
    }
  };

  const handleCopyClick = async (
    e: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    e.stopPropagation();

    if (markdown) {
      await navigator.clipboard.writeText(markdown).then(() => {
        setShowCopied(true);

        setTimeout(() => {
          setShowCopied(false);
        }, 2000);
      });
    }
  };

  const buttonContent = (): React.ReactNode => {
    if (showCopied) {
      return (
        <div className="flex items-center gap-2">
          <Check className="size-icon" />
          <span>Copied!</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <Copy className="size-icon" />
          <span>Copy Page</span>
        </div>
      );
    }
  };

  return (
    <div className="flex">
      <FernButton
        variant="outlined"
        className="w-[120px] min-w-[120px] rounded-r-none border-r-0"
        onClick={handleCopyClick}
      >
        {buttonContent()}
      </FernButton>
      <FernDropdown
        options={options}
        onValueChange={handleValueChange}
      >
        <FernButton variant="outlined" className="rounded-l-none px-2">
          <ChevronDown className="size-icon" />
        </FernButton>
      </FernDropdown>
    </div>
  );
}