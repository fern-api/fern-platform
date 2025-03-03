import { cn, CopyToClipboardButton } from "@fern-docs/components";
import { useIsMobile } from "@fern-docs/search-ui";
import dynamic from "next/dynamic";
import React from "react";
import { useTheme } from "../../../atoms";
import "./index.scss";

const JsonView = dynamic(() => import("@microlink/react-json-view"), {
  ssr: false,
});

export interface JSONProps {
  json: unknown;
  enableFernClipboard?: boolean;
  showStringsOnOneLine?: boolean; // Tied to CSS
  jsonViewProps?: React.ComponentProps<typeof JsonView>;
}

export const Json: React.FC<JSONProps> = ({
  json,
  enableFernClipboard = true,
  showStringsOnOneLine = true,
  jsonViewProps,
}) => {
  const theme = useTheme();
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "not-prose group/cb-container bg-card relative mb-6 mt-4 flex w-full rounded-lg border border-[var(--grayscale-a5)] p-3 shadow-sm",
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
          width: "100%",
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
