import { ReactElement } from "react";
import React from "react";

export function HeaderLogoSection({
  logo,
  versionSelect,
}: {
  logo: React.ReactNode;
  versionSelect: React.ReactNode;
}): ReactElement<any> {
  return (
    <div className="relative flex h-full min-w-fit flex-1 shrink-0 items-center gap-2 py-1">
      <div className="flex items-center gap-2">
        {logo}
        {/* {logoText != null && logoText.length > 0 && (
          <span className="font-heading text-accent ml-1 text-[1.5rem] font-light lowercase">
            {logoText}
          </span>
        )} */}
        {versionSelect}
      </div>
    </div>
  );
}
