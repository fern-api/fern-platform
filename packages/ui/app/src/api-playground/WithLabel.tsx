import { Cross1Icon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { FC, PropsWithChildren } from "react";
import { EndpointAvailabilityTag } from "../api-page/endpoints/EndpointAvailabilityTag";
import { renderTypeShorthand } from "../api-page/types/type-shorthand/TypeShorthand";
import { FernButton } from "../components/FernButton";
import { ResolvedObjectProperty } from "../util/resolver";

interface WithLabelProps {
    htmlFor?: string;
    property?: ResolvedObjectProperty;
    value: unknown;
    onRemove: () => void;
}

export const WithLabel: FC<PropsWithChildren<WithLabelProps>> = ({ htmlFor, property, value, onRemove, children }) => {
    if (!property) {
        return <>{children}</>;
    }
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <label className="inline-flex w-full items-baseline gap-2" htmlFor={htmlFor}>
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

                <span className="inline-flex items-center gap-1">
                    <span className="whitespace-nowrap text-xs">
                        {property.valueShape.type !== "optional" && <span className="t-danger">required </span>}
                        <span className="t-muted">{renderTypeShorthand(property.valueShape)}</span>
                    </span>

                    {property.valueShape.type === "optional" && (
                        <FernButton
                            icon={<Cross1Icon />}
                            size="small"
                            variant="minimal"
                            className="-mr-1"
                            onClick={onRemove}
                        />
                    )}
                </span>
            </div>

            {children}
        </div>
    );
};
