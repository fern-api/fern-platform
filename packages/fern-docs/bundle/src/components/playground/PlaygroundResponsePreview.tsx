"use client";

import { FC, useEffect, useMemo, useRef } from "react";

import {
  FernSyntaxHighlighter,
  type ScrollToHandle,
} from "@fern-docs/syntax-highlighter";

import { PlaygroundResponse } from "./types/playgroundResponse";

interface PlaygroundResponsePreviewProps {
  response: PlaygroundResponse;
}

export const PlaygroundResponsePreview: FC<PlaygroundResponsePreviewProps> = ({
  response,
}) => {
  const responseJson = useMemo(
    () =>
      typeof response.response.body === "string"
        ? response.response.body
        : JSON.stringify(response.response.body, null, 2),
    [response]
  );
  const viewportRef = useRef<ScrollToHandle>(null);

  // const [shouldScroll, setShouldScroll] = useState(true);

  // Scroll to bottom if shouldScroll is true
  useEffect(() => {
    const { current } = viewportRef;
    if (current && response.type === "stream") {
      current.scrollToLast();
    }
  }, [response.type, responseJson]);

  return (
    <FernSyntaxHighlighter
      className="relative min-h-0 flex-1 shrink"
      language={getLanguage(response)}
      code={responseJson}
      fontSize="sm"
      viewportRef={viewportRef}
    />
  );
};

function getLanguage(response: PlaygroundResponse): string {
  if (response.type === "file") {
    return "text";
  }

  if (response.type === "stream") {
    return "json"; // TODO: support other types
  }

  if (response.contentType.includes("text/html")) {
    return "html";
  } else if (response.contentType.includes("application/json")) {
    return "json";
  } else if (response.contentType.includes("application/xml")) {
    return "xml";
  } else if (response.contentType.includes("text/css")) {
    return "css";
  } else if (response.contentType.includes("text/javascript")) {
    return "typescript";
  } else if (response.contentType.includes("text/plain")) {
    return "text";
  } else {
    return "text";
  }
}
