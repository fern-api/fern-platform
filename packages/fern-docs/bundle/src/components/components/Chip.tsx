import { ReactElement } from "react";

import { FernTooltip } from "@fern-docs/components";
import { useCopyToClipboard } from "@fern-ui/react-commons";
import cn from "clsx";

import { Markdown } from "../mdx/Markdown";

type ChipProps = {
  name: string;
  description?: string | undefined;
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
      open={wasJustCopied ? true : description == null ? false : undefined}
      content={
        wasJustCopied ? (
          "Copied!"
        ) : description != null ? (
          <Markdown mdx={description} className="text-xs" />
        ) : undefined
      }
    >
      <span
        className={cn(
          "t-default bg-tag-default hover:bg-tag-default-hover flex cursor-default items-center font-mono text-xs",
          {
            ["h-5 rounded-md px-1.5 py-1"]: small,
            ["h-6 rounded-lg px-2 py-1"]: !small,
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
