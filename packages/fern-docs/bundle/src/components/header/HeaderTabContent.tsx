import "server-only";

import { Lock } from "lucide-react";

import type { TabChild } from "@fern-api/fdr-sdk/navigation";

import { FaIconServer } from "@/components/fa-icon-server";

export function HeaderTabContent({ tab }: { tab: TabChild }) {
  return (
    <div className="flex min-w-0 items-center justify-start space-x-2 [&_svg]:size-3.5">
      {tab.type !== "link" && tab.authed ? (
        <Lock />
      ) : (
        tab.icon && <FaIconServer icon={tab.icon} />
      )}
      <span className="truncate font-medium">{tab.title}</span>
    </div>
  );
}
