import dynamic from "next/dynamic";
import React from "react";

import { CopyToClipboardButton, cn } from "@fern-docs/components";
import { useIsMobile } from "@fern-ui/react-commons";

import { useResolvedTheme } from "@/hooks/use-theme";

import "./index.scss";

const JsonView = dynamic(() => import("@microlink/react-json-view"), {
  ssr: false,
});

export interface JSONProps {
  json: unknown;
  enableFernClipboard?: boolean;
  showStringsOnOneLine?: boolean;
  jsonViewProps?: React.ComponentProps<typeof JsonView>;
}

export const Json: React.FC<JSONProps> = ({
  json,
  enableFernClipboard = true,
  showStringsOnOneLine = false,
  jsonViewProps,
}) => {
  const theme = useResolvedTheme();
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "not-prose bg-card-background rounded-3 border-card-border shadow-card-grayscale relative mb-6 mt-4 flex w-full overflow-hidden border p-3",
        showStringsOnOneLine && !isMobile && "show-strings-on-one-line"
      )}
    >
      <JsonView
        src={json as object}
        name={false}
        theme={theme === "dark" ? "ashes" : "rjv-default"}
        displayDataTypes={false}
        displayObjectSize={true}
        enableClipboard={false}
        collapsed={1}
        style={{
          backgroundColor: "transparent",
          fontFamily: "var(--typography-code-font-family)",
          fontSize: "0.875rem",
          lineHeight: "1.25rem",
        }}
        iconStyle="square"
        indentWidth={4}
        collapseStringsAfterLength={60}
        groupArraysAfterLength={100}
        quotesOnKeys={true}
        displayArrayKey={true}
        {...jsonViewProps}
      />
      {enableFernClipboard && (
        <CopyToClipboardButton
          className={cn(
            "fern-copy-button absolute z-20",
            "opacity-0 backdrop-blur transition group-hover/cb-container:opacity-100",
            "right-3 top-2"
          )}
          content={() => JSON.stringify(json)}
        />
      )}
    </div>
  );
};
