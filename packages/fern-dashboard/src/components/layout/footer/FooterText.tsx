import React from "react";

import { cn } from "@/lib/cn";

export declare namespace FooterText {
  export interface Props {
    hoverable?: boolean;
    className?: string;
    children: React.JSX.Element | string;
  }
}

export const FooterText = ({
  hoverable = false,
  className,
  children,
}: FooterText.Props) => {
  return (
    <div
      className={cn(className, "text-sm text-gray-900", {
        "hover:text-gray-1100": hoverable,
      })}
    >
      {children}
    </div>
  );
};
