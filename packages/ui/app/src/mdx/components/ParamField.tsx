import { FernTag, FernTagProps } from "@fern-ui/components";
import React from "react";

const TAG_PROPS: FernTagProps = {
    size: "sm",
    variant: "subtle",
};

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
        <div className="pt-2.5 pb-5 my-2.5 border-default border-b">
            <div className="flex py-0.5 mr-5 gap-2 items-center">
                <div className="font-bold text-sm font-mono t-accent">{name}</div>
                <FernTag {...TAG_PROPS}>{type}</FernTag>
                {defaultProp && <FernTag {...TAG_PROPS}>default: &quot;{defaultProp}&quot;</FernTag>}
                {deprecated && (
                    <FernTag colorScheme="amber" {...TAG_PROPS}>
                        deprecated
                    </FernTag>
                )}
                {required && (
                    <FernTag colorScheme="red" {...TAG_PROPS}>
                        required
                    </FernTag>
                )}
            </div>
            {children && <div className="mt-4 prose dark:prose-invert">{children}</div>}
        </div>
    );
};
