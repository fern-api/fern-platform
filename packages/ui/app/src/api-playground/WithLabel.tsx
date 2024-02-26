import { Cross1Icon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { FC, PropsWithChildren } from "react";
import { EndpointAvailabilityTag } from "../api-page/endpoints/EndpointAvailabilityTag";
import { renderTypeShorthand } from "../api-page/types/type-shorthand/TypeShorthand";
import { FernButton } from "../components/FernButton";
import { ResolvedObjectProperty, ResolvedTypeDefinition, unwrapOptional } from "../util/resolver";
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
        <div
            className={classNames({
                "flex gap-2": renderInline,
                "space-y-2": !renderInline,
            })}
        >
            <div className="flex min-w-0 flex-1 shrink items-center justify-between gap-2">
                <label className="inline-flex items-baseline gap-2 truncate" htmlFor={htmlFor}>
                    <span className={classNames("font-mono text-sm")}>{property.key}</span>

                    {property.availability != null && (
                        <EndpointAvailabilityTag availability={property.availability} minimal={true} />
                    )}
                    <span className="whitespace-nowrap text-xs">
                        {property.valueShape.type !== "optional" && <span className="t-danger">required </span>}
                        <span className="t-muted">{renderTypeShorthand(property.valueShape, undefined, types)}</span>
                    </span>

                    {valueShape.type === "list" && Array.isArray(value) && value.length > 0 && (
                        <span className="t-muted whitespace-nowrap text-xs">
                            ({value.length} {value.length === 1 ? "item" : "items"})
                        </span>
                    )}
                </label>

                {!renderInline && (
                    <span className="inline-flex min-w-0 shrink items-center gap-1">
                        {property.valueShape.type === "optional" && (
                            <FernButton
                                icon={<Cross1Icon />}
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
                className={classNames("flex", {
                    "flex-1 shrink min-w-0": valueShape.type !== "boolean",
                })}
            >
                {children}

                {renderInline && (
                    <span className="inline-flex min-w-0 shrink items-center gap-1">
                        {property.valueShape.type === "optional" && (
                            <FernButton
                                icon={<Cross1Icon />}
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
