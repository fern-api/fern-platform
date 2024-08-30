import { FernButton, FernTooltip } from "@fern-ui/components";
import cn from "clsx";
import { HelpCircle, Xmark } from "iconoir-react";
import { FC, PropsWithChildren } from "react";
import { EndpointAvailabilityTag } from "../api-reference/endpoints/EndpointAvailabilityTag";
import { renderTypeShorthand } from "../api-reference/types/type-shorthand/TypeShorthand";
import { Markdown } from "../mdx/Markdown";
import {
    ResolvedObjectProperty,
    ResolvedTypeDefinition,
    WithAvailability,
    WithDescription,
    unwrapOptional,
} from "../resolver/types";
import { shouldRenderInline } from "./utils";

interface WithLabelProps {
    htmlFor?: string;
    property?: ResolvedObjectProperty;
    value: unknown;
    onRemove: () => void;
    types: Record<string, ResolvedTypeDefinition>;
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
    const valueShape = unwrapOptional(property.valueShape, types);
    const renderInline = shouldRenderInline(valueShape, types);

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
            isList={valueShape.type === "list"}
            isBoolean={valueShape.type === "primitive" && valueShape.value.type === "boolean"}
            typeShorthand={renderTypeShorthand(valueShape, undefined, types)}
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
                        <FernTooltip
                            content={<Markdown mdx={description} className="prose-sm text-xs" />}
                            delayDuration={0}
                        >
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
