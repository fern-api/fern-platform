import { cn } from "@fern-docs/components";

export function Prose({
  children,
  className,
  size,
  pre,
}: {
  children: React.ReactNode;
  className?: string;
  size?: "xs" | "sm" | "lg";
  pre?: boolean;
}) {
  return (
    <div
      className={cn(
        "prose dark:prose-invert max-w-none break-words",
        {
          "whitespace-pre-wrap": typeof children === "string" || pre,
          "prose-base": size == null,
          "prose-sm dark:prose-invert-sm !text-xs": size === "xs",
          "prose-sm dark:prose-invert-sm": size === "sm",
          "prose-lg": size === "lg",
        },
        className
      )}
    >
      {children}
    </div>
  );
}
