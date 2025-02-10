"use client";

import React from "react";

import { ApiDefinition } from "@fern-api/fdr-sdk";
import { ErrorResponse } from "@fern-api/fdr-sdk/api-definition";
import { Slug } from "@fern-api/fdr-sdk/navigation";
import { sortBy } from "es-toolkit/array";

import { useEndpointContext } from "./EndpointContext";
import { EndpointError } from "./EndpointError";
import { convertNameToAnchorPart } from "./utils";

export function EndpointErrorGroup({
  anchorIdParts,
  slug,
  errors,
  types,
}: {
  anchorIdParts: string[];
  slug: Slug;
  errors: ErrorResponse[];
  types: Record<string, ApiDefinition.TypeDefinition>;
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
      className="border-default flex flex-col overflow-visible rounded-lg border"
      ref={errorRef}
    >
      {sortBy(errors, [(e) => e.statusCode, (e) => e.name]).map(
        (error, idx) => {
          return (
            <EndpointError
              key={idx}
              error={error}
              isFirst={idx === 0}
              isLast={idx === (errors?.length ?? 0) - 1}
              isSelected={
                selectedError != null && isErrorEqual(error, selectedError)
              }
              onClick={(event) => {
                event.stopPropagation();
                setSelectedError(error);
              }}
              anchorIdParts={[
                ...anchorIdParts,
                `${convertNameToAnchorPart(error.name) ?? error.statusCode}`,
              ]}
              slug={slug}
              availability={error.availability}
              types={types}
            />
          );
        }
      )}
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
