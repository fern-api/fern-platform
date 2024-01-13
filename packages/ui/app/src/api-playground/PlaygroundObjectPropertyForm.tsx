import { Button, Collapse, Switch, Tooltip } from "@blueprintjs/core";
import { ChevronDown, ChevronUp } from "@blueprintjs/icons";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { useBooleanState } from "@fern-ui/react-commons";
import classNames from "classnames";
import { isUndefined } from "lodash-es";
import { ChangeEventHandler, FC, useCallback, useEffect } from "react";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { EndpointAvailabilityTag } from "../api-page/endpoints/EndpointAvailabilityTag";
import { TypeShorthand } from "../api-page/types/type-shorthand/TypeShorthand";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { getDefaultValueForType, isExpandable } from "./utils";

interface PlaygroundObjectPropertyFormProps {
    property: APIV1Read.ObjectProperty;
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
    const { resolveTypeById } = useApiDefinitionContext();

    const handleChange = useCallback(
        (newValue: unknown) => {
            onChange(property.key, newValue);
        },
        [onChange, property.key]
    );

    const expandable = isExpandable(property.valueType, resolveTypeById, value);
    const {
        value: expanded,
        setTrue: setExpanded,
        toggleValue: toggleExpanded,
    } = useBooleanState(!expandable || expandByDefault);

    const handleChangeOptional = useCallback<ChangeEventHandler<HTMLInputElement>>(
        (e) => {
            if (property.valueType.type === "optional") {
                onChange(
                    property.key,
                    e.target.checked ? getDefaultValueForType(property.valueType.itemType, resolveTypeById) : undefined
                );
                setExpanded();
            }
        },
        [onChange, property.key, property.valueType, resolveTypeById, setExpanded]
    );

    useEffect(() => {
        if (!expandable) {
            setExpanded();
        }
    }, [expandable, setExpanded]);

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
                        <span
                            className={classNames("font-mono text-sm", {
                                "underline decoration-dotted underline-offset-4 decoration-accent-primary dark:decoration-accent-primary-dark":
                                    property.description != null && property.description.length > 0,
                            })}
                        >
                            {property.key}
                        </span>

                        <span className="t-muted text-xs">
                            <TypeShorthand type={property.valueType} plural={false} />
                        </span>

                        {property.availability != null && (
                            <EndpointAvailabilityTag availability={property.availability} minimal={true} />
                        )}
                    </label>
                </Tooltip>

                {expandable && (property.valueType.type === "optional" ? !isUndefined(value) : true) && (
                    <div className="flex flex-1 items-center gap-2">
                        <div className="bg-border-default-light dark:bg-border-default-dark h-px w-full" />
                        <Button
                            icon={expanded ? <ChevronDown /> : <ChevronUp />}
                            minimal={true}
                            small={true}
                            className="-mx-1"
                            onClick={toggleExpanded}
                        />
                    </div>
                )}

                {property.valueType.type === "optional" && (
                    <Switch checked={!isUndefined(value)} onChange={handleChangeOptional} className="-mr-2 mb-0" />
                )}
            </div>
            <Collapse isOpen={!isUndefined(value) && (!expandable || expanded)}>
                <PlaygroundTypeReferenceForm
                    typeReference={
                        property.valueType.type === "optional" ? property.valueType.itemType : property.valueType
                    }
                    onChange={handleChange}
                    value={value}
                />
            </Collapse>
            <Collapse isOpen={expandable && !expanded}>
                <code className="t-muted font-mono text-xs">Value: {JSON.stringify(value)}</code>
            </Collapse>
        </li>
    );
};
