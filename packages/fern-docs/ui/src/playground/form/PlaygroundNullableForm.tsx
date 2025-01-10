import {
  TypeDefinition,
  TypeShapeOrReference,
} from "@fern-api/fdr-sdk/api-definition";
import { memo } from "react";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";

interface PlaygroundNullableFormProps {
  shape: TypeShapeOrReference;
  onChange: (value: unknown) => void;
  value: unknown;
  id: string;
  types: Record<string, TypeDefinition>;
}

export const PlaygroundNullableForm = memo<PlaygroundNullableFormProps>(
  ({ shape, onChange, value, id, types }) => {
    return (
      <PlaygroundTypeReferenceForm
        id={id}
        shape={shape}
        onChange={onChange}
        types={types}
        value={value}
        defaultValue={null}
      />
    );
  }
);

PlaygroundNullableForm.displayName = "PlaygroundNullableForm";
