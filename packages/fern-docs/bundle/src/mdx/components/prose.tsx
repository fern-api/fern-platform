import { cn } from "@fern-docs/components";

export function Prose({
  children,
  className,
  size = "base",
  pre,
}: {
  children: React.ReactNode;
  className?: string;
  size?: "xs" | "sm" | "base" | "lg";
  pre?: boolean;
}) {
  if (!children) {
    return null;
  }

  return (
    <div
      className={cn(
        "prose max-w-none break-words",
        {
          "whitespace-pre-wrap": typeof children === "string" || pre,
          "text-xs": size === "xs",
          "text-sm": size === "sm",
          "text-lg": size === "lg",
        },
        className
      )}
    >
      {children}
    </div>
  );
}
