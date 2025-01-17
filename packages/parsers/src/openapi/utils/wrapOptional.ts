import { FernRegistry } from "../../client/generated";

interface OptionalShape extends FernRegistry.api.latest.TypeShape.Alias {
  value: {
    type: "optional";
    shape: FernRegistry.api.latest.TypeShape;
    default: unknown;
  };
}

export function wrapOptional(
  value: FernRegistry.api.latest.TypeShape,
  default_: unknown
): OptionalShape {
  return {
    type: "alias" as const,
    value: {
      type: "optional" as const,
      shape: value,
      default: default_,
    },
  };
}
