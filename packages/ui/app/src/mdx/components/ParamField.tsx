import React from "react";

export const ParamField: React.FC<
    React.PropsWithChildren<{
        type: string;
        default?: string;
        required?: boolean;
        deprecated?: boolean;
        /** @deprecated unused Mintlify prop */
        initialValue?: any;
        /** @deprecated unused Mintlify prop */
        placeholder?: string;
    }> &
        ({ query: string } | { path: string } | { body: string } | { header: string })
> = ({ type, default: defaultProp, required, deprecated, children, ...props }) => {
    const name =
        "query" in props ? props.query : "path" in props ? props.path : "body" in props ? props.body : props.header;
    return (
        <div className="py-3 space-y-2">
            <div className="flex items-baseline gap-2">
                <div className="fern-api-property-key">{name}</div>
                <div className="text-inherit inline-flex items-baseline gap-2 text-xs">
                    <span>{type}</span>
                    {defaultProp && <span>Defaults to {defaultProp}</span>}
                    {deprecated && <span className="t-warning">Deprecated</span>}
                    {required && <span className="t-danger">Required</span>}
                </div>
            </div>
            {children && <div className="prose-sm dark:prose-invert-sm">{children}</div>}
        </div>
    );
};
