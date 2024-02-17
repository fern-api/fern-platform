import { ResolvedObjectProperty, unwrapOptional } from "@fern-ui/app-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { FernButton } from "../components/FernButton";
import { FernDropdown } from "../components/FernDropdown";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { castToRecord, getDefaultValueForType, isExpandable } from "./utils";

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
    return (
        <>
            {shownProperties.length > 0 && (
                <ul className="list-none">
                    {shownProperties.map((property) => (
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
            )}

            {hiddenProperties.length > 0 && (
                <FernDropdown
                    options={hiddenProperties.map((property) => ({ value: property.key }))}
                    onValueChange={(key) => {
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
                        className="mt-4 w-full text-left"
                    />
                </FernDropdown>
            )}
        </>
    );
};

function shouldShowProperty(shape: ResolvedObjectProperty["valueShape"], value: unknown): boolean {
    return shape.type !== "optional" || value !== undefined;
}
