import { useBooleanState } from "@fern-ui/react-commons";
import { CardStackPlusIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { useSetAtom } from "jotai";
import dynamic from "next/dynamic";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { renderTypeShorthand } from "../api-page/types/type-shorthand/TypeShorthand";
import { FernButton } from "../components/FernButton";
import { FernDropdown } from "../components/FernDropdown";
import { ResolvedObjectProperty, unwrapOptional } from "../util/resolver";
import { FOCUSED_PARAMETER_ATOM } from "./PlaygroundEndpointFormAside";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { castToRecord, getDefaultValueForType, isExpandable } from "./utils";

const Markdown = dynamic(() => import("../api-page/markdown/Markdown").then(({ Markdown }) => Markdown), {
    ssr: true,
});

const ADD_ALL_KEY = "__FERN_ADD_ALL__" as const;

interface PlaygroundObjectPropertyFormProps {
    id?: string;
    property: ResolvedObjectProperty;
    onChange: (key: string, value: unknown) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    value: unknown;
    expandByDefault?: boolean;
}

export const PlaygroundObjectPropertyForm: FC<PlaygroundObjectPropertyFormProps> = ({
    id,
    property,
    onChange,
    onBlur,
    onFocus,
    value,
    expandByDefault = true,
}) => {
    const handleChange = useCallback(
        (newValue: unknown) => {
            onChange(property.key, newValue);
        },
        [onChange, property.key],
    );

    const expandable = isExpandable(property.valueShape, value);
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
            shape={property.valueShape.type === "optional" ? property.valueShape.shape : property.valueShape}
            onChange={handleChange}
            value={value}
            onFocus={onFocus}
            onBlur={onBlur}
            renderAsPanel={true}
            onOpenStack={handleOpenStack}
            onCloseStack={handleCloseStack}
        />
    );
};

interface PlaygroundObjectPropertiesFormProps {
    prefix?: string;
    properties: ResolvedObjectProperty[];
    onChange: (value: unknown) => void;
    value: unknown;
    indent?: boolean;
}

export const PlaygroundObjectPropertiesForm: FC<PlaygroundObjectPropertiesFormProps> = ({
    prefix,
    properties,
    onChange,
    value,
    indent = false,
}) => {
    const setFocusedParameter = useSetAtom(FOCUSED_PARAMETER_ATOM);
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
                helperText: renderTypeShorthand(property.valueShape),
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
    }, [hiddenProperties]);

    return (
        <div className={indent ? "border-border-default-soft border-l pl-4" : undefined}>
            {shownProperties.length > 0 && (
                <ul className="list-none space-y-8">
                    {shownProperties.map((property) => {
                        const id = prefix != null ? `${prefix}.${property.key}` : property.key;
                        return (
                            <li key={property.key} className="relative -mx-4 px-4" tabIndex={-1}>
                                <PlaygroundObjectPropertyForm
                                    key={id}
                                    id={id}
                                    property={property}
                                    onChange={onChangeObjectProperty}
                                    value={castToRecord(value)[property.key]}
                                    onFocus={() => {
                                        setFocusedParameter(id);
                                    }}
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
                                    const newValue = getDefaultValueForType(unwrapOptional(property.valueShape));
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
                            getDefaultValueForType(unwrapOptional(property.valueShape)),
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
