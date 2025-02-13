import dynamic from "next/dynamic";
import React from "react";
import { useTheme } from "../../../atoms";

const JsonView = dynamic(() => import("@microlink/react-json-view"), {
  ssr: false,
});

export interface JSONProps {
  json: unknown;
}

export const Json: React.FC<JSONProps> = ({ json }) => {
  const theme = useTheme();

  return (
    <div className="mb-6 mt-4 flex w-full rounded-lg border border-[var(--grayscale-a5)] p-3 shadow-sm">
      <JsonView
        src={json as object}
        name={false}
        theme={theme === "dark" ? "ashes" : "rjv-default"}
        displayDataTypes={false}
        displayObjectSize={false}
        enableClipboard={false}
        collapsed={1}
        style={{
          backgroundColor: "transparent",
          fontFamily: "var(--typography-code-font-family)",
          fontSize: "0.875rem",
          lineHeight: "1.25rem",
        }}
        iconStyle="triangle"
        indentWidth={4}
        collapseStringsAfterLength={100}
        groupArraysAfterLength={100}
        quotesOnKeys={true}
      />
    </div>
  );
};
