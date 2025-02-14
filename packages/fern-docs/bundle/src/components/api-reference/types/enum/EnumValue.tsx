import React from "react";

import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";

import { Chip } from "@/components/components/Chip";
import { MdxServerComponentProseSuspense } from "@/components/mdx/server-component";
import { DocsLoader } from "@/server/docs-loader";

export function EnumValue({
  loader,
  enumValue,
}: {
  loader: DocsLoader;
  enumValue: ApiDefinition.EnumValue;
}) {
  return (
    <Chip
      name={enumValue.value}
      description={
        <MdxServerComponentProseSuspense
          loader={loader}
          mdx={enumValue.description}
          size="xs"
        />
      }
    />
  );
}
