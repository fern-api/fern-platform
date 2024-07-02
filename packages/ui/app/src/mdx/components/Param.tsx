import { FernTag } from "@fern-ui/components";
import React from "react";

export const Param: React.FC<React.PropsWithChildren<{
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  deprecated?: boolean;
}>> = ({ name, type, default: defaultProp, required, deprecated, children }) => {
  return (
    <div className="pt-2.5 pb-5 my-2.5 border-default border-b">
      <div className="flex py-0.5 mr-5 gap-2 items-center">
        <div className="font-bold text-sm font-mono t-accent">{name}</div>
        <FernTag size="sm" variant="subtle">{type}</FernTag>
        {defaultProp && <FernTag size="sm" variant="subtle">default: &quot;{defaultProp}&quot;</FernTag>}
        {deprecated && <FernTag colorScheme="amber" size="sm" variant="subtle">deprecated</FernTag>}
        {required && <FernTag colorScheme="red" size="sm" variant="subtle">required</FernTag>}
      </div>
      {children && <div className="mt-4 prose dark:prose-invert">{children}</div>}
    </div>
  );
};