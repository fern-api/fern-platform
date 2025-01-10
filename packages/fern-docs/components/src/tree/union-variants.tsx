import * as Separator from "@radix-ui/react-separator";
import { Children, Fragment, isValidElement, PropsWithChildren } from "react";

export const UnionVariants = ({ children }: PropsWithChildren) => {
  const childrenArray = Children.toArray(children);
  return (
    <>
      {childrenArray.map((child, index) => (
        <Fragment key={isValidElement(child) ? (child.key ?? index) : index}>
          {index > 0 && (
            <Separator.Root
              orientation="horizontal"
              className="pointer-events-none flex h-px items-center gap-2"
            >
              <Separator.Separator className="h-px flex-1 bg-[var(--grayscale-a6)]" />
              <span className="text-sm uppercase text-[var(--grayscale-a9)]">
                {"or"}
              </span>
              <Separator.Separator className="h-px flex-1 bg-[var(--grayscale-a6)]" />
            </Separator.Root>
          )}
          <div className="px-4 py-2">{child}</div>
        </Fragment>
      ))}
    </>
  );
};

UnionVariants.displayName = "UnionVariants";
