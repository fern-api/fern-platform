import { cn } from "@/utils/utils";

function Skeleton({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "dark:bg-gray-1100 animate-pulse rounded-md bg-gray-400",
        className
      )}
      {...props}
    >
      <div className="invisible">{children}</div>
    </div>
  );
}

export { Skeleton };
