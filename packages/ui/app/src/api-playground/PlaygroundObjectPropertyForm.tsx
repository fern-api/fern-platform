import { Checkbox } from "@blueprintjs/core";
import { ResolvedObjectProperty } from "@fern-ui/app-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import classNames from "classnames";
import { isUndefined, sortBy } from "lodash-es";
import { ChangeEventHandler, FC, useCallback, useEffect, useMemo, useState } from "react";
import { EndpointAvailabilityTag } from "../api-page/endpoints/EndpointAvailabilityTag";
import { Markdown } from "../api-page/markdown/Markdown";
import { renderTypeShorthand } from "../api-page/types/type-shorthand/TypeShorthand";
import { FernTooltip } from "../components/FernTooltip";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { castToRecord, getDefaultValueForType, isExpandable } from "./utils";

interface PlaygroundObjectPropertyFormProps {
    property: ResolvedObjectProperty;
    onChange: (key: string, value: unknown) => void;
    value: unknown;
    expandByDefault?: boolean;
}

export const PlaygroundObjectPropertyForm: FC<PlaygroundObjectPropertyFormProps> = ({
    property,
    onChange,
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

    const handleChangeOptional = useCallback<ChangeEventHandler<HTMLInputElement>>(
        (e) => {
            if (property.valueShape.type === "optional") {
                onChange(
                    property.key,
                    e.target.checked ? getDefaultValueForType(property.valueShape.shape) : undefined,
                );
                setExpanded();
            }
        },
        [onChange, property.key, property.valueShape, setExpanded],
    );

    useEffect(() => {
        if (!expandable) {
            setExpanded();
        }
    }, [expandable, setExpanded]);

    const [focused, setFocused] = useState(false);
    const handleFocus = useCallback(() => setFocused(true), []);
    const handleBlur = useCallback(() => setFocused(false), []);
    const [isUnderStack, setIsUnderStack] = useState(false);
    const handleOpenStack = useCallback(() => setIsUnderStack(true), []);
    const handleCloseStack = useCallback(() => setIsUnderStack(false), []);

    return (
        <li className="py-1" tabIndex={-1}>
            <div className="flex items-center justify-between gap-2 pb-1 pt-3">
                <label className="inline-flex w-full items-baseline gap-2">
                    <span className={classNames("font-mono text-sm truncate")}>{property.key}</span>

                    {property.availability != null && (
                        <EndpointAvailabilityTag availability={property.availability} minimal={true} />
                    )}

                    {property.valueShape.type === "list" && Array.isArray(value) && (
                        <span className="t-muted whitespace-nowrap text-xs">
                            ({value.length} {value.length === 1 ? "item" : "items"})
                        </span>
                    )}
                </label>

                <span className="t-muted whitespace-nowrap text-xs">
                    {renderTypeShorthand(property.valueShape)}

                    {property.valueShape.type === "optional" && (
                        <span className="ml-2 inline-flex items-center">
                            <Checkbox
                                checked={!isUndefined(value)}
                                onChange={handleChangeOptional}
                                className="!-my-2 !-mr-2"
                            />
                        </span>
                    )}
                </span>
            </div>
            <FernTooltip
                open={
                    property.description == null || property.description.length === 0 || isUnderStack
                        ? false
                        : focused === true
                          ? true
                          : undefined
                }
                content={
                    <Markdown notProse className="prose-sm dark:prose-invert">
                        {property.description}
                    </Markdown>
                }
            >
                <div className="flex items-center justify-between gap-2 pb-3">
                    {!isUndefined(value) && (
                        <PlaygroundTypeReferenceForm
                            shape={
                                property.valueShape.type === "optional"
                                    ? property.valueShape.shape
                                    : property.valueShape
                            }
                            onChange={handleChange}
                            value={value}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            renderAsPanel={true}
                            onOpenStack={handleOpenStack}
                            onCloseStack={handleCloseStack}
                        />
                    )}

                    {/* {expandable && (property.valueShape.type === "optional" ? !isUndefined(value) : true) && (
                        <FernButton
                            icon={expanded ? <ChevronDownIcon /> : <ChevronUpIcon />}
                            variant="minimal"
                            size="small"
                            className="-mx-1"
                            onClick={toggleExpanded}
                        />
                    )} */}
                </div>
            </FernTooltip>
        </li>
    );
};

interface PlaygroundObjectPropertiesFormProps {
    properties: ResolvedObjectProperty[];
    onChange: (value: unknown) => void;
    value: unknown;
    hideObjects: boolean;
    sortProperties: boolean;
}

export const PlaygroundObjectPropertiesForm: FC<PlaygroundObjectPropertiesFormProps> = ({
    properties,
    onChange,
    value,
    hideObjects,
    sortProperties,
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
    const propertiesToRender: ResolvedObjectProperty[] = useMemo(() => {
        const filteredProperties = properties.filter((property) =>
            hideObjects ? !isObjectOrOptionalObject(property.valueShape) : true,
        );
        if (sortProperties) {
            return sortBy(filteredProperties, (property) => property.key);
        }
        return filteredProperties;
    }, [hideObjects, properties, sortProperties]);
    return (
        <ul className={"divide-border-default border-default list-none divide-y border-y"}>
            {propertiesToRender.map((property) => (
                <PlaygroundObjectPropertyForm
                    key={property.key}
                    property={property}
                    onChange={onChangeObjectProperty}
                    value={castToRecord(value)[property.key]}
                />
            ))}
        </ul>
    );
};

function isObjectOrOptionalObject(shape: ResolvedObjectProperty["valueShape"]): boolean {
    return shape.type === "object" || (shape.type === "optional" && shape.shape.type === "object");
}
