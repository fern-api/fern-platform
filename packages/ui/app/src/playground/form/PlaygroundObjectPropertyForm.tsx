import {
    ObjectProperty,
    PropertyKey,
    TypeDefinition,
    TypeId,
    TypeReference,
    unwrapReference,
} from "@fern-api/fdr-sdk/api-definition";
import { FernButton, FernDropdown } from "@fern-ui/components";
import { useBooleanState } from "@fern-ui/react-commons";
import cn from "clsx";
import { PlusCircle } from "iconoir-react";
import dynamic from "next/dynamic";
import { FC, memo, useCallback, useEffect, useMemo, useState } from "react";
import { renderTypeShorthandRoot } from "../../type-shorthand";
import { WithLabel } from "../WithLabel";
import { castToRecord, getEmptyValueForType, isExpandable } from "../utils";
import { PlaygroundMapForm } from "./PlaygroundMapForm";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";

const Markdown = dynamic(() => import("../../mdx/Markdown").then(({ Markdown }) => Markdown));

const ADD_ALL_KEY = "__FERN_ADD_ALL__" as const;

const ADDITIONAL_PROPERTIES_KEY_SHAPE = {
    type: "primitive",
    value: {
        type: "string",
        regex: undefined,
        minLength: undefined,
        maxLength: undefined,
        default: undefined,
    },
} as const;

const ADDITIONAL_PROPERTIES_VALUE_SHAPE = {
    type: "primitive",
    value: {
        type: "string",
        regex: undefined,
        minLength: undefined,
        maxLength: undefined,
        default: undefined,
    },
} as const;

// TODO: This is hardcoded for now, but change to dynamic type references, by setting value
const ADDITIONAL_PROPERTIES_DEFAULT_SHAPE = {
    type: "alias",
    value: {
        type: "optional",
        shape: {
            type: "alias",
            value: {
                type: "map",
                keyShape: {
                    type: "alias",
                    value: ADDITIONAL_PROPERTIES_KEY_SHAPE,
                },
                valueShape: {
                    type: "alias",
                    value: ADDITIONAL_PROPERTIES_VALUE_SHAPE,
                },
            },
        },
        default: undefined,
    },
} as const;

interface PlaygroundObjectPropertyFormProps {
    id: string;
    property: ObjectProperty;
    onChange: (key: string, value: unknown) => void;
    value: unknown;
    expandByDefault?: boolean;
    types: Record<TypeId, TypeDefinition>;
    disabled?: boolean;
}

export const PlaygroundObjectPropertyForm: FC<PlaygroundObjectPropertyFormProps> = ({
    id,
    property,
    onChange,
    value,
    expandByDefault = true,
    types,
    disabled,
}) => {
    const handleChange = useCallback(
        (newValue: unknown) => {
            onChange(property.key, newValue);
        },
        [onChange, property.key],
    );

    const expandable = isExpandable(property.valueShape, value, types);
    const {
        // value: expanded,
        setTrue: setExpanded,
        // toggleValue: toggleExpanded,
    } = useBooleanState(!expandable || expandByDefault);

    useEffect(() => {
        if (!expandable) {
            setExpanded();
        }
    }, [expandable, setExpanded]);

    const [_isUnderStack, setIsUnderStack] = useState(false);
    const handleOpenStack = useCallback(() => setIsUnderStack(true), []);
    const handleCloseStack = useCallback(() => setIsUnderStack(false), []);

    return (
        <PlaygroundTypeReferenceForm
            id={id}
            property={property}
            shape={unwrapReference(property.valueShape, types).shape}
            onChange={handleChange}
            value={value}
            renderAsPanel={true}
            onOpenStack={handleOpenStack}
            onCloseStack={handleCloseStack}
            types={types}
            disabled={disabled}
        />
    );
};

interface PlaygroundObjectPropertiesFormProps {
    id: string;
    properties: readonly ObjectProperty[];
    extraProperties: TypeReference | undefined;
    onChange: (value: unknown) => void;
    value: unknown;
    indent?: boolean;
    types: Record<string, TypeDefinition>;
    disabled?: boolean;
}

