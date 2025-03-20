"use client";

import React from "react";

import { Badge } from "@fern-docs/components";
import { FernTooltip } from "@fern-docs/components";
import { useCopyToClipboard } from "@fern-ui/react-commons";

type ChipProps = {
  name: string;
  description?: React.ReactNode;
};

const ChipSizeCtx = React.createContext<"sm" | "lg">("lg");

export const ChipSizeProvider = ({
  children,
  size,
}: {
  children: React.ReactNode;
  size: "sm" | "lg";
}) => {
  return <ChipSizeCtx.Provider value={size}>{children}</ChipSizeCtx.Provider>;
};

export const Chip = ({ name, description = undefined }: ChipProps) => {
  const { copyToClipboard, wasJustCopied } = useCopyToClipboard(name);
  const size = React.useContext(ChipSizeCtx);
  return (
    <FernTooltip
      open={wasJustCopied ? true : !description ? false : undefined}
      content={wasJustCopied ? "Copied!" : description}
    >
      <Badge onClick={copyToClipboard} size={size}>
        {name}
      </Badge>
    </FernTooltip>
  );
};
