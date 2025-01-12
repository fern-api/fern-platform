import {
  TypeDefinition,
  TypeShape,
  unwrapObjectType,
} from "@fern-api/fdr-sdk/api-definition";
import { ReactElement, useMemo } from "react";
import { ExplorerObjectPropertiesForm } from "./ExplorerObjectPropertyForm";

interface ExplorerObjectFormProps {
  id: string;
  shape: TypeShape.Object_;
  onChange: (value: unknown) => void;
  value: unknown;
  indent?: boolean;
  types: Record<string, TypeDefinition>;
  disabled?: boolean;
  defaultValue?: unknown;
}

export function ExplorerObjectForm({
  id,
  shape,
  onChange,
  value,
  types,
  defaultValue,
}: ExplorerObjectFormProps): ReactElement {
  const { properties, extraProperties } = useMemo(
    () => unwrapObjectType(shape, types),
    [shape, types]
  );
  return (
    <ExplorerObjectPropertiesForm
      id={id}
      properties={properties}
      extraProperties={extraProperties}
      onChange={onChange}
      value={value}
      defaultValue={defaultValue}
      types={types}
    />
  );
}
