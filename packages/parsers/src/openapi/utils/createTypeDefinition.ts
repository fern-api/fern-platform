import { FernRegistry } from "../../client/generated";

export function createTypeDefinition(typeArgs: {
  uniqueId: string;
  type: FernRegistry.api.latest.TypeShape;
  contextTypes: Record<
    FernRegistry.TypeId,
    FernRegistry.api.latest.TypeDefinition
  >;
  description?: string | undefined;
  availability?: FernRegistry.Availability | undefined;
}) {
  const { uniqueId, type, contextTypes, description, availability } = typeArgs;

  contextTypes[FernRegistry.TypeId(uniqueId)] = {
    name: uniqueId,
    shape: type,
    description,
    availability,
  };
}
