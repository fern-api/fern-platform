import {
    Button,
    InputGroup,
    MenuItem,
    NumericInput,
    SegmentedControl,
    Switch,
    TextArea,
    Tooltip,
} from "@blueprintjs/core";
import { DateInput3 } from "@blueprintjs/datetime2";
import { CaretDown, ChevronDown, ChevronUp, Cross, Key, Plus } from "@blueprintjs/icons";
import { Select } from "@blueprintjs/select";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { getSubpackageTitle, isSubpackage } from "@fern-ui/app-utils";
import { isPlainObject, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Transition } from "@headlessui/react";
import classNames from "classnames";
import { CurlGenerator } from "curl-generator";
import { isUndefined, omitBy, startCase } from "lodash-es";
import {
    ChangeEventHandler,
    Dispatch,
    FC,
    Fragment,
    ReactElement,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { resolveSubpackage } from "../api-context/ApiDefinitionContextProvider";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { EndpointAvailabilityTag } from "../api-page/endpoints/EndpointAvailabilityTag";
import { TypeShorthand } from "../api-page/types/type-shorthand/TypeShorthand";
import { getAllObjectProperties } from "../api-page/utils/getAllObjectProperties";
import { HttpMethodTag } from "../commons/HttpMethodTag";
import { ChevronDownIcon } from "../commons/icons/ChevronDownIcon";
import { InfoIcon } from "../commons/icons/InfoIcon";
import { FernModal } from "../components/FernModal";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useNavigationContext } from "../navigation-context";
import { useDocsSelectors } from "../selectors/useDocsSelectors";
import styles from "./ApiPlaygroundModal.module.scss";

interface ApiPlaygroundModalProps {
    endpoint: APIV1Read.EndpointDefinition;
    package: APIV1Read.ApiDefinitionPackage;
}

const ApiPlaygroundEndpointSelector: FC<ApiPlaygroundModalProps> = ({ endpoint, package: package_ }) => {
    const showDropdown = useBooleanState(false);
    const { resolveApi } = useDocsContext();
    const { activeNavigationConfigContext } = useDocsSelectors();
    const { activeNavigatable } = useNavigationContext();

    const navigationItems =
        activeNavigationConfigContext.type === "tabbed"
            ? activeNavigatable.context.tab?.items
            : activeNavigationConfigContext.config.items;

    const endpoints = useMemo(() => {
        if (navigationItems == null) {
            return [];
        }

        return navigationItems.flatMap((item) => {
            if (item.type !== "api") {
                return [];
            }

            const apiDefinition = resolveApi(item.api);

            if (apiDefinition == null) {
                return [];
            }

            const flattenSubpackages = (subpackageId: APIV1Read.SubpackageId): APIV1Read.EndpointDefinition[] => {
                const subpackage = resolveSubpackage(apiDefinition, subpackageId);

                if (subpackage == null) {
                    return [];
                }

                return subpackage.endpoints.concat(subpackage.subpackages.flatMap(flattenSubpackages));
            };

            return apiDefinition.rootPackage.endpoints.concat(
                apiDefinition.rootPackage.subpackages.flatMap(flattenSubpackages)
            );
        });
    }, [navigationItems, resolveApi]);

    return (
        <div className="relative -m-2">
            <button
                className={classNames(
                    "flex cursor-pointer items-center gap-4 rounded p-2 text-left hover:bg-black/10 hover:dark:bg-white/10",
                    {
                        "bg-black/10 dark:bg-white/10": showDropdown.value,
                    }
                )}
                onClick={showDropdown.toggleValue}
            >
                <div className="flex flex-col justify-center">
                    {isSubpackage(package_) && (
                        <div className="text-accent-primary dark:text-accent-primary-dark text-xs">
                            {getSubpackageTitle(package_)}
                        </div>
                    )}
                    <div className="text-lg">{endpoint.name}</div>
                </div>
                <ChevronDownIcon
                    className={classNames("h-5 w-5 transition", {
                        "rotate-180": false,
                    })}
                />
            </button>
            <Transition show={showDropdown.value}>
                <ul className="bg-background dark:bg-background-dark border-border-default-light dark:border-border-default-dark absolute left-0 top-full z-10 mt-2 min-h-4 min-w-full list-none rounded border shadow-xl">
                    {endpoints.map((endpoint, idx) => {
                        return <li key={idx}>{endpoint.name}</li>;
                    })}
                </ul>
            </Transition>
        </div>
    );
};

interface ApiPlaygroundDiscriminatedUnionProps {
    discriminatedUnion: APIV1Read.TypeShape.DiscriminatedUnion;
    onChange: (value: unknown) => void;
    value: unknown;
}

