import {
    ObjectProperty,
    TypeDefinition,
    WithAvailability,
    WithDescription,
    unwrapReference,
} from "@fern-api/fdr-sdk/api-definition";
import { FernButton, FernTooltip } from "@fern-ui/components";
import cn from "clsx";
import { HelpCircle, Xmark } from "iconoir-react";
import { FC, PropsWithChildren } from "react";
import { EndpointAvailabilityTag } from "../api-reference/endpoints/EndpointAvailabilityTag";
import { Markdown } from "../mdx/Markdown";
import { renderTypeShorthand } from "../type-shorthand";
import { shouldRenderInline } from "./utils";

interface WithLabelProps {
    htmlFor?: string;
    property?: ObjectProperty;
    value: unknown;
    onRemove: () => void;
    types: Record<string, TypeDefinition>;
}

export const WithLabel: FC<PropsWithChildren<WithLabelProps>> = ({
    htmlFor,
    property,
    value,
    onRemove,
    children,
    types,
}) => {
    if (!property) {
        return <>{children}</>;
    }
    const unwrapped = unwrapReference(property.valueShape, types);
    const renderInline = shouldRenderInline(unwrapped.shape, types);

    return (
        <WithLabelInternal
            propertyKey={property.key}
            htmlFor={htmlFor}
            value={value}
            onRemove={onRemove}
            availability={property.availability}
            description={property.description}
            renderInline={renderInline}
            isRequired={property.valueShape.type !== "optional"}
            isList={unwrapped.shape.type === "list"}
            isBoolean={unwrapped.shape.type === "primitive" && unwrapped.shape.value.type === "boolean"}
            typeShorthand={renderTypeShorthand(unwrapped.shape, undefined, types)}
        >
            {children}
        </WithLabelInternal>
    );
};

interface WithLabelInternalProps extends WithAvailability, WithDescription {
    propertyKey: string;
    htmlFor?: string;
    value: unknown;
    onRemove: () => void;
    renderInline?: boolean;
    isRequired: boolean;
    typeShorthand: string;
    isList?: boolean;
    isBoolean?: boolean;
}

export const WithLabelInternal: FC<PropsWithChildren<WithLabelInternalProps>> = ({
    propertyKey,
    htmlFor,
    value,
    onRemove,
    children,
    availability,
    description,
    renderInline = false,
    isRequired,
    isList,
    isBoolean,
    typeShorthand,
}) => {
    return (
        <div
            className={cn({
                "flex gap-2 max-sm:flex-col": renderInline,
                "space-y-2": !renderInline,
            })}
        >
            <div className="flex min-w-0 flex-1 shrink items-center justify-between gap-2">
                <label className="inline-flex items-baseline gap-2 truncate" htmlFor={htmlFor}>
                    <span className={cn("font-mono text-sm")}>{propertyKey}</span>

                    {description != null && (
                        <FernTooltip content={<Markdown mdx={description} size="xs" />} delayDuration={0}>
                            <HelpCircle className="t-muted size-4 self-center" />
                        </FernTooltip>
                    )}

                    {availability != null && <EndpointAvailabilityTag availability={availability} minimal={true} />}
                    <span className="whitespace-nowrap text-xs">
                        {isRequired && <span className="t-danger">required </span>}
                        <span className="t-muted">{typeShorthand}</span>
                    </span>

                    {isList && Array.isArray(value) && value.length > 0 && (
                        <span className="t-muted whitespace-nowrap text-xs">
                            ({value.length} {value.length === 1 ? "item" : "items"})
                        </span>
                    )}
                </label>

                {!renderInline && (
                    <span className="inline-flex min-w-0 shrink items-center gap-1">
                        {!isRequired && (
                            <FernButton
                                icon={<Xmark />}
                                size="small"
                                variant="minimal"
                                className="-mr-3 opacity-50 transition-opacity hover:opacity-100"
                                onClick={onRemove}
                            />
                        )}
                    </span>
                )}
            </div>

            <div
                className={cn("flex", {
                    "flex-1 shrink min-w-0": !isBoolean,
                })}
            >
                {children}

                {renderInline && (
                    <span className="inline-flex min-w-0 shrink items-center gap-1">
                        {!isRequired && (
                            <FernButton
                                icon={<Xmark />}
                                size="small"
                                variant="minimal"
                                className="-mr-3 ml-1 opacity-50 transition-opacity hover:opacity-100"
                                onClick={onRemove}
                            />
                        )}
                    </span>
                )}
            </div>
        </div>
    );
};
