import ReactJsonView from "@microlink/react-json-view";
import React from "react";
import { useTheme } from "../../../atoms";

export interface JSONProps {
  json: unknown;
}

export const Json: React.FC<JSONProps> = ({ json }) => {
  const theme = useTheme();

  return (
    <ReactJsonView
      src={json as object}
      name={false}
      theme={theme === "dark" ? "ashes" : "rjv-default"}
      displayDataTypes={false}
      displayObjectSize={false}
      enableClipboard={false}
      collapsed={1}
      style={{
        padding: "1rem",
        backgroundColor: "transparent",
        fontFamily: "var(--font-mono)",
        fontSize: "0.875rem",
        lineHeight: "1.25rem",
      }}
      iconStyle="triangle"
      indentWidth={2}
      collapseStringsAfterLength={100}
      groupArraysAfterLength={100}
      quotesOnKeys={true}
    />
  );
};
