import { ResolvedObjectProperty } from "@fern-ui/app-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { sortBy } from "lodash-es";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
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
        <PlaygroundTypeReferenceForm
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
                <li key={property.key} className="relative -mx-4 p-4" tabIndex={-1}>
                    <PlaygroundObjectPropertyForm
                        key={property.key}
                        property={property}
                        onChange={onChangeObjectProperty}
                        value={castToRecord(value)[property.key]}
                    />
                </li>
            ))}
        </ul>
    );
};

function isObjectOrOptionalObject(shape: ResolvedObjectProperty["valueShape"]): boolean {
    return shape.type === "object" || (shape.type === "optional" && shape.shape.type === "object");
}
