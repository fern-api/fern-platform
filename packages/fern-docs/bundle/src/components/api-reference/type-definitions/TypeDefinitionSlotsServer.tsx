import "server-only";

import { TypeDefinition } from "@fern-api/fdr-sdk/api-definition";

import { MdxSerializer } from "@/server/mdx-serializer";

import { TypeDefinitionSlotsProvider } from "./TypeDefinitionSlotsClient";
import { TypeReferenceDefinitions } from "./TypeReferenceDefinitions";

export function TypeDefinitionSlotsServer({
  types,
  serialize,
  children,
}: {
  types: Record<string, TypeDefinition>;
  serialize: MdxSerializer;
  children: React.ReactNode;
}) {
  return (
    <TypeDefinitionSlotsProvider
      slots={createTypeDefinitionSlots(types, serialize)}
    >
      {children}
    </TypeDefinitionSlotsProvider>
  );
}

function createTypeDefinitionSlots(
  types: Record<string, TypeDefinition>,
  serialize: MdxSerializer
) {
  return Object.fromEntries(
    Object.entries(types).map(([id, type]) => [
      id,
      <TypeReferenceDefinitions
        key={id}
        serialize={serialize}
        shape={type.shape}
        types={types}
      />,
    ])
  );
}
