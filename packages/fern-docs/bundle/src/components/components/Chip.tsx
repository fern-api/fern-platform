"use client";

import { ReactElement } from "react";

import { cn } from "@fern-docs/components";
import { FernTooltip } from "@fern-docs/components";
import { useCopyToClipboard } from "@fern-ui/react-commons";

type ChipProps = {
  name: string;
  description?: React.ReactNode;
  small?: boolean;
};

export const Chip = ({
  name,
  description = undefined,
  small,
}: ChipProps): ReactElement<any> => {
  const { copyToClipboard, wasJustCopied } = useCopyToClipboard(name);
  return (
    <FernTooltip
      open={wasJustCopied ? true : !description ? false : undefined}
      content={wasJustCopied ? "Copied!" : description}
    >
      <span
        className={cn(
          "text-body bg-(color:--grayscale-a3) hover:bg-(color:--grayscale-a4) flex cursor-default items-center font-mono text-xs",
          {
            ["rounded-3/2 h-5 px-1.5 py-1"]: small,
            ["rounded-2 h-6 px-2 py-1"]: !small,
          }
        )}
        style={{
          fontSize: small ? "10px" : undefined,
        }}
        onClick={copyToClipboard}
      >
        <span>{name}</span>
      </span>
    </FernTooltip>
  );
};
