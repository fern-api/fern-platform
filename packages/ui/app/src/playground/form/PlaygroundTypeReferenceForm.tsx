import {
    ObjectProperty,
    TypeDefinition,
    TypeShapeOrReference,
    unwrapReference,
} from "@fern-api/fdr-sdk/api-definition";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { FernButton, FernInput, FernNumericInput, FernSwitch, FernTextarea } from "@fern-ui/components";
import { Undo } from "iconoir-react";
import { ReactElement, memo, useCallback } from "react";
import { useFeatureFlags } from "../../atoms";
import { WithLabel } from "../WithLabel";
import { PlaygroundDiscriminatedUnionForm } from "./PlaygroundDescriminatedUnionForm";
import { PlaygroundElevenLabsVoiceIdForm } from "./PlaygroundElevenLabsVoiceIdForm";
import { PlaygroundEnumForm } from "./PlaygroundEnumForm";
import { PlaygroundListForm } from "./PlaygroundListForm";
import { PlaygroundMapForm } from "./PlaygroundMapForm";
import { PlaygroundObjectForm } from "./PlaygroundObjectForm";
import { PlaygroundUniscriminatedUnionForm } from "./PlaygroundUniscriminatedUnionForm";

interface PlaygroundTypeReferenceFormProps {
    id: string;
    property?: ObjectProperty;
    shape: TypeShapeOrReference;
    onChange: (value: unknown) => void;
    value?: unknown;
    // onFocus?: () => void;
    // onBlur?: () => void;
    onOpenStack?: () => void;
    onCloseStack?: () => void;
    renderAsPanel?: boolean;
    types: Record<string, TypeDefinition>;
    disabled?: boolean;
    defaultValue?: unknown;
    indent?: boolean;
}

