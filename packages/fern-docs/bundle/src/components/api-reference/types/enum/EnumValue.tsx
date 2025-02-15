import React from "react";

import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";

import { Chip } from "@/components/components/Chip";
import { MdxServerComponentProseSuspense } from "@/components/mdx/server-component";
import { MdxSerializer } from "@/server/mdx-serializer";

export function EnumValue({
  serialize,
  enumValue,
}: {
  serialize: MdxSerializer;
  enumValue: ApiDefinition.EnumValue;
}) {
  return (
    <Chip
      name={enumValue.value}
      description={
        <MdxServerComponentProseSuspense
          serialize={serialize}
          mdx={enumValue.description}
          size="xs"
        />
      }
    />
  );
}
