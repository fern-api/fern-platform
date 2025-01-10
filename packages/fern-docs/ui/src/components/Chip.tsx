import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { Badge, FernTooltip } from "@fern-docs/components";
import { useCopyToClipboard } from "@fern-ui/react-commons";
import { ReactElement } from "react";
import { Markdown } from "../mdx/Markdown";

type ChipProps = {
  name: string;
  description?: FernDocs.MarkdownText | undefined;
  small?: boolean;
};

export const Chip = ({
  name,
  description = undefined,
  small,
}: ChipProps): ReactElement => {
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
      <Badge interactive onClick={copyToClipboard} size={small ? "sm" : "lg"}>
        {name}
      </Badge>
    </FernTooltip>
  );
};
