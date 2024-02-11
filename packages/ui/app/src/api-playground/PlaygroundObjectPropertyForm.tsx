import { ResolvedObjectProperty } from "@fern-ui/app-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import classNames from "classnames";
import { sortBy } from "lodash-es";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { EndpointAvailabilityTag } from "../api-page/endpoints/EndpointAvailabilityTag";
import { renderTypeShorthand } from "../api-page/types/type-shorthand/TypeShorthand";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { castToRecord, isExpandable } from "./utils";

interface PlaygroundObjectPropertyFormProps {
    property: ResolvedObjectProperty;
    onChange: (key: string, value: unknown) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    value: unknown;
    expandByDefault?: boolean;
}

export const PlaygroundObjectPropertyForm: FC<PlaygroundObjectPropertyFormProps> = ({
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
        <li className="relative -mx-4 space-y-2 p-4" tabIndex={-1}>
            <div className="flex items-center justify-between gap-2">
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

                <span className="whitespace-nowrap text-xs">
                    {property.valueShape.type !== "optional" && <span className="t-danger">required </span>}
                    <span className="t-muted">{renderTypeShorthand(property.valueShape)}</span>
                </span>
            </div>
            {/* <FernTooltip
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
            > */}
            <div>
                <PlaygroundTypeReferenceForm
                    shape={property.valueShape.type === "optional" ? property.valueShape.shape : property.valueShape}
                    onChange={handleChange}
                    value={value}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    renderAsPanel={true}
                    onOpenStack={handleOpenStack}
                    onCloseStack={handleCloseStack}
                />
            </div>
            {/* </FernTooltip> */}
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
        <ul className="list-none px-4">
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
