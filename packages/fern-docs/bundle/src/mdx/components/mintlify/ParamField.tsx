import React from "react";

import { Prose } from "../prose";

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
    (
      | { query: string }
      | { path: string }
      | { body: string }
      | { header: string }
    )
> = ({
  type,
  default: defaultProp,
  required,
  deprecated,
  children,
  ...props
}) => {
  const name =
    "query" in props
      ? props.query
      : "path" in props
        ? props.path
        : "body" in props
          ? props.body
          : props.header;
  return (
    <div className="fern-api-property border-border-default border-b">
      <div className="fern-api-property-header">
        <div className="fern-api-property-key">{name}</div>
        <div className="fern-api-property-meta">
          <span>{type}</span>
          {defaultProp && <span>Defaults to {defaultProp}</span>}
          {deprecated && (
            <span className="text-(color:--amber-a11)">Deprecated</span>
          )}
          {required && <span className="text-(color:--red-a11)">Required</span>}
        </div>
      </div>
      {children && <Prose size="sm">{children}</Prose>}
    </div>
  );
};
