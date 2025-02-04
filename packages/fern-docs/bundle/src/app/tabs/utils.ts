import { toHref } from "@/utils/to-href";
import { FernNavigation } from "@fern-api/fdr-sdk";
import "server-only";

export function tabToHref(
  tab: Omit<FernNavigation.TabChild, "child" | "children">
): string {
  if (FernNavigation.hasMetadata(tab)) {
    const pointsTo = FernNavigation.hasPointsTo(tab) ? tab.pointsTo : undefined;
    return toHref(pointsTo ?? tab.slug);
  } else if ("url" in tab && typeof tab.url === "string") {
    return tab.url;
  }
  throw new Error("Invalid tab");
}
