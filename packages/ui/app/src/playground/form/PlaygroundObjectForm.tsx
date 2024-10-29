import { TypeDefinition, TypeShape, unwrapObjectType } from "@fern-api/fdr-sdk/api-definition";
import { ReactElement, useMemo } from "react";
import { PlaygroundObjectPropertiesForm } from "./PlaygroundObjectPropertyForm";

interface PlaygroundObjectFormProps {
    id: string;
    shape: TypeShape.Object_;
    onChange: (value: unknown) => void;
    value: unknown;
    indent?: boolean;
    types: Record<string, TypeDefinition>;
    disabled?: boolean;
}

export function PlaygroundObjectForm({ id, shape, onChange, value, types }: PlaygroundObjectFormProps): ReactElement {
    const { properties, extraProperties } = useMemo(() => unwrapObjectType(shape, types), [shape, types]);
    return (
        <PlaygroundObjectPropertiesForm
            id={id}
            properties={properties}
            extraProperties={extraProperties}
            onChange={onChange}
            value={value}
            types={types}
        />
    );
}
