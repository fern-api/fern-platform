import { Button, Checkbox, Tooltip } from "@blueprintjs/core";
import { ChevronDown, ChevronUp } from "@blueprintjs/icons";
import { ResolvedObjectProperty } from "@fern-ui/app-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import classNames from "classnames";
import { isUndefined } from "lodash-es";
import { ChangeEventHandler, FC, useCallback, useEffect, useState } from "react";
import { EndpointAvailabilityTag } from "../api-page/endpoints/EndpointAvailabilityTag";
import { renderTypeShorthand } from "../api-page/types/type-shorthand/TypeShorthand";
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
        [onChange, property.key]
    );

    const expandable = isExpandable(property.valueShape, value);
    const {
        value: expanded,
        setTrue: setExpanded,
        toggleValue: toggleExpanded,
    } = useBooleanState(!expandable || expandByDefault);

    const handleChangeOptional = useCallback<ChangeEventHandler<HTMLInputElement>>(
        (e) => {
            if (property.valueShape.type === "optional") {
                onChange(
                    property.key,
                    e.target.checked ? getDefaultValueForType(property.valueShape.shape) : undefined
                );
                setExpanded();
            }
        },
        [onChange, property.key, property.valueShape, setExpanded]
    );

    useEffect(() => {
        if (!expandable) {
            setExpanded();
        }
    }, [expandable, setExpanded]);

    const [focused, setFocused] = useState(false);
    const handleFocus = useCallback(() => setFocused(true), []);
    const handleBlur = useCallback(() => setFocused(false), []);

    return (
        <Tooltip
            isOpen={focused === true ? true : undefined}
            content={property.description}
            popoverClassName="max-w-xs text-xs"
            disabled={property.description == null || property.description.length === 0}
            placement="right"
            renderTarget={({ ref, isOpen, className, ...targetProps }) => (
                <li ref={ref} className={className} {...targetProps}>
                    <div
                        className={classNames(
                            "divide-border-default-light dark:divide-border-default-dark flex min-h-12 flex-row items-stretch divide-x px-4",
                            {
                                "divide-x-0": expanded && expandable,
                            }
                        )}
                    >
                        <div className="flex min-w-0 max-w-full flex-1 shrink items-center justify-between gap-2 py-2 pr-2">
                            <label className="inline-flex w-full items-baseline gap-2">
                                <span className={classNames("font-mono text-sm truncate")}>{property.key}</span>

                                {property.availability != null && (
                                    <EndpointAvailabilityTag availability={property.availability} minimal={true} />
                                )}
                            </label>
                        </div>
                        <div className="flex min-w-0 max-w-full flex-1 shrink items-center justify-end gap-2 pl-2">
                            {!isUndefined(value) && !expandable && (
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
                                />
                            )}

                            {((property.valueShape.type === "optional" && isUndefined(value)) || expandable) && (
                                <span className="t-muted whitespace-nowrap text-xs">
                                    {renderTypeShorthand(property.valueShape)}
                                </span>
                            )}

                            {expandable && (property.valueShape.type === "optional" ? !isUndefined(value) : true) && (
                                <Button
                                    icon={expanded ? <ChevronDown /> : <ChevronUp />}
                                    minimal={true}
                                    small={true}
                                    className="-mx-1"
                                    onClick={toggleExpanded}
                                />
                            )}

                            {property.valueShape.type === "optional" && (
                                <span className="inline-flex items-center">
                                    <Checkbox
                                        checked={!isUndefined(value)}
                                        onChange={handleChangeOptional}
                                        className="!-my-2 !-mr-2"
                                    />
                                </span>
                            )}
                        </div>
                    </div>
                    {!isUndefined(value) && expandable && expanded && (
                        <div className="px-4">
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
                            />
                        </div>
                    )}
                </li>
            )}
        />
    );
};

interface PlaygroundObjectPropertiesFormProps {
    properties: ResolvedObjectProperty[];
    onChange: (value: unknown) => void;
    value: unknown;
}

export const PlaygroundObjectPropertiesForm: FC<PlaygroundObjectPropertiesFormProps> = ({
    properties,
    onChange,
    value,
}) => {
    const onChangeObjectProperty = useCallback(
        (key: string, newValue: unknown) => {
            onChange((oldValue: unknown) => {
                const oldObject = castToRecord(oldValue);
                return { ...oldObject, [key]: typeof newValue === "function" ? newValue(oldObject[key]) : newValue };
            });
        },
        [onChange]
    );
    return (
        <ul
            className={
                "divide-border-default-dark dark:divide-border-default-dark border-border-default-light dark:border-border-default-dark -mx-4 mb-4 list-none divide-y border-y"
            }
        >
            {properties.map((property) => (
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
