import { cn, Empty } from "@fern-docs/components";
import { ComponentPropsWithoutRef, forwardRef, ReactElement } from "react";

export const EnumDefinitionDetails = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div"> & {
    children: ReactElement<{ name: string; description?: string }>[];
    searchInput?: string;
  }
>(({ children, searchInput = "", ...props }, ref) => {
  const filteredChildren = children.filter(
    (element) =>
      element.props.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      element.props?.description
        ?.toLowerCase()
        .includes(searchInput.toLowerCase())
  );

  // use 140px to decapitate overflowing enum values and indicate scrollability
  return (
    <div
      {...props}
      className={cn("max-h-[140px] overflow-y-auto", props.className)}
      ref={ref}
    >
      {filteredChildren.length > 0 ? (
        <div className="flex flex-wrap gap-2">{filteredChildren}</div>
      ) : (
        <Empty name="No results" description="No enum values found" />
      )}
    </div>
  );
});

EnumDefinitionDetails.displayName = "EnumDefinitionDetails";