export const PlaygroundTypeReferenceForm = memo<PlaygroundTypeReferenceFormProps>((props) => {
    const { hasVoiceIdPlaygroundForm } = useFeatureFlags();
    const { id, property, shape, onChange, value, types, disabled, indent = true, defaultValue } = props;
    const onRemove = useCallback(() => {
        onChange(undefined);
    }, [onChange]);
    return visitDiscriminatedUnion(unwrapReference(shape, types).shape)._visit<ReactElement | null>({
        object: (object) => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types}>
                <PlaygroundObjectForm
                    shape={object}
                    onChange={onChange}
                    value={value}
                    indent={indent}
                    id={id}
                    types={types}
                    disabled={disabled}
                    defaultValue={defaultValue}
                />
            </WithLabel>
        ),
        enum: ({ values }) => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types}>
                <PlaygroundEnumForm enumValues={values} onChange={onChange} value={value} id={id} disabled={disabled} />
            </WithLabel>
        ),
        undiscriminatedUnion: (undiscriminatedUnion) => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types}>
                <PlaygroundUniscriminatedUnionForm
                    undiscriminatedUnion={undiscriminatedUnion}
                    onChange={onChange}
                    value={value}
                    id={id}
                    types={types}
                    disabled={disabled}
                    // TODO: add default value
                />
            </WithLabel>
        ),
        discriminatedUnion: (discriminatedUnion) => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types}>
                <PlaygroundDiscriminatedUnionForm
                    discriminatedUnion={discriminatedUnion}
                    onChange={onChange}
                    value={value}
                    id={id}
                    types={types}
                    disabled={disabled}
                    // TODO: add default value
                />
            </WithLabel>
        ),
        primitive: (primitive) =>
            visitDiscriminatedUnion(primitive.value, "type")._visit<ReactElement | null>({
                string: (string) => (
                    <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                        {hasVoiceIdPlaygroundForm && property?.key === "voice_id" ? (
                            // TODO: delete this:
                            <PlaygroundElevenLabsVoiceIdForm
                                id={id}
                                className="w-full"
                                value={typeof value === "string" ? value : ""}
                                onValueChange={onChange}
                                disabled={disabled}
                            />
                        ) : (
                            <FernInput
                                id={id}
                                className="w-full"
                                value={typeof value === "string" ? value : ""}
                                onValueChange={onChange}
                                disabled={disabled}
                                placeholder={string.default}
                                defaultValue={typeof defaultValue === "string" ? defaultValue : string.default}
                                maxLength={string.maxLength}
                                minLength={string.minLength}
                                // TODO: add validation UX feedback
                                pattern={string.regex}
                                // TODO: clean up this mess
                                rightElement={withDefaultValue(
                                    value,
                                    typeof defaultValue === "string" ? defaultValue : string.default,
                                    onChange,
                                )}
                            />
                        )}
                    </WithLabel>
                ),
                boolean: () => {
                    const checked = typeof value === "boolean" ? value : undefined;
                    return (
                        <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                            <div className="flex items-center justify-start gap-3">
                                {/* <label className="t-muted font-mono text-sm leading-none">
                                    {checked == null ? "undefined" : checked ? "true" : "false"}
                                </label> */}
                                <FernSwitch checked={checked} onCheckedChange={onChange} id={id} disabled={disabled} />
                            </div>
                        </WithLabel>
                    );
                },
                integer: (integer) => (
                    <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                        <FernNumericInput
                            id={id}
                            className="w-full"
                            value={typeof value === "number" ? value : undefined}
                            onValueChange={onChange}
                            disallowFloat={true}
                            disabled={disabled}
                            defaultValue={typeof defaultValue === "number" ? defaultValue : integer.default}
                            max={integer.maximum}
                            min={integer.minimum}
                            rightElement={withDefaultValue(
                                value,
                                typeof defaultValue === "number" ? defaultValue : integer.default,
                                onChange,
                            )}
                        />
                    </WithLabel>
                ),
                double: (double) => (
                    <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                        <FernNumericInput
                            id={id}
                            className="w-full"
                            value={typeof value === "number" ? value : undefined}
                            onValueChange={onChange}
                            disabled={disabled}
                            defaultValue={typeof defaultValue === "number" ? defaultValue : double.default}
                            max={double.maximum}
                            min={double.minimum}
                            rightElement={withDefaultValue(
                                value,
                                typeof defaultValue === "number" ? defaultValue : double.default,
                                onChange,
                            )}
                        />
                    </WithLabel>
                ),
                long: (long) => (
                    <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                        <FernNumericInput
                            id={id}
                            className="w-full"
                            value={typeof value === "number" ? value : undefined}
                            onValueChange={onChange}
                            disallowFloat={true}
                            disabled={disabled}
                            defaultValue={long.default}
                            max={long.maximum}
                            min={long.minimum}
                            rightElement={withDefaultValue(
                                value,
                                typeof defaultValue === "number" ? defaultValue : long.default,
                                onChange,
                            )}
                        />
                    </WithLabel>
                ),
                uint: () => (
                    <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                        <FernNumericInput
                            id={id}
                            className="w-full"
                            value={typeof value === "number" ? value : undefined}
                            onValueChange={onChange}
                            disallowFloat={true}
                            disabled={disabled}
                            rightElement={withDefaultValue(
                                value,
                                typeof defaultValue === "number" ? defaultValue : undefined,
                                onChange,
                            )}
                        />
                    </WithLabel>
                ),
                uint64: () => (
                    <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                        <FernNumericInput
                            id={id}
                            className="w-full"
                            value={typeof value === "number" ? value : undefined}
                            onValueChange={onChange}
                            disallowFloat={true}
                            disabled={disabled}
                            rightElement={withDefaultValue(
                                value,
                                typeof defaultValue === "number" ? defaultValue : undefined,
                                onChange,
                            )}
                        />
                    </WithLabel>
                ),
                datetime: () => (
                    <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                        <FernInput
                            id={id}
                            type="datetime-local"
                            className="w-full"
                            placeholder="MM/DD/YYYY HH:MM"
                            value={typeof value === "string" ? value : undefined}
                            onValueChange={onChange}
                            disabled={disabled}
                            rightElement={withDefaultValue(
                                value,
                                typeof defaultValue === "string" ? defaultValue : undefined,
                                onChange,
                            )}
                        />
                    </WithLabel>
                ),
                uuid: () => (
                    <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                        <FernInput
                            id={id}
                            className="w-full"
                            value={typeof value === "string" ? value : ""}
                            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                            onValueChange={onChange}
                            disabled={disabled}
                            rightElement={withDefaultValue(
                                value,
                                typeof defaultValue === "string" ? defaultValue : undefined,
                                onChange,
                            )}
                        />
                    </WithLabel>
                ),
                base64: () => (
                    <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                        <FernTextarea
                            id={id}
                            className="w-full"
                            value={typeof value === "string" ? value : ""}
                            onValueChange={onChange}
                            disabled={disabled}
                            // TODO: render reset button
                        />
                    </WithLabel>
                ),
                date: () => (
                    <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                        <FernInput
                            id={id}
                            type="date"
                            className="w-full"
                            placeholder="MM/DD/YYYY"
                            value={typeof value === "string" ? value : undefined}
                            onValueChange={onChange}
                            disabled={disabled}
                            rightElement={withDefaultValue(
                                value,
                                typeof defaultValue === "string" ? defaultValue : undefined,
                                onChange,
                            )}
                        />
                    </WithLabel>
                ),
                bigInteger: () => (
                    <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                        <FernTextarea
                            id={id}
                            className="w-full"
                            value={typeof value === "string" ? value : ""}
                            onValueChange={onChange}
                            disabled={disabled}
                            // TODO: render reset button
                        />
                    </WithLabel>
                ),
                _other: () => null,
            }),
        list: (list) => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                <PlaygroundListForm
                    itemShape={list.itemShape}
                    onChange={onChange}
                    value={value}
                    id={id}
                    types={types}
                    // TODO: add default value
                />
            </WithLabel>
        ),
        set: (set) => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                {/* TODO: add default value */}
                <PlaygroundListForm itemShape={set.itemShape} onChange={onChange} value={value} id={id} types={types} />
            </WithLabel>
        ),
        map: (map) => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                <PlaygroundMapForm
                    id={id}
                    keyShape={map.keyShape}
                    valueShape={map.valueShape}
                    onChange={onChange}
                    value={value}
                    types={types}
                    // TODO: add default value
                />
            </WithLabel>
        ),
        literal: (literal) =>
            visitDiscriminatedUnion(literal.value, "type")._visit({
                stringLiteral: (stringLiteral) => (
                    <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                        <code>{stringLiteral.value}</code>
                    </WithLabel>
                ),
                booleanLiteral: (stringLiteral) => (
                    <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                        <code>{stringLiteral.value ? "true" : "false"}</code>
                    </WithLabel>
                ),
                _other: () => null,
            }),
        unknown: () => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                <FernTextarea
                    id={id}
                    className="w-full"
                    value={typeof value === "string" ? value : ""}
                    onValueChange={onChange}
                    disabled={disabled}
                    // TODO: add default value
                />
            </WithLabel>
        ),
        _other: () => null,
    });
});

PlaygroundTypeReferenceForm.displayName = "PlaygroundTypeReferenceForm";

function withDefaultValue<T>(value: T, defaultValue: T | undefined, onChange: (value: T | undefined) => void) {
    if (defaultValue == null || value === defaultValue) {
        return undefined;
    }

    return (
        <FernButton variant="minimal" size="small" onClick={() => onChange(defaultValue)}>
            <Undo className="size-4" />
        </FernButton>
    );
}
