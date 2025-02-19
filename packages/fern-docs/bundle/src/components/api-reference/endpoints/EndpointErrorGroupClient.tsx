"use client";

import React from "react";

import { ErrorResponse } from "@fern-api/fdr-sdk/api-definition";

import { useEndpointContext } from "./EndpointContext";
import { EndpointErrorClient } from "./EndpointErrorClient";

export function EndpointErrorGroupClient({
  errors,
}: {
  errors: {
    children: React.ReactNode;
    data: ErrorResponse;
  }[];
}) {
  const errorRef = React.useRef<HTMLDivElement>(null);
  const { selectedError, setSelectedError } = useEndpointContext();

  // if the user clicks outside of the error, clear the selected error
  React.useEffect(() => {
    if (selectedError == null || errorRef.current == null) {
      return;
    }
    const handleClick = (event: MouseEvent) => {
      if (event.target == null) {
        return;
      }

      if (
        event.target instanceof Node &&
        errorRef.current?.contains(event.target)
      ) {
        return;
      }

      // check that target is not inside of ".fern-endpoint-code-snippets"
      if (
        event.target instanceof HTMLElement &&
        event.target.closest(".fern-endpoint-code-snippets") != null
      ) {
        return;
      }

      // if the target is the body, then the event propagation was prevented by a radix button
      if (event.target === window.document.body) {
        return;
      }

      setSelectedError(undefined);
    };

    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [selectedError, setSelectedError]);

  return (
    <div
      className="border-border-default flex flex-col overflow-visible rounded-lg border"
      ref={errorRef}
    >
      {errors.map((error, idx) => (
        <EndpointErrorClient
          key={idx}
          error={error.data}
          isFirst={idx === 0}
          isLast={idx === (errors?.length ?? 0) - 1}
          isSelected={
            selectedError != null && isErrorEqual(error.data, selectedError)
          }
          onClick={(event) => {
            event.stopPropagation();
            setSelectedError(error.data);
          }}
          availability={error.data.availability}
        >
          {error.children}
        </EndpointErrorClient>
      ))}
    </div>
  );
}

function isErrorEqual(a: ErrorResponse, b: ErrorResponse): boolean {
  return (
    a.statusCode === b.statusCode &&
    (a.name != null && b.name != null
      ? a.name === b.name
      : a.name == null && b.name == null)
  );
}
