import { Button, InputGroup, NumericInput, Switch, TextArea } from "@blueprintjs/core";
import { DateInput3 } from "@blueprintjs/datetime2";
import { ArrowLeft } from "@blueprintjs/icons";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { Transition } from "@headlessui/react";
import { FC, useCallback } from "react";
import { TypeShapeShorthand } from "../api-page/types/type-shorthand/ReferencedTypePreviewPart";
import { getAllObjectProperties } from "../api-page/utils/getAllObjectProperties";
import { useApiPlaygroundContext } from "./ApiPlaygroundContext";
import { PlaygroundDiscriminatedUnionForm } from "./PlaygroundDescriminatedUnionForm";
import { PlaygroundEnumForm } from "./PlaygroundEnumForm";
import { PlaygroundListForm } from "./PlaygroundListForm";
import { PlaygroundMapForm } from "./PlaygroundMapForm";
import { PlaygroundObjectPropertyForm } from "./PlaygroundObjectPropertyForm";
import { PlaygroundUniscriminatedUnionForm } from "./PlaygroundUniscriminatedUnionForm";
import { castToRecord } from "./utils";

interface PlaygroundTypeReferenceFormProps {
    typeReference: APIV1Read.TypeReference;
    onChange: (value: unknown) => void;
    value?: unknown;
    onFocus?: () => void;
    onBlur?: () => void;
    renderAsPanel?: boolean;
}

interface PlaygroundTypeShapeFormProps {
    typeShape: APIV1Read.TypeShape;
    onChange: (value: unknown) => void;
    value: unknown;
    onFocus?: () => void;
    onBlur?: () => void;
    renderAsPanel?: boolean;
    onChangeObject: (key: string, value: unknown | ((oldValue: unknown) => unknown)) => void;
}

export const PlaygroundTypeShapeForm: FC<PlaygroundTypeShapeFormProps> = ({
    typeShape,
    onChange,
    value,
    onBlur: handleBlur,
    onFocus: handleFocus,
    renderAsPanel = false,
    onChangeObject,
}) => {
    const { resolveTypeById } = useApiPlaygroundContext();
    const form = visitDiscriminatedUnion(typeShape, "type")._visit({
        object: (object) => (
            <ul
                className={
                    "divide-border-default-dark dark:divide-border-default-dark border-border-default-light dark:border-border-default-dark -mx-4 mb-4 list-none divide-y border-y"
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
            <PlaygroundTypeReferenceForm
                typeReference={aliasType}
                onChange={onChange}
                value={value}
                onBlur={handleBlur}
                onFocus={handleFocus}
                renderAsPanel={renderAsPanel}
            />
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

    const { value: isPanelOpen, setTrue: showPanel, setFalse: hidePanel } = useBooleanState(false);

    if (
        typeShape.type === "object" ||
        typeShape.type === "discriminatedUnion" ||
        typeShape.type === "undiscriminatedUnion"
    ) {
        if (renderAsPanel) {
            return (
                <>
                    <div
                        onClick={showPanel}
                        className="group flex h-full min-h-8 min-w-0 shrink cursor-pointer items-center"
                    >
                        <span className="inline-flex flex-1 shrink items-baseline gap-2 overflow-hidden">
                            <span className="group-hover:bg-tag-default-light dark:group-hover:bg-tag-default-dark -mx-0.5 min-w-0 shrink truncate whitespace-nowrap rounded px-0.5 font-mono text-xs">
                                {JSON.stringify(value)}
                            </span>
                            <span className="t-muted whitespace-nowrap text-xs">
                                <TypeShapeShorthand shape={typeShape} plural={false} />
                            </span>
                        </span>
                    </div>
                    <Transition
                        as="div"
                        show={isPanelOpen}
                        appear={true}
                        enter="ease-out transition-opacity transition-transform"
                        enterFrom="opacity-0 translate-x-full"
                        enterTo="opacity-100 translate-x-0"
                        leave="ease-in transition-opacity transition-transform"
                        leaveFrom="opacity-100 translate-x-0"
                        leaveTo="opacity-0 translate-x-full"
                        className="bg-background dark:bg-background-dark scroll-contain absolute inset-0 z-30 overflow-y-auto overflow-x-hidden"
                    >
                        <div className="bg-background dark:bg-background-dark border-border-default-light dark:border-border-default-dark sticky top-0 z-30 flex h-10 items-center border-b px-2">
                            <Button minimal icon={<ArrowLeft />} text="Back" onClick={hidePanel} />
                        </div>
                        <div className="p-4">{form}</div>
                    </Transition>
                </>
            );
        }
    }

    return form;
};

export const PlaygroundTypeReferenceForm: FC<PlaygroundTypeReferenceFormProps> = ({
    typeReference,
    onChange,
    value,
    onBlur: handleBlur,
    onFocus: handleFocus,
    renderAsPanel = false,
}) => {
    const { resolveTypeById } = useApiPlaygroundContext();

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

            return (
                <PlaygroundTypeShapeForm
                    typeShape={typeShape}
                    onChange={onChange}
                    value={value}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    renderAsPanel={renderAsPanel}
                    onChangeObject={onChangeObject}
                />
            );
        },
        primitive: (primitive) => (
            <div className="flex min-w-0 flex-1 justify-end">
                {visitDiscriminatedUnion(primitive.value, "type")._visit({
                    string: () => (
                        <InputGroup
                            fill={true}
                            value={typeof value === "string" ? value : ""}
                            onValueChange={onChange}
                            rightElement={<span className="t-muted mx-2 text-xs">{"string"}</span>}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />
                    ),
                    boolean: () => (
                        <Switch
                            large={true}
                            checked={typeof value === "boolean" ? value : undefined}
                            onChange={(e) => onChange(e.target.checked)}
                            className="-mb-1 -mr-2"
                        />
                    ),
                    integer: () => (
                        <NumericInput
                            fill={true}
                            minorStepSize={null}
                            value={typeof value === "number" ? value : undefined}
                            onValueChange={onChange}
                            rightElement={<span className="t-muted mx-2 text-xs">{"integer"}</span>}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />
                    ),
                    double: () => (
                        <NumericInput
                            fill={true}
                            value={typeof value === "number" ? value : undefined}
                            onValueChange={onChange}
                            rightElement={<span className="t-muted mx-2 text-xs">{"double"}</span>}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />
                    ),
                    long: () => (
                        <NumericInput
                            fill={true}
                            minorStepSize={null}
                            value={typeof value === "number" ? value : undefined}
                            onValueChange={onChange}
                            rightElement={<span className="t-muted mx-2 text-xs">{"long"}</span>}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />
                    ),
                    datetime: () => (
                        <DateInput3
                            fill={true}
                            placeholder="MM/DD/YYYY"
                            timePrecision="millisecond"
                            value={typeof value === "string" ? value : undefined}
                            onChange={onChange}
                            inputProps={{
                                onFocus: handleFocus,
                                onBlur: handleBlur,
                            }}
                        />
                    ),
                    uuid: () => (
                        <InputGroup
                            fill={true}
                            value={typeof value === "string" ? value : ""}
                            onValueChange={onChange}
                            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                            rightElement={<span className="t-muted mx-2 text-xs">{"uuid"}</span>}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />
                    ),
                    base64: () => (
                        <TextArea
                            fill={true}
                            value={typeof value === "string" ? value : ""}
                            onChange={(e) => onChange(e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />
                    ),
                    date: () => (
                        <DateInput3
                            fill={true}
                            placeholder="MM/DD/YYYY"
                            value={typeof value === "string" ? value : undefined}
                            onChange={onChange}
                            inputProps={{
                                onFocus: handleFocus,
                                onBlur: handleBlur,
                            }}
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
