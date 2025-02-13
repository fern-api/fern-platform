import { ReactElement } from "react";

import clsx from "clsx";
import { Lock } from "iconoir-react";

import { TabChild, hasPointsTo } from "@fern-api/fdr-sdk/navigation";
import { FaIcon } from "@fern-docs/components";
import { addLeadingSlash } from "@fern-docs/utils";

import { useCurrentTab, useTabs } from "@/state/navigation";

import { FernLink } from "../components/FernLink";

export function HeaderTabs() {
  const tabs = useTabs();
  if (tabs.length <= 1) {
    return null;
  }
  return (
    <ul className="fern-header-tabs-list">
      {tabs.map((tab) => (
        <HeaderTab key={tab.id} tab={tab} />
      ))}
    </ul>
  );
}

export function HeaderTab({ tab }: { tab: TabChild }): ReactElement<any> {
  const currentTab = useCurrentTab();
  return (
    <li className="fern-header-tabs-list-item">
      <FernLink
        className={clsx("fern-header-tab-button", {
          "opacity-50": tab.type !== "link" && tab.hidden,
        })}
        href={
          tab.type === "link"
            ? tab.url
            : addLeadingSlash(
                (hasPointsTo(tab) ? tab.pointsTo : undefined) ?? tab.slug
              )
        }
        data-state={currentTab?.id === tab.id ? "active" : "inactive"}
      >
        <div className="flex min-w-0 items-center justify-start space-x-2">
          {tab.type !== "link" && tab.authed ? (
            <Lock className="size-3.5" />
          ) : (
            tab.icon && <FaIcon icon={tab.icon} className="size-3.5" />
          )}
          <span className="truncate font-medium">{tab.title}</span>
        </div>
      </FernLink>
    </li>
  );
}
