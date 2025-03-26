import { DocsSiteNavBarItem } from "./DocsSiteNavBarItem";

export function DocsSiteNavBar() {
  return (
    <div className="flex">
      <DocsSiteNavBarItem title="Overview" href="/" />
      <DocsSiteNavBarItem title="Analytics" href="/analytics" />
      <DocsSiteNavBarItem title="AI Search" href="/ai-search" />
      <DocsSiteNavBarItem title="Settings" href="/settings" />
    </div>
  );
}
