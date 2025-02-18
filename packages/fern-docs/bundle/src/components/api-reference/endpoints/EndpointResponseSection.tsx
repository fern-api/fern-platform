import "server-only";

import React from "react";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";

import { MdxSerializer } from "@/server/mdx-serializer";

import { TypeReferenceDefinitions } from "../type-definitions/TypeReferenceDefinitions";

export function EndpointResponseSection({
  serialize,
  body,
  types,
}: {
  serialize: MdxSerializer;
  body: ApiDefinition.HttpResponseBodyShape;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}) {
  switch (body.type) {
    case "empty":
    case "fileDownload":
    case "streamingText":
      return null;
    case "stream":
      return (
        <TypeReferenceDefinitions
          serialize={serialize}
          shape={body.shape}
          types={types}
        />
      );
    default:
      return (
        <TypeReferenceDefinitions
          serialize={serialize}
          shape={body}
          types={types}
        />
      );
  }
}
