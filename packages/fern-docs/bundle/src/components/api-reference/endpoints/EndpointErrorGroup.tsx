import "server-only";

import React from "react";

import { sortBy } from "es-toolkit/array";

import { ApiDefinition } from "@fern-api/fdr-sdk";
import { ErrorResponse } from "@fern-api/fdr-sdk/api-definition";
import { Slug } from "@fern-api/fdr-sdk/navigation";

import { DocsLoader } from "@/server/docs-loader";

import { EndpointError } from "./EndpointError";
import { EndpointErrorGroupClient } from "./EndpointErrorGroupClient";

export function EndpointErrorGroup({
  loader,
  anchorIdParts,
  slug,
  errors,
  types,
}: {
  loader: DocsLoader;
  anchorIdParts: string[];
  slug: Slug;
  errors: ErrorResponse[];
  types: Record<string, ApiDefinition.TypeDefinition>;
}) {
  return (
    <EndpointErrorGroupClient
      errors={sortBy(errors, [(e) => e.statusCode, (e) => e.name]).map(
        (error) => ({
          children: (
            <EndpointError
              loader={loader}
              error={error}
              anchorIdParts={anchorIdParts}
              slug={slug}
              availability={error.availability}
              types={types}
            />
          ),
          data: error,
        })
      )}
    />
  );
}
