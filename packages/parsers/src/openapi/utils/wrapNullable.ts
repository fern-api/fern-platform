import { FernRegistry } from "../../client/generated";

interface NullableShape extends FernRegistry.api.latest.TypeShape.Alias {
  value: {
    type: "nullable";
    shape: FernRegistry.api.latest.TypeShape;
  };
}

export function wrapNullable(
  value: FernRegistry.api.latest.TypeShape | undefined
): NullableShape | undefined {
  if (value == null) {
    return undefined;
  }

  return {
    type: "alias" as const,
    value: {
      type: "nullable" as const,
      shape: value,
    },
  };
}
