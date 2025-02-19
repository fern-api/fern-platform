import { cn } from "@fern-docs/components";

export function SidebarFixedItemsSection({
  logo,
  versionSelect,
  className,
  showBorder,
}: {
  logo: React.ReactNode;
  versionSelect: React.ReactNode;
  showBorder?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col border-b px-4",
        showBorder ? "border-border-default" : "border-transparent",
        className
      )}
    >
      <div className="fern-sidebar-header">
        <div className="relative flex h-full min-w-fit flex-1 shrink-0 items-center gap-2 py-1">
          <div className="flex items-center gap-2">
            {logo}
            {versionSelect}
          </div>
        </div>
      </div>
    </div>
  );
}
