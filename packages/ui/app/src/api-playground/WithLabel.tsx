import { ResolvedObjectProperty } from "@fern-ui/app-utils";
import classNames from "classnames";
import { FC, PropsWithChildren } from "react";
import { EndpointAvailabilityTag } from "../api-page/endpoints/EndpointAvailabilityTag";
import { renderTypeShorthand } from "../api-page/types/type-shorthand/TypeShorthand";

interface WithLabelProps {
    property?: ResolvedObjectProperty;
    value: unknown;
    expandByDefault?: boolean;
}

export const WithLabel: FC<PropsWithChildren<WithLabelProps>> = ({ property, value, children }) => {
    if (!property) {
        return <>{children}</>;
    }
    return (
        <div className="space-y-2">
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

            {children}
        </div>
    );
};