export const PlaygroundObjectPropertiesForm = memo<PlaygroundObjectPropertiesFormProps>((props) => {
    const { id, properties, onChange, value, indent = false, types, disabled, extraProperties } = props;

    const onChangeObjectProperty = useCallback(
        (key: string, newValue: unknown) => {
            onChange((oldValue: unknown) => {
                const oldObject = castToRecord(oldValue);
                if (newValue === undefined) {
                    const { [key]: _, ...restOfFields } = oldObject;
                    return restOfFields;
                } else {
                    return {
                        ...oldObject,
                        [key]: typeof newValue === "function" ? newValue(oldObject[key]) : newValue,
                    };
                }
            });
        },
        [onChange],
    );

    const [additionalProperties, setAdditionalProperties] = useState<unknown>({});

    const onChangeAdditionalObjectProperty = useCallback(
        (newValue: unknown) => {
            if (JSON.stringify(castToRecord(additionalProperties)) !== JSON.stringify(castToRecord(newValue))) {
                onChange((oldValue: unknown) => {
                    const oldObject = castToRecord(oldValue);

                    if (newValue === undefined) {
                        return Object.fromEntries(
                            Object.entries(oldObject).filter(
                                ([k]) => !Object.keys(castToRecord(additionalProperties)).includes(k),
                            ),
                        );
                    } else {
                        setAdditionalProperties(newValue);

                        return {
                            ...Object.fromEntries(
                                Object.entries(oldObject).filter(
                                    ([k]) => !Object.keys(castToRecord(additionalProperties)).includes(k),
                                ),
                            ),
                            ...newValue,
                        };
                    }
                });
            }
        },
        [onChange, additionalProperties],
    );

    const shownProperties = useMemo(() => {
        return properties.filter((property) =>
            shouldShowProperty(property.valueShape, types, castToRecord(value)[property.key]),
        );
    }, [properties, types, value]);
    const hiddenProperties = useMemo(() => {
        return properties.filter(
            (property) => !shouldShowProperty(property.valueShape, types, castToRecord(value)[property.key]),
        );
    }, [properties, types, value]);

    const hiddenPropertiesOptions = useMemo(() => {
        const options = hiddenProperties.map(
            (property): FernDropdown.Option => ({
                type: "value",
                value: property.key,
                label: property.key,
                helperText: renderTypeShorthandRoot(property.valueShape, types),
                labelClassName: "font-mono",
                tooltip: property.description != null ? <Markdown size="xs" mdx={property.description} /> : undefined,
            }),
        );

        if (options.length > 1) {
            options.push(
                { type: "separator" },
                {
                    type: "value",
                    value: ADD_ALL_KEY,
                    label: "Add all optional properties",
                    rightElement: <PlusCircle className="size-icon" />,
                },
            );
        }
        return options;
    }, [hiddenProperties, types]);

    return (
        <div
            className={cn("flex-1 shrink min-w-0", {
                "border-border-default-soft border-l pl-4": indent,
            })}
        >
            {shownProperties.length > 0 && (
                <ul className="list-none space-y-8">
                    {shownProperties.map((property) => {
                        const childId = id.length > 0 ? `${id}.${property.key}` : property.key;
                        return (
                            <li key={property.key} className="relative -mx-4 px-4" tabIndex={-1}>
                                <PlaygroundObjectPropertyForm
                                    id={childId}
                                    property={property}
                                    onChange={onChangeObjectProperty}
                                    value={castToRecord(value)[property.key]}
                                    types={types}
                                    disabled={disabled}
                                />
                            </li>
                        );
                    })}
                </ul>
            )}

            {hiddenProperties.length > 0 && (
                <FernDropdown
                    options={hiddenPropertiesOptions}
                    onValueChange={(key) => {
                        if (key === ADD_ALL_KEY) {
                            onChange((oldValue: unknown) => {
                                const oldObject = castToRecord(oldValue);
                                return hiddenProperties.reduce((acc, property) => {
                                    const newValue = getEmptyValueForType(
                                        unwrapReference(property.valueShape, types).shape,
                                        types,
                                    );
                                    return { ...acc, [property.key]: newValue };
                                }, oldObject);
                            });
                            return;
                        }

                        const property = hiddenProperties.find((p) => p.key === key);
                        if (!property) {
                            return;
                        }
                        onChangeObjectProperty(
                            property.key,
                            getEmptyValueForType(unwrapReference(property.valueShape, types).shape, types) ?? "",
                        );
                    }}
                >
                    <FernButton
                        text={
                            <span>
                                {`${hiddenProperties.length} ${shownProperties.length > 0 ? "more " : ""}optional propert${hiddenProperties.length > 1 ? "ies" : "y"}`}
                                <span className="t-muted ml-2 font-mono text-xs opacity-50">
                                    {hiddenProperties.map((property) => property.key).join(", ")}
                                </span>
                            </span>
                        }
                        variant="outlined"
                        rightIcon={<PlusCircle />}
                        className="mt-8 w-full text-left first:mt-0"
                    />
                </FernDropdown>
            )}

            {extraProperties != null && (
                <div className={cn("flex-1 shrink min-w-0 mt-8")}>
                    <WithLabel
                        property={{
                            key: PropertyKey("Optional Extra Properties"),
                            valueShape: ADDITIONAL_PROPERTIES_DEFAULT_SHAPE,
                            description: undefined,
                            availability: undefined,
                        }}
                        value={"Optional Extra Properties"}
                        onRemove={() => onChangeAdditionalObjectProperty(undefined)}
                        types={types}
                    >
                        <PlaygroundMapForm
                            id="extraProperties"
                            keyShape={ADDITIONAL_PROPERTIES_KEY_SHAPE}
                            valueShape={ADDITIONAL_PROPERTIES_VALUE_SHAPE}
                            onChange={onChangeAdditionalObjectProperty}
                            value={Object.keys(castToRecord(value)).reduce((acc: Record<string, unknown>, key) => {
                                if (!properties.some((p) => p.key === key)) {
                                    acc[key] = castToRecord(value)[key];
                                }
                                return acc;
                            }, {})}
                            types={types}
                        />
                    </WithLabel>
                </div>
            )}
        </div>
    );
});

PlaygroundObjectPropertiesForm.displayName = "PlaygroundObjectPropertiesForm";

function shouldShowProperty(
    shape: ObjectProperty["valueShape"],
    types: Record<TypeId, TypeDefinition>,
    value: unknown,
): boolean {
    const unwrapped = unwrapReference(shape, types);
    return !unwrapped.isOptional || value !== undefined;
}
