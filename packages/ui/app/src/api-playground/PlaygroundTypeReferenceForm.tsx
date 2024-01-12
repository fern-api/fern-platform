import { InputGroup, NumericInput, Switch, TextArea } from "@blueprintjs/core";
import { DateInput3 } from "@blueprintjs/datetime2";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { FC, useCallback } from "react";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { getAllObjectProperties } from "../api-page/utils/getAllObjectProperties";
import { PlaygroundDiscriminatedUnionForm } from "./PlaygroundDescriminatedUnionForm";
import { PlaygroundEnumForm } from "./PlaygroundEnumForm";
import { PlaygroundListForm } from "./PlaygroundListForm";
import { PlaygroundMapForm } from "./PlaygroundMapForm";
import { PlaygroundObjectPropertyForm } from "./PlaygroundObjectPropertyForm";
import { PlaygroundUniscriminatedUnionForm } from "./PlaygroundUniscriminatedUnionForm";
import { castToRecord } from "./utils";

interface PlaygroundTypeReferenceFormProps {
    typeReference: APIV1Read.TypeReference;
    doNotNest?: boolean;
    onChange: (value: unknown) => void;
    value?: unknown;
}

export const PlaygroundTypeReferenceForm: FC<PlaygroundTypeReferenceFormProps> = ({
    typeReference,
    doNotNest,
    onChange,
    value,
}) => {
    const { resolveTypeById } = useApiDefinitionContext();

    const onChangeObject = useCallback(
        (key: string, value: unknown | ((oldValue: unknown) => unknown)) => {
            onChange((oldValue: unknown) => {
                const oldObject = castToRecord(oldValue);
                return {
                    ...oldObject,
                    [key]: typeof value === "function" ? value(oldObject[key]) : value,
                };
            });
        },
        [onChange]
    );
    return visitDiscriminatedUnion(typeReference, "type")._visit({
        id: ({ value: typeId }) => {
            const typeShape = resolveTypeById(typeId)?.shape;

            if (typeShape == null) {
                return null;
            }

            return visitDiscriminatedUnion(typeShape, "type")._visit({
                object: (object) => (
                    <ul
                        className={
                            doNotNest
                                ? "my-4 w-full list-none space-y-4"
                                : "border-border-default-light dark:border-border-default-dark w-full list-none space-y-4 border-l pl-4"
                        }
                    >
                        {getAllObjectProperties(object, resolveTypeById).map((property) => (
                            <PlaygroundObjectPropertyForm
                                key={property.key}
                                property={property}
                                onChange={onChangeObject}
                                value={castToRecord(value)[property.key]}
                            />
                        ))}
                    </ul>
                ),
                alias: ({ value: aliasType }) => (
                    <PlaygroundTypeReferenceForm typeReference={aliasType} onChange={onChange} value={value} />
                ),
                enum: ({ values }) => <PlaygroundEnumForm enumValues={values} onChange={onChange} value={value} />,
                undiscriminatedUnion: (undiscriminatedUnion) => (
                    <PlaygroundUniscriminatedUnionForm
                        undiscriminatedUnion={undiscriminatedUnion}
                        onChange={onChange}
                        value={value}
                    />
                ),
                discriminatedUnion: (discriminatedUnion) => (
                    <PlaygroundDiscriminatedUnionForm
                        discriminatedUnion={discriminatedUnion}
                        onChange={onChange}
                        value={value}
                    />
                ),
                _other: () => null,
            });
        },
        primitive: (primitive) => (
            <div className="min-w-0 flex-1">
                {visitDiscriminatedUnion(primitive.value, "type")._visit({
                    string: () => (
                        <InputGroup
                            fill={true}
                            value={typeof value === "string" ? value : ""}
                            onValueChange={onChange}
                        />
                    ),
                    boolean: () => (
                        <Switch
                            large={true}
                            checked={typeof value === "boolean" ? value : undefined}
                            onChange={(e) => onChange(e.target.checked)}
                            className="-mb-1"
                        />
                    ),
                    integer: () => (
                        <NumericInput
                            fill={true}
                            minorStepSize={null}
                            value={typeof value === "number" ? value : undefined}
                            onValueChange={onChange}
                        />
                    ),
                    double: () => (
                        <NumericInput
                            fill={true}
                            value={typeof value === "number" ? value : undefined}
                            onValueChange={onChange}
                        />
                    ),
                    long: () => (
                        <NumericInput
                            fill={true}
                            minorStepSize={null}
                            value={typeof value === "number" ? value : undefined}
                            onValueChange={onChange}
                        />
                    ),
                    datetime: () => (
                        <DateInput3
                            placeholder="MM/DD/YYYY"
                            timePrecision="millisecond"
                            value={typeof value === "string" ? value : undefined}
                            onChange={onChange}
                        />
                    ),
                    uuid: () => (
                        <InputGroup
                            fill={true}
                            value={typeof value === "string" ? value : ""}
                            onValueChange={onChange}
                            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        />
                    ),
                    base64: () => (
                        <TextArea
                            fill={true}
                            value={typeof value === "string" ? value : ""}
                            onChange={(e) => onChange(e.target.value)}
                        />
                    ),
                    date: () => (
                        <DateInput3
                            placeholder="MM/DD/YYYY"
                            value={typeof value === "string" ? value : undefined}
                            onChange={onChange}
                        />
                    ),
                    _other: () => null,
                })}
            </div>
        ),
        optional: () => null, // should be handled by the parent
        list: (list) => <PlaygroundListForm itemType={list.itemType} onChange={onChange} value={value} />,
        set: (set) => <PlaygroundListForm itemType={set.itemType} onChange={onChange} value={value} />,
        map: (map) => (
            <PlaygroundMapForm keyType={map.keyType} valueType={map.valueType} onChange={onChange} value={value} />
        ),
        literal: (literal) => (
            <div>
                <span>
                    {typeof literal.value.value === "boolean"
                        ? literal.value.value
                            ? "TRUE"
                            : "FALSE"
                        : literal.value.value}
                </span>
            </div>
        ),
        unknown: () => (
            <TextArea
                fill={true}
                value={typeof value === "string" ? value : ""}
                onChange={(e) => onChange(e.target.value)}
            />
        ),
        _other: () => null,
    });
};
