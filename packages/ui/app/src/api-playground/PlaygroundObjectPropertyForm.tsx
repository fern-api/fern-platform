import { useBooleanState } from "@fern-ui/react-commons";
import { CardStackPlusIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import dynamic from "next/dynamic";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { renderTypeShorthand } from "../api-page/types/type-shorthand/TypeShorthand";
import { FernButton } from "../components/FernButton";
import { FernDropdown } from "../components/FernDropdown";
import { ResolvedObjectProperty, ResolvedTypeDefinition, unwrapOptional } from "../util/resolver";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { castToRecord, getDefaultValueForType, isExpandable } from "./utils";

const Markdown = dynamic(() => import("../api-page/markdown/Markdown").then(({ Markdown }) => Markdown), {
    ssr: true,
});

const ADD_ALL_KEY = "__FERN_ADD_ALL__" as const;

interface PlaygroundObjectPropertyFormProps {
    id: string;
    property: ResolvedObjectProperty;
    onChange: (key: string, value: unknown) => void;
    value: unknown;
    expandByDefault?: boolean;
    types: Record<string, ResolvedTypeDefinition>;
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
            shape={unwrapOptional(property.valueShape, types)}
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
    properties: ResolvedObjectProperty[];
    onChange: (value: unknown) => void;
    value: unknown;
    indent?: boolean;
    types: Record<string, ResolvedTypeDefinition>;
    disabled?: boolean;
}

export const PlaygroundObjectPropertiesForm: FC<PlaygroundObjectPropertiesFormProps> = ({
    id,
    properties,
    onChange,
    value,
    indent = false,
    types,
    disabled,
}) => {
    const onChangeObjectProperty = useCallback(
        (key: string, newValue: unknown) => {
            onChange((oldValue: unknown) => {
                const oldObject = castToRecord(oldValue);
                return { ...oldObject, [key]: typeof newValue === "function" ? newValue(oldObject[key]) : newValue };
            });
        },
        [onChange],
    );
    const shownProperties = useMemo(() => {
        return properties.filter((property) =>
            shouldShowProperty(property.valueShape, castToRecord(value)[property.key]),
        );
    }, [properties, value]);
    const hiddenProperties = useMemo(() => {
        return properties.filter(
            (property) => !shouldShowProperty(property.valueShape, castToRecord(value)[property.key]),
        );
    }, [properties, value]);

    const hiddenPropertiesOptions = useMemo(() => {
        const options = hiddenProperties.map(
            (property): FernDropdown.Option => ({
                type: "value",
                value: property.key,
                label: property.key,
                helperText: renderTypeShorthand(property.valueShape, undefined, types),
                labelClassName: "font-mono",
                tooltip:
                    property.description != null ? (
                        <Markdown className="text-xs">{property.description}</Markdown>
                    ) : undefined,
            }),
        );

        if (options.length > 1) {
            options.push(
                { type: "separator" },
                {
                    type: "value",
                    value: ADD_ALL_KEY,
                    label: "Add all optional properties",
                    rightElement: <CardStackPlusIcon />,
                },
            );
        }
        return options;
    }, [hiddenProperties, types]);

    return (
        <div
            className={classNames("flex-1 shrink min-w-0", {
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
                                    const newValue = getDefaultValueForType(
                                        unwrapOptional(property.valueShape, types),
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
                            getDefaultValueForType(unwrapOptional(property.valueShape, types), types),
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
                        rightIcon={<PlusCircledIcon />}
                        className="mt-8 w-full text-left first:mt-0"
                    />
                </FernDropdown>
            )}
        </div>
    );
};

function shouldShowProperty(shape: ResolvedObjectProperty["valueShape"], value: unknown): boolean {
    return shape.type !== "optional" || value !== undefined;
}