const ApiPlaygroundDiscriminatedUnion: FC<ApiPlaygroundDiscriminatedUnionProps> = ({
    discriminatedUnion,
    onChange,
    value,
}) => {
    const { resolveTypeById } = useApiDefinitionContext();

    const selectedVariant =
        value != null ? (castToRecord(value)[discriminatedUnion.discriminant] as string) : undefined;

    const setSelectedVariant = useCallback(
        (variantKey: string) => {
            onChange((oldValue: unknown) => {
                const currentVariantKey = castToRecord(oldValue)[discriminatedUnion.discriminant] as string | undefined;
                if (currentVariantKey === variantKey) {
                    return oldValue;
                }
                const selectedVariant = discriminatedUnion.variants.find(
                    (variant) => variant.discriminantValue === variantKey
                );
                if (selectedVariant == null) {
                    // eslint-disable-next-line no-console
                    console.error(`Could not find variant with discriminant value ${variantKey}`);
                    return oldValue;
                }
                return {
                    [discriminatedUnion.discriminant]: variantKey,
                    ...getDefaultValueForObject(selectedVariant.additionalProperties, resolveTypeById),
                };
            });
        },
        [discriminatedUnion.discriminant, discriminatedUnion.variants, onChange, resolveTypeById]
    );

    useEffect(() => {
        if (selectedVariant == null && discriminatedUnion.variants.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const firstVariant = discriminatedUnion.variants[0]!;
            setSelectedVariant(firstVariant.discriminantValue);
        }
    }, [discriminatedUnion.variants, selectedVariant, setSelectedVariant]);

    const handleChangeProperty = useCallback(
        (key: string, newValue: unknown) => {
            onChange((oldValue: unknown) => {
                const oldObject = castToRecord(oldValue);
                return {
                    ...oldObject,
                    [key]: newValue,
                };
            });
        },
        [onChange]
    );

    const variantObject = discriminatedUnion.variants.find(
        (variant) => variant.discriminantValue === selectedVariant
    )?.additionalProperties;

    return (
        <div className="w-full">
            <SegmentedControl
                options={discriminatedUnion.variants.map((variant) => ({
                    label: startCase(variant.discriminantValue),
                    value: variant.discriminantValue,
                }))}
                value={selectedVariant}
                onValueChange={setSelectedVariant}
                small={true}
            />
            {variantObject != null && (
                <ul className="border-border-default-light dark:border-border-default-dark mt-2 w-full list-none space-y-4 border-l pl-4">
                    {getAllObjectProperties(variantObject, resolveTypeById).map((property) => (
                        <ApiPlaygroundObjectProperty
                            key={property.key}
                            property={property}
                            onChange={handleChangeProperty}
                            value={castToRecord(value)[property.key]}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
};
interface ApiPlaygroundUniscriminatedUnionProps {
    undiscriminatedUnion: APIV1Read.TypeShape.UndiscriminatedUnion;
    onChange: (value: unknown) => void;
    value: unknown;
}

const ApiPlaygroundUniscriminatedUnion: FC<ApiPlaygroundUniscriminatedUnionProps> = ({
    undiscriminatedUnion,
    onChange,
    value,
}) => {
    const { resolveTypeById } = useApiDefinitionContext();

    const [internalSelectedVariant, setInternalSelectedVariant] = useState<number>(() => {
        return Math.max(
            undiscriminatedUnion.variants.findIndex((variant) =>
                matchesTypeReference(variant.type, resolveTypeById, value)
            ),
            0
        );
    });

    const selectedVariant = undiscriminatedUnion.variants[internalSelectedVariant];

    const setSelectedVariant = useCallback(
        (variantIdxAsString: string) => {
            const variantIdx = parseInt(variantIdxAsString, 10);
            const variant = undiscriminatedUnion.variants[variantIdx];
            if (variantIdx !== internalSelectedVariant && variant != null) {
                setInternalSelectedVariant(variantIdx);
                onChange(getDefaultValueForType(variant.type, resolveTypeById));
            }
        },
        [internalSelectedVariant, onChange, resolveTypeById, undiscriminatedUnion.variants]
    );

    // const variantTypeReference = undiscriminatedUnion.variants[selectedVariant]?.type;
    return (
        <div className="w-full">
            <SegmentedControl
                options={undiscriminatedUnion.variants.map((variant, idx) => ({
                    label: variant.displayName,
                    value: idx.toString(),
                }))}
                value={internalSelectedVariant.toString()}
                onValueChange={setSelectedVariant}
                small={true}
            />
            {selectedVariant != null && (
                <ApiPlaygroundTypeReference typeReference={selectedVariant.type} onChange={onChange} value={value} />
            )}
        </div>
    );
};

interface ApiPlaygroundEnumSelectorProps {
    enumValues: APIV1Read.EnumValue[];
    onChange: (value: unknown) => void;
    value: unknown;
}

const ApiPlaygroundEnumSelector: FC<ApiPlaygroundEnumSelectorProps> = ({ enumValues, onChange, value }) => {
    const setSelectedValue = useCallback(
        (enumValue: APIV1Read.EnumValue) => {
            onChange(enumValue.value);
        },
        [onChange]
    );

    if (enumValues.length === 0) {
        return null;
    }

    if (enumValues.length < 5) {
        return (
            <div className="w-full">
                <SegmentedControl
                    options={enumValues.map((enumValue) => ({
                        label: enumValue.value,
                        value: enumValue.value,
                    }))}
                    value={typeof value === "string" ? value : undefined}
                    onValueChange={onChange}
                    small={true}
                />
            </div>
        );
    }

    const activeItem = enumValues.find((enumValue) => enumValue.value === value);

    return (
        <Select<APIV1Read.EnumValue>
            items={enumValues}
            itemRenderer={({ value, description }, { handleClick, handleFocus, modifiers }) =>
                modifiers.matchesPredicate && (
                    <MenuItem
                        active={modifiers.active}
                        disabled={modifiers.disabled}
                        key={value}
                        text={<span className="font-mono text-sm">{value}</span>}
                        onClick={handleClick}
                        onFocus={handleFocus}
                        roleStructure="listoption"
                        labelElement={
                            <Tooltip content={description} compact={true} popoverClassName="max-w-xs text-xs">
                                <InfoIcon />
                            </Tooltip>
                        }
                    />
                )
            }
            itemPredicate={(query, { value }) => value.toLowerCase().includes(query.toLowerCase())}
            onItemSelect={setSelectedValue}
            activeItem={activeItem}
            popoverProps={{ minimal: true, matchTargetWidth: true }}
            fill={true}
        >
            <Button
                text={
                    activeItem != null ? (
                        <span className="font-mono">{activeItem.value}</span>
                    ) : (
                        <span className="t-muted">Select an enum...</span>
                    )
                }
                alignText="left"
                rightIcon={<CaretDown />}
                fill={true}
            />
        </Select>
    );
};

interface ApiPlaygroundListProps {
    itemType: APIV1Read.TypeReference;
    onChange: (value: unknown) => void;
    value: unknown;
}

const ApiPlaygroundList: FC<ApiPlaygroundListProps> = ({ itemType, onChange, value }) => {
    const { resolveTypeById } = useApiDefinitionContext();
    useEffect(() => {
        if (!Array.isArray(value)) {
            onChange([]);
        }
    }, [onChange, value]);
    const appendItem = useCallback(() => {
        onChange((oldValue: unknown) => {
            const oldArray = Array.isArray(oldValue) ? oldValue : [];
            return [...oldArray, getDefaultValueForType(itemType, resolveTypeById)];
        });
    }, [itemType, onChange, resolveTypeById]);
    const valueAsList = Array.isArray(value) ? value : [];
    const handleChangeItem = useCallback(
        (idx: number, newValue: unknown) => {
            onChange((oldValue: unknown) => {
                const oldArray = Array.isArray(oldValue) ? oldValue : [];
                return [...oldArray.slice(0, idx), newValue, ...oldArray.slice(idx + 1)];
            });
        },
        [onChange]
    );
    const handleRemoveItem = useCallback(
        (idx: number) => {
            onChange((oldValue: unknown) => {
                const oldArray = Array.isArray(oldValue) ? oldValue : [];
                return [...oldArray.slice(0, idx), ...oldArray.slice(idx + 1)];
            });
        },
        [onChange]
    );
    return (
        <div className="w-full">
            {valueAsList.length > 0 && (
                <ul className="border-border-default-light dark:border-border-default-dark w-full list-none space-y-4 border-l pl-4">
                    {valueAsList.map((item, idx) => (
                        <li key={idx}>
                            <div className="flex items-center justify-between gap-2">
                                <label className="inline-flex flex-wrap items-baseline">
                                    <span className="t-muted text-xs uppercase">{`Item ${idx + 1}`}</span>
                                </label>

                                <div className="flex flex-1 items-center gap-2">
                                    <div className="bg-border-default-light dark:bg-border-default-dark h-px w-full" />
                                    <Button
                                        icon={<Cross />}
                                        onClick={() => handleRemoveItem(idx)}
                                        minimal={true}
                                        small={true}
                                        className="-mx-1"
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <ApiPlaygroundTypeReference
                                    typeReference={itemType}
                                    value={item}
                                    onChange={(newItem) =>
                                        handleChangeItem(idx, typeof newItem === "function" ? newItem(item) : newItem)
                                    }
                                />
                            </div>
                        </li>
                    ))}
                    <li>
                        <Button icon={<Plus />} text="Add new item" onClick={appendItem} outlined={true} fill={true} />
                    </li>
                </ul>
            )}
            {valueAsList.length === 0 && (
                <Button icon={<Plus />} text="Add new item" onClick={appendItem} outlined={true} fill={true} />
            )}
        </div>
    );
};

interface ApiPlaygroundMapProps {
    keyType: APIV1Read.TypeReference;
    valueType: APIV1Read.TypeReference;
    onChange: (value: unknown) => void;
    value: unknown;
}

const ApiPlaygroundMap: FC<ApiPlaygroundMapProps> = ({ keyType, valueType, onChange, value }) => {
    const { resolveTypeById } = useApiDefinitionContext();

    useEffect(() => {
        if (!isPlainObject(value)) {
            onChange({});
        }
    }, [onChange, value]);

    const [internalState, setInternalState] = useState<Array<{ key: unknown; value: unknown }>>(() => {
        if (isPlainObject(value)) {
            return Object.entries(value).map(([key, value]) => ({ key, value }));
        }
        return [];
    });

    useEffect(() => {
        onChange(
            internalState.reduce<Record<string, unknown>>((acc, item) => {
                const key = unknownToString(item.key);
                if (key != null) {
                    acc[key] = item.value;
                }
                return acc;
            }, {})
        );
    }, [internalState, onChange]);

    const handleAppendItem = useCallback(() => {
        setInternalState((oldState) => [
            ...oldState,
            {
                key: getDefaultValueForType(keyType, resolveTypeById),
                value: getDefaultValueForType(valueType, resolveTypeById),
            },
        ]);
    }, [keyType, resolveTypeById, valueType]);

    const handleChangeKey = useCallback((idx: number, newKey: unknown) => {
        setInternalState((oldState) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return [...oldState.slice(0, idx), { ...oldState[idx]!, key: newKey }, ...oldState.slice(idx + 1)];
        });
    }, []);

    const handleChangeValue = useCallback((idx: number, newValue: unknown) => {
        setInternalState((oldState) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return [...oldState.slice(0, idx), { ...oldState[idx]!, value: newValue }, ...oldState.slice(idx + 1)];
        });
    }, []);
    const handleRemoveItem = useCallback(
        (idx: number) => {
            onChange((oldValue: unknown) => {
                const oldArray = Array.isArray(oldValue) ? oldValue : [];
                return [...oldArray.slice(0, idx), ...oldArray.slice(idx + 1)];
            });
        },
        [onChange]
    );
    return (
        <div>
            {internalState.length > 0 && (
                <ul className="border-border-default-light dark:border-border-default-dark w-full list-none space-y-4 border-l pl-4">
                    {internalState.map((item, idx) => (
                        <li key={idx} className="flex gap-4">
                            <ApiPlaygroundTypeReference
                                typeReference={keyType}
                                value={item.key}
                                onChange={(newKey) => handleChangeKey(idx, newKey)}
                            />
                            <ApiPlaygroundTypeReference
                                typeReference={valueType}
                                value={item.value}
                                onChange={(newValue) => handleChangeValue(idx, newValue)}
                            />
                            <div>
                                <Button icon={<Cross />} onClick={() => handleRemoveItem(idx)} minimal={true} />
                            </div>
                        </li>
                    ))}
                    <li>
                        <Button
                            icon={<Plus />}
                            text="Add new item"
                            onClick={handleAppendItem}
                            outlined={true}
                            fill={true}
                        />
                    </li>
                </ul>
            )}
            {internalState.length === 0 && (
                <Button icon={<Plus />} text="Add new item" onClick={handleAppendItem} outlined={true} fill={true} />
            )}
        </div>
    );
};

interface ApiPlaygroundTypeReferenceProps {
    typeReference: APIV1Read.TypeReference;
    doNotNest?: boolean;
    onChange: (value: unknown) => void;
    value?: unknown;
}
const ApiPlaygroundTypeReference: FC<ApiPlaygroundTypeReferenceProps> = ({
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
                            <ApiPlaygroundObjectProperty
                                key={property.key}
                                property={property}
                                onChange={onChangeObject}
                                value={castToRecord(value)[property.key]}
                            />
                        ))}
                    </ul>
                ),
                alias: ({ value: aliasType }) => (
                    <ApiPlaygroundTypeReference typeReference={aliasType} onChange={onChange} value={value} />
                ),
                enum: ({ values }) => (
                    <ApiPlaygroundEnumSelector enumValues={values} onChange={onChange} value={value} />
                ),
                undiscriminatedUnion: (undiscriminatedUnion) => (
                    <ApiPlaygroundUniscriminatedUnion
                        undiscriminatedUnion={undiscriminatedUnion}
                        onChange={onChange}
                        value={value}
                    />
                ),
                discriminatedUnion: (discriminatedUnion) => (
                    <ApiPlaygroundDiscriminatedUnion
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
        optional: ({ itemType }) => (
            <ApiPlaygroundTypeReferenceOptional typeReference={itemType} onChange={onChange} value={value} />
        ),
        list: (list) => <ApiPlaygroundList itemType={list.itemType} onChange={onChange} value={value} />,
        set: (set) => <ApiPlaygroundList itemType={set.itemType} onChange={onChange} value={value} />,
        map: (map) => (
            <ApiPlaygroundMap keyType={map.keyType} valueType={map.valueType} onChange={onChange} value={value} />
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

const ApiPlaygroundTypeReferenceOptional: FC<ApiPlaygroundTypeReferenceProps> = ({
    typeReference,
    doNotNest,
    onChange,
    value,
}) => {
    const { resolveTypeById } = useApiDefinitionContext();
    return (
        <div className="flex gap-y-2">
            {value != null ? (
                <ApiPlaygroundTypeReference
                    typeReference={typeReference}
                    onChange={onChange}
                    value={value}
                    doNotNest={doNotNest}
                />
            ) : (
                <Button
                    icon={<Plus />}
                    text="Insert optional element"
                    onClick={() => onChange(getDefaultValueForType(typeReference, resolveTypeById))}
                    outlined={true}
                    fill={true}
                />
            )}
            {value != null && (
                <div>
                    <Button icon={<Cross />} onClick={() => onChange(undefined)} minimal={true} />
                </div>
            )}
        </div>
    );
};

interface ApiPlaygroundObjectPropertyProps {
    property: APIV1Read.ObjectProperty;
    onChange: (key: string, value: unknown) => void;
    value: unknown;
}

const ApiPlaygroundObjectProperty: FC<ApiPlaygroundObjectPropertyProps> = ({ property, onChange, value }) => {
    const { resolveTypeById } = useApiDefinitionContext();

    const handleChange = useCallback(
        (newValue: unknown) => {
            onChange(property.key, newValue);
        },
        [onChange, property.key]
    );

    const handleChangeOptional = useCallback<ChangeEventHandler<HTMLInputElement>>(
        (e) => {
            if (property.valueType.type === "optional") {
                onChange(
                    property.key,
                    e.target.checked ? getDefaultValueForType(property.valueType.itemType, resolveTypeById) : undefined
                );
            }
        },
        [onChange, property.key, property.valueType, resolveTypeById]
    );

    const expandable = isExpandable(property.valueType, resolveTypeById, value);
    const expanded = useBooleanState(!expandable);

    useEffect(
        () => {
            if (!expandable) {
                expanded.setTrue();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [expandable, expanded.setTrue]
    );

    return (
        <li className="flex flex-col gap-1">
            <div className="shrink-1 flex min-w-0 flex-1 items-center justify-between gap-2">
                <Tooltip
                    content={property.description}
                    popoverClassName="max-w-xs text-xs"
                    compact={true}
                    disabled={property.description == null || property.description.length === 0}
                    placement="top-start"
                    minimal={true}
                >
                    <label className="inline-flex w-full flex-wrap items-baseline gap-2">
                        <span className="font-mono text-sm">{property.key}</span>

                        <span className="t-muted text-xs">
                            <TypeShorthand type={property.valueType} plural={false} />
                        </span>

                        {property.availability != null && (
                            <EndpointAvailabilityTag availability={property.availability} minimal={true} />
                        )}
                    </label>
                </Tooltip>

                {expandable && (
                    <div className="flex flex-1 items-center gap-2">
                        <div className="bg-border-default-light dark:bg-border-default-dark h-px w-full" />
                        <Button
                            icon={expanded.value ? <ChevronDown /> : <ChevronUp />}
                            minimal={true}
                            small={true}
                            className="-mx-1"
                            onClick={expanded.toggleValue}
                        />
                    </div>
                )}

                {property.valueType.type === "optional" && (
                    <Switch checked={value != null} onChange={handleChangeOptional} className="-mr-2 mb-0" />
                )}
            </div>
            {value != null && (!expandable || expanded.value) && (
                <ApiPlaygroundTypeReference
                    typeReference={
                        property.valueType.type === "optional" ? property.valueType.itemType : property.valueType
                    }
                    onChange={handleChange}
                    value={value}
                />
            )}
        </li>
    );
};

interface ApiPlaygroundState {
    headers: Record<string, unknown>;
    pathParameters: Record<string, unknown>;
    queryParameters: Record<string, unknown>;
    body: unknown;
}

interface ApiPlaygroundEndpointContentProps extends ApiPlaygroundModalProps {
    playgroundState: ApiPlaygroundState;
    setPlaygroundState: Dispatch<SetStateAction<ApiPlaygroundState>>;
}

const ApiPlaygroundEndpointContent: FC<ApiPlaygroundEndpointContentProps> = ({
    endpoint,
    playgroundState,
    setPlaygroundState,
}) => {
    const { resolveTypeById } = useApiDefinitionContext();
    const setHeader = useCallback(
        (key: string, value: unknown) => {
            setPlaygroundState((state) => ({
                ...state,
                headers: {
                    ...state.headers,
                    [key]: typeof value === "function" ? value(state.headers[key]) : value,
                },
            }));
        },
        [setPlaygroundState]
    );

    const setPathParameter = useCallback(
        (key: string, value: unknown) => {
            setPlaygroundState((state) => ({
                ...state,
                pathParameters: {
                    ...state.pathParameters,
                    [key]: typeof value === "function" ? value(state.pathParameters[key]) : value,
                },
            }));
        },
        [setPlaygroundState]
    );

    const setQueryParameter = useCallback(
        (key: string, value: unknown) => {
            setPlaygroundState((state) => ({
                ...state,
                queryParameters: {
                    ...state.queryParameters,
                    [key]: typeof value === "function" ? value(state.queryParameters[key]) : value,
                },
            }));
        },
        [setPlaygroundState]
    );

    const setBody = useCallback(
        (value: ((old: unknown) => unknown) | unknown) => {
            setPlaygroundState((state) => ({
                ...state,
                body: typeof value === "function" ? value(state.body) : value,
            }));
        },
        [setPlaygroundState]
    );

    const setBodyByKey = useCallback(
        (key: string, value: unknown) => {
            setBody((bodyState: unknown) => {
                const oldBody = castToRecord(bodyState);
                return {
                    ...oldBody,
                    [key]: typeof value === "function" ? value(oldBody[key]) : value,
                };
            });
        },
        [setBody]
    );

    const showFullDescription = useBooleanState(false);

    return (
        <div className="flex w-full flex-1 flex-col gap-y-4 overflow-y-auto overflow-x-hidden px-6 py-4">
            {endpoint.description != null && endpoint.description.length > 0 && (
                <section className="border-border-default-light dark:border-border-default-dark border-b pb-4">
                    <div
                        className={classNames("text-sm", {
                            [styles.descriptionMask]: !showFullDescription.value,
                        })}
                        onClick={showFullDescription.toggleValue}
                    >
                        {endpoint.description}
                    </div>
                </section>
            )}

            {endpoint.authed && (
                <section>
                    <h3 className="m-0">Authorization</h3>
                    <ul className="my-4 w-full list-none space-y-4">
                        <li className="flex flex-col gap-1">
                            <div className="shrink-1 flex min-w-0 flex-1 items-center justify-between gap-2">
                                <label className="inline-flex w-full flex-wrap items-baseline gap-2">
                                    <span className="font-mono text-sm">{"Authorization"}</span>

                                    <span className="t-muted text-xs">{"string"}</span>
                                </label>
                            </div>
                            <InputGroup
                                fill={true}
                                type="password"
                                onValueChange={(newValue) => setHeader("Authorization", `Bearer ${newValue}`)}
                                value={unknownToString(playgroundState.headers["Authorization"]).replace(
                                    /^Bearer /,
                                    ""
                                )}
                                leftIcon={<Key />}
                                autoComplete="off"
                                data-1p-ignore="true"
                            />
                        </li>
                    </ul>
                </section>
            )}

            {endpoint.headers.length > 0 && (
                <section>
                    <h3 className="m-0">Headers</h3>
                    <ul className="my-4 w-full list-none space-y-4">
                        {endpoint.headers.map((header) => (
                            <ApiPlaygroundObjectProperty
                                key={header.key}
                                property={{
                                    key: header.key,
                                    valueType: header.type,
                                    description: header.description,
                                    descriptionContainsMarkdown: header.descriptionContainsMarkdown,
                                    htmlDescription: header.htmlDescription,
                                    availability: header.availability,
                                }}
                                onChange={setHeader}
                                value={playgroundState.headers[header.key]}
                            />
                        ))}
                    </ul>
                </section>
            )}

            {endpoint.path.pathParameters.length > 0 && (
                <section>
                    <h3 className="m-0">Path parameters</h3>
                    <ul className="my-4 w-full list-none space-y-4">
                        {endpoint.path.pathParameters.map((pathParameter) => (
                            <ApiPlaygroundObjectProperty
                                key={pathParameter.key}
                                property={{
                                    key: pathParameter.key,
                                    valueType: pathParameter.type,
                                    description: pathParameter.description,
                                    descriptionContainsMarkdown: pathParameter.descriptionContainsMarkdown,
                                    htmlDescription: pathParameter.htmlDescription,
                                    availability: pathParameter.availability,
                                }}
                                onChange={setPathParameter}
                                value={playgroundState.pathParameters[pathParameter.key]}
                            />
                        ))}
                    </ul>
                </section>
            )}

            {endpoint.queryParameters.length > 0 && (
                <section>
                    <h3 className="m-0">Query parameters</h3>
                    <ul className="my-4 w-full list-none space-y-4">
                        {endpoint.queryParameters.map((queryParameter) => (
                            <ApiPlaygroundObjectProperty
                                key={queryParameter.key}
                                property={{
                                    key: queryParameter.key,
                                    valueType: queryParameter.type,
                                    description: queryParameter.description,
                                    descriptionContainsMarkdown: queryParameter.descriptionContainsMarkdown,
                                    htmlDescription: queryParameter.htmlDescription,
                                    availability: queryParameter.availability,
                                }}
                                onChange={setQueryParameter}
                                value={playgroundState.queryParameters[queryParameter.key]}
                            />
                        ))}
                    </ul>
                </section>
            )}

            {endpoint.request != null && (
                <section>
                    <h3 className="m-0">Body</h3>

                    {visitDiscriminatedUnion(endpoint.request.type, "type")._visit({
                        object: (object) => (
                            <ul className="my-4 w-full list-none space-y-6">
                                {getAllObjectProperties(object, resolveTypeById).map((property) => (
                                    <ApiPlaygroundObjectProperty
                                        key={property.key}
                                        property={property}
                                        onChange={setBodyByKey}
                                        value={castToRecord(playgroundState.body)[property.key]}
                                    />
                                ))}
                            </ul>
                        ),
                        reference: (reference) => (
                            <ApiPlaygroundTypeReference
                                typeReference={reference.value}
                                doNotNest
                                onChange={setBody}
                                value={playgroundState.body}
                            />
                        ),
                        fileUpload: () => <span>fileUpload</span>,
                        _other: () => null,
                    })}
                </section>
            )}
        </div>
    );
};

function castToRecord(value: unknown): Record<string, unknown> {
    if (!isPlainObject(value)) {
        return {};
    }
    return value;
}

export const ApiPlaygroundModal: FC<ApiPlaygroundModalProps> = ({ endpoint, package: package_ }): ReactElement => {
    const { resolveTypeById } = useApiDefinitionContext();
    const [isOpen, setIsOpen] = useState(false);

    const [playgroundState, setPlaygroundState] = useState<ApiPlaygroundState>(() => ({
        headers: endpoint.headers.reduce<Record<string, unknown>>((acc, header) => {
            acc[header.key] = getDefaultValueForType(header.type, resolveTypeById);
            return acc;
        }, {}),
        pathParameters: endpoint.path.pathParameters.reduce<Record<string, unknown>>((acc, pathParameter) => {
            acc[pathParameter.key] = getDefaultValueForType(pathParameter.type, resolveTypeById);
            return acc;
        }, {}),
        queryParameters: endpoint.queryParameters.reduce<Record<string, unknown>>((acc, queryParameter) => {
            acc[queryParameter.key] = getDefaultValueForType(queryParameter.type, resolveTypeById);
            return acc;
        }, {}),
        body:
            endpoint.request != null
                ? visitDiscriminatedUnion(endpoint.request.type, "type")._visit({
                      object: (o) => getDefaultValueForObject(o, resolveTypeById),
                      reference: (reference) => getDefaultValueForType(reference.value, resolveTypeById),
                      fileUpload: () => null,
                      _other: () => null,
                  })
                : {},
    }));

    function closeModal() {
        setIsOpen(false);
    }

    function openModal() {
        setIsOpen(true);
    }

    const [requestType, setRequestType] = useState<"curl" | "javascript" | "python">("curl");

    return (
        <>
            <button
                type="button"
                onClick={openModal}
                className="rounded-md bg-black/20 px-4 py-2 text-sm font-medium text-white hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
            >
                Open dialog
            </button>

            <FernModal
                isOpen={isOpen}
                onClose={closeModal}
                className="divide-border-default-light dark:divide-border-default-dark w-[1280px] divide-y rounded-lg"
            >
                <div className="flex items-stretch justify-between gap-4 p-6">
                    <ApiPlaygroundEndpointSelector endpoint={endpoint} package={package_} />

                    <div className="flex items-center">
                        <a className="link mx-4 text-sm">Sign in to use your API keys</a>
                        <button className="dark:text-dark bg-accent-primary dark:bg-accent-primary-dark hover:bg-accent-primary/90 dark:hover:bg-accent-primary-dark/90 text-accent-primary-contrast dark:text-accent-primary-dark-contrast group flex items-center justify-center space-x-3 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                            <span className="whitespace-nowrap">Send request</span>
                            <div className="flex h-4 w-4 items-center">
                                <FontAwesomeIcon
                                    icon="paper-plane-top"
                                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                                />
                            </div>
                        </button>
                    </div>
                </div>

                <div className="flex justify-between px-6 py-1.5">
                    <div className="flex items-baseline">
                        <HttpMethodTag className="-ml-2 mr-2" method={endpoint.method} />
                        <span className="font-mono text-xs">
                            <span className="t-muted">{endpoint.environments[0]?.baseUrl}</span>
                            {endpoint.path.parts.map((part, idx) => {
                                const stateValue = unknownToString(playgroundState.pathParameters[part.value]);
                                return (
                                    <span
                                        key={idx}
                                        className={classNames({
                                            "bg-accent-highlight dark:bg-accent-highlight-dark text-accent-primary dark:text-accent-primary-dark px-1 rounded before:content-[':']":
                                                part.type === "pathParameter" && stateValue.length === 0,
                                            "text-accent-primary dark:text-accent-primary-dark font-semibold":
                                                part.type === "pathParameter" && stateValue.length > 0,
                                        })}
                                    >
                                        {stateValue.length > 0 ? encodeURI(stateValue) : part.value}
                                    </span>
                                );
                            })}
                            {endpoint.queryParameters.length > 0 &&
                                Object.keys(omitBy(playgroundState.queryParameters, isUndefined)).length > 0 &&
                                endpoint.queryParameters
                                    .filter((queryParameter) => {
                                        const stateValue = playgroundState.queryParameters[queryParameter.key];
                                        if (stateValue == null && queryParameter.type.type === "optional") {
                                            return false;
                                        }
                                        return true;
                                    })
                                    .map((queryParameter, idx) => {
                                        const stateValue = unknownToString(
                                            playgroundState.queryParameters[queryParameter.key]
                                        );
                                        return (
                                            <Fragment key={idx}>
                                                <span>{idx === 0 ? "?" : "&"}</span>

                                                <span>{queryParameter.key}</span>
                                                <span>{"="}</span>
                                                <span
                                                    className={
                                                        "text-accent-primary dark:text-accent-primary-dark font-semibold"
                                                    }
                                                >
                                                    {encodeURI(stateValue)}
                                                </span>
                                            </Fragment>
                                        );
                                    })}
                        </span>
                    </div>
                    {endpoint.request?.contentType && (
                        <div className="bg-tag-default-light dark:bg-tag-default-dark t-muted -mr-2 flex h-6 items-center rounded-lg px-2 text-sm">
                            {endpoint.request?.contentType}
                        </div>
                    )}
                </div>

                <div className="divide-border-default-light dark:divide-border-default-dark flex h-[600px] items-stretch divide-x">
                    <div className="shrink-1 flex min-w-0 flex-1 flex-col">
                        <div className="t-muted border-border-default-light dark:border-border-default-dark w-full border-b px-6 py-2 text-xs uppercase">
                            Request
                        </div>
                        <ApiPlaygroundEndpointContent
                            endpoint={endpoint}
                            package={package_}
                            playgroundState={playgroundState}
                            setPlaygroundState={setPlaygroundState}
                        />
                    </div>
                    <div className="divide-border-default-light dark:divide-border-default-dark shrink-1 flex min-w-0 flex-1 flex-col divide-y">
                        <div className="flex flex-1 flex-col">
                            <div className="border-border-default-light dark:border-border-default-dark flex w-full items-center justify-between border-b px-4 py-2">
                                <span className="t-muted text-xs uppercase">Request Preview</span>
                                <div className="flex items-center gap-2 text-xs">
                                    <button onClick={() => setRequestType("curl")}>CURL</button>
                                    <button onClick={() => setRequestType("javascript")}>JavaScript</button>
                                    <button onClick={() => setRequestType("python")}>Python</button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto p-4">
                                <pre>
                                    <code className="font-mono text-xs">
                                        {requestType === "curl"
                                            ? stringifyCurl(endpoint, playgroundState)
                                            : requestType === "javascript"
                                            ? stringifyFetch(endpoint, playgroundState)
                                            : requestType === "python"
                                            ? stringifyPythonRequests(endpoint, playgroundState)
                                            : null}
                                    </code>
                                </pre>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="t-muted border-border-default-light dark:border-border-default-dark w-full border-b px-4 py-2 text-xs uppercase">
                                Response
                            </div>
                        </div>
                    </div>
                </div>
            </FernModal>
        </>
    );
};

function unknownToString(value: unknown): string {
    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "boolean") {
        return value ? "true" : "false";
    }
    if (typeof value === "number") {
        return value.toString();
    }
    if (value == null) {
        return "";
    }
    return JSON.stringify(value);
}

function buildQueryParams(queryParameters: Record<string, unknown>): string {
    const queryParams = new URLSearchParams();
    Object.entries(queryParameters).forEach(([key, value]) => {
        if (typeof value === "string") {
            queryParams.set(key, value);
        }
    });
    return queryParams.size > 0 ? "?" + queryParams.toString() : "";
}

function buildUrl(endpoint: APIV1Read.EndpointDefinition, playgroundState: ApiPlaygroundState) {
    return (
        endpoint.environments[0]?.baseUrl +
        endpoint.path.parts
            .map((part) => {
                if (part.type === "pathParameter") {
                    const stateValue = playgroundState.pathParameters[part.value];
                    const stateValueString = typeof stateValue === "string" ? stateValue : "";
                    return stateValueString.length > 0 ? encodeURI(stateValueString) : ":" + part.value;
                }
                return part.value;
            })
            .join("") +
        buildQueryParams(playgroundState.queryParameters)
    );
}

function stringifyFetch(endpoint: APIV1Read.EndpointDefinition, playgroundState: ApiPlaygroundState): string {
    return `// ${endpoint.name} (${endpoint.method} ${endpoint.path.parts
        .map((part) => (part.type === "literal" ? part.value : `:${part.value}`))
        .join("")})
const response = fetch("${buildUrl(endpoint, playgroundState)}", ${JSON.stringify(
        {
            method: endpoint.method,
            headers: Object.entries(playgroundState.headers).reduce<Record<string, string>>((acc, [key, value]) => {
                if (typeof value === "string") {
                    acc[key] = value;
                }
                return acc;
            }, {}),
            body: endpoint.request?.type.type === "fileUpload" ? undefined : JSON.stringify(playgroundState.body),
        },
        undefined,
        2
    )});

const body = await response.json();
console.log(body);`;
}

function stringifyPythonRequests(endpoint: APIV1Read.EndpointDefinition, playgroundState: ApiPlaygroundState): string {
    return `import requests

# ${endpoint.name} (${endpoint.method} ${endpoint.path.parts
        .map((part) => (part.type === "literal" ? part.value : `:${part.value}`))
        .join("")})
response = requests.${endpoint.method.toLowerCase()}(
    "${buildUrl(endpoint, playgroundState)}",
    headers=${JSON.stringify(
        Object.entries(playgroundState.headers).reduce<Record<string, string>>((acc, [key, value]) => {
            if (typeof value === "string") {
                acc[key] = value;
            }
            return acc;
        }, {}),
        undefined,
        2
    )},${
        endpoint.request?.contentType === "application/json"
            ? `\n    json=${JSON.stringify(playgroundState.body, undefined, 2)},`
            : ""
    }
)

print(response.json())`;
}

function stringifyCurl(endpoint: APIV1Read.EndpointDefinition, playgroundState: ApiPlaygroundState): string {
    const headers: Record<string, string> = {};
    if (endpoint.authed && playgroundState.headers["Authorization"] != null) {
        headers["Authorization"] = playgroundState.headers["Authorization"] as string;
    }
    if (endpoint.request?.contentType != null) {
        headers["Content-Type"] = endpoint.request.contentType;
    }
    Object.entries(playgroundState.headers).forEach(([key, value]) => {
        if (typeof value === "string") {
            headers[key] = value;
        }
    });
    return CurlGenerator({
        url: buildUrl(endpoint, playgroundState),
        method: endpoint.method,
        headers,
        body: endpoint.request?.type.type === "fileUpload" ? undefined : (playgroundState.body as object),
    });
}

function getDefaultValueForObject(
    object: APIV1Read.ObjectType,
    resolveTypeById: (typeId: APIV1Read.TypeId) => APIV1Read.TypeDefinition | undefined
): Record<string, unknown> {
    return getAllObjectProperties(object, resolveTypeById).reduce<Record<string, unknown>>((acc, property) => {
        acc[property.key] = getDefaultValueForType(property.valueType, resolveTypeById);
        return acc;
    }, {});
}

function matchesTypeShape(
    shape: APIV1Read.TypeShape,
    resolveTypeById: (typeId: APIV1Read.TypeId) => APIV1Read.TypeDefinition | undefined,
    value: unknown
): boolean {
    return visitDiscriminatedUnion(shape, "type")._visit<boolean>({
        object: (object) => {
            if (!isPlainObject(value)) {
                return false;
            }
            const properties = getAllObjectProperties(object, resolveTypeById);
            return Object.keys(properties).every((key) => {
                const property = properties.find((property) => property.key === key);
                if (property == null) {
                    return false;
                }
                return matchesTypeReference(property.valueType, resolveTypeById, value[key]);
            });
        },
        discriminatedUnion: (discriminatedUnion) => {
            if (!isPlainObject(value)) {
                return false;
            }
            const discriminantValue = value[discriminatedUnion.discriminant];
            if (typeof discriminantValue !== "string") {
                return false;
            }
            return discriminatedUnion.variants.some((variant) => {
                if (variant.discriminantValue !== discriminantValue) {
                    return false;
                }

                const mockedObjectTypeReference: APIV1Read.TypeShape = {
                    type: "object",
                    extends: variant.additionalProperties.extends,
                    properties: [
                        ...variant.additionalProperties.properties,
                        {
                            key: discriminatedUnion.discriminant,
                            valueType: {
                                type: "literal",
                                value: {
                                    type: "stringLiteral",
                                    value: discriminantValue,
                                },
                            },
                        },
                    ],
                };

                return matchesTypeShape(mockedObjectTypeReference, resolveTypeById, value);
            });
        },
        undiscriminatedUnion: (undiscriminatedUnion) => {
            if (!isPlainObject(value)) {
                return false;
            }
            return undiscriminatedUnion.variants.some((variant) =>
                matchesTypeReference(variant.type, resolveTypeById, value)
            );
        },
        alias: (alias) => matchesTypeReference(alias.value, resolveTypeById, value),
        enum: (enumType) => {
            if (typeof value !== "string") {
                return false;
            }
            return enumType.values.some((enumValue) => enumValue.value === value);
        },
        _other: () => value == null,
    });
}

function matchesTypeReference(
    type: APIV1Read.TypeReference,
    resolveTypeById: (typeId: APIV1Read.TypeId) => APIV1Read.TypeDefinition | undefined,
    value: unknown
): boolean {
    return visitDiscriminatedUnion(type, "type")._visit<boolean>({
        id: (id) => {
            const typeDefinition = resolveTypeById(id.value);
            if (typeDefinition == null) {
                return value == null;
            }
            return matchesTypeShape(typeDefinition.shape, resolveTypeById, value);
        },
        primitive: (primitive) => {
            return visitDiscriminatedUnion(primitive.value, "type")._visit<boolean>({
                string: () => typeof value === "string",
                boolean: () => typeof value === "boolean",
                integer: () => typeof value === "number" && Number.isInteger(value),
                double: () => typeof value === "number",
                long: () => typeof value === "number" && Number.isInteger(value),
                datetime: () => value instanceof Date,
                uuid: () => typeof value === "string",
                base64: () => typeof value === "string",
                date: () => value instanceof Date,
                _other: () => value == null,
            });
        },
        optional: (optionalType) =>
            value == null || matchesTypeReference(optionalType.itemType, resolveTypeById, value),
        list: (listType) =>
            Array.isArray(value) &&
            value.every((item) => matchesTypeReference(listType.itemType, resolveTypeById, item)),
        set: (setType) =>
            Array.isArray(value) &&
            value.every((item) => matchesTypeReference(setType.itemType, resolveTypeById, item)),
        map: (MapTypeContextProvider) =>
            isPlainObject(value) &&
            Object.keys(value).every((key) =>
                matchesTypeReference(MapTypeContextProvider.valueType, resolveTypeById, value[key])
            ),
        literal: (literalType) => value === literalType.value.value,
        unknown: () => value == null,
        _other: () => value == null,
    });
}

function getDefaultValueForType(
    type: APIV1Read.TypeReference,
    resolveTypeById: (typeId: APIV1Read.TypeId) => APIV1Read.TypeDefinition | undefined
): unknown {
    return visitDiscriminatedUnion(type, "type")._visit({
        id: (id) => {
            const typeDefinition = resolveTypeById(id.value);
            if (typeDefinition == null) {
                return null;
            }
            return visitDiscriminatedUnion(typeDefinition.shape, "type")._visit({
                object: (object) => getDefaultValueForObject(object, resolveTypeById),
                discriminatedUnion: (discriminatedUnion) => {
                    const variant = discriminatedUnion.variants[0];

                    if (variant == null) {
                        return null;
                    }

                    const variantProperties = getAllObjectProperties(variant.additionalProperties, resolveTypeById);

                    return variantProperties.reduce<Record<string, unknown>>(
                        (acc, property) => {
                            acc[property.key] = getDefaultValueForType(property.valueType, resolveTypeById);
                            return acc;
                        },
                        {
                            [discriminatedUnion.discriminant]: variant.discriminantValue,
                        }
                    );
                },
                undiscriminatedUnion: (undiscriminatedUnion) => {
                    const variant = undiscriminatedUnion.variants[0];
                    if (variant == null) {
                        return null;
                    }
                    return getDefaultValueForType(variant.type, resolveTypeById);
                },
                alias: (alias) => getDefaultValueForType(alias.value, resolveTypeById),
                enum: (value) => value.values[0]?.value,
                _other: () => null,
            });
        },
        primitive: (primitive) =>
            visitDiscriminatedUnion(primitive.value, "type")._visit<unknown>({
                string: () => "",
                boolean: () => false,
                integer: () => 0,
                double: () => 0,
                long: () => 0,
                datetime: () => new Date().toISOString(),
                uuid: () => "",
                base64: () => "",
                date: () => new Date().toISOString(),
                _other: () => null,
            }),
        optional: () => undefined,
        list: () => [],
        set: () => [],
        map: () => ({}),
        literal: (literal) => literal.value.value,
        unknown: () => null,
        _other: () => null,
    });
}

function isExpandable(
    valueType: APIV1Read.TypeReference,
    resolveTypeById: (typeId: string) => APIV1Read.TypeDefinition | undefined,
    currentValue: unknown
): boolean {
    return visitDiscriminatedUnion(valueType, "type")._visit<boolean>({
        id: (id) => {
            const typeShape = resolveTypeById(id.value)?.shape;
            if (typeShape == null) {
                return false;
            }
            return visitDiscriminatedUnion(typeShape, "type")._visit<boolean>({
                object: () => true,
                discriminatedUnion: () => true,
                undiscriminatedUnion: () => true,
                alias: (alias) => isExpandable(alias.value, resolveTypeById, currentValue),
                enum: () => false,
                _other: () => false,
            });
        },
        primitive: () => false,
        optional: (optional) => isExpandable(optional.itemType, resolveTypeById, currentValue),
        list: () => Array.isArray(currentValue) && currentValue.length > 1,
        set: () => Array.isArray(currentValue) && currentValue.length > 1,
        map: () => isPlainObject(currentValue) && Object.keys(currentValue).length > 1,
        literal: () => false,
        unknown: () => false,
        _other: () => false,
    });
}
