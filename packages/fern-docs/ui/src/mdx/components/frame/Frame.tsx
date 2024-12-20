import clsx from "clsx";
import { FC, PropsWithChildren } from "react";

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
      className={clsx(
        "not-prose fern-card relative mb-6 mt-4 overflow-hidden rounded-xl p-2 first:mt-0",
        {
          "bg-tag-default-soft": background === "subtle",
        }
      )}
    >
      <div className="relative flex justify-center overflow-hidden rounded-lg shadow-sm">
        {children}
      </div>
      {caption && (
        <figcaption className="t-muted relative mt-3 flex justify-center px-8 pb-2 pt-0 text-sm">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
