import { cn } from "@fern-docs/components";

export function TypeComponentSeparator({ className }: { className?: string }) {
  return <div className={cn("bg-border-default h-px", className)} />;
}
