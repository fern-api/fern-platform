import React, { Fragment, ReactElement } from "react";

import { Separator } from "@radix-ui/react-separator";

export declare namespace TypeDefinitionDetails {
  export interface Props {
    elements: ReactElement<any>[];
    separatorText?: string;
  }
}

export function WithSeparator({
  separatorText,
  children,
}: {
  separatorText?: string;
  children: React.ReactNode;
}) {
  const separator =
    separatorText != null ? (
      <div className="flex h-px items-center gap-2">
        <Separator
          orientation="horizontal"
          className="bg-border-default h-px flex-1"
        />
        <div className="text-(color:--grayscale-a11) shrink text-sm">
          {separatorText}
        </div>
        <Separator
          orientation="horizontal"
          className="bg-border-default h-px flex-1"
        />
      </div>
    ) : (
      <Separator orientation="horizontal" className="bg-border-default h-px" />
    );
  return (
    <>
      {React.Children.toArray(children).map((child, i) => (
        <Fragment key={i}>
          {i !== 0 && separator}
          {child}
        </Fragment>
      ))}
    </>
  );
}
