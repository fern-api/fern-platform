import { FC, PropsWithChildren } from "react";

import { cn } from "@fern-docs/components";

export declare namespace Frame {
  export interface Props {
    caption?: string;
    background?: "default" | "subtle";
  }
}

export const Frame: FC<PropsWithChildren<Frame.Props>> = ({
  caption,
  background = "default",
  children,
}) => {
  return (
    <figure
      className={cn(
        "not-prose fern-card rounded-3 relative mb-6 mt-4 overflow-hidden p-2 first:mt-0",
        {
          "bg-(color:--grayscale-a2)": background === "subtle",
        }
      )}
    >
      <div className="rounded-1 relative flex justify-center overflow-hidden shadow-sm">
        {children}
      </div>
      {caption && (
        <figcaption className="text-(color:--grayscale-a11) relative mt-3 flex justify-center px-8 pb-2 pt-0 text-sm">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
