"use client";

import { ReactElement } from "react";

import { Badge } from "@fern-docs/components";
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
      <Badge onClick={copyToClipboard} size={small ? "sm" : "lg"}>
        {name}
      </Badge>
    </FernTooltip>
  );
};
