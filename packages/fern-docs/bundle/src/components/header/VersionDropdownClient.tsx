"use client";

import { ChevronDown, Lock } from "lucide-react";

import { Availability, AvailabilityBadge, Badge } from "@fern-docs/components";
import { addLeadingSlash } from "@fern-docs/utils";

import { useCurrentVersionId, useCurrentVersionSlug } from "@/state/navigation";

import { FernLinkDropdown } from "../FernLinkDropdown";

export interface VersionDropdownItem {
  versionId: string;
  title: string;
  slug: string;
  defaultSlug?: string;
  icon?: React.ReactNode;
  authed?: boolean;
  default: boolean;
  availability?: Availability;
  hidden?: boolean;
}

export function VersionDropdownClient({
  versions,
}: {
  versions: VersionDropdownItem[];
}) {
  const currentVersionId = useCurrentVersionId();
  const currentVersionSlug = useCurrentVersionSlug();
  const currentVersion =
    versions.find((version) => version.versionId === currentVersionId) ??
    versions.find((version) => version.default);
  return (
    <FernLinkDropdown
      value={currentVersionId}
      options={versions.map(
        ({
          icon,
          versionId,
          title,
          availability,
          slug,
          defaultSlug,
          authed,
          hidden,
        }) => ({
          type: "value",
          label: (
            <div className="flex items-center gap-2">
              {title}
              {availability != null ? (
                <AvailabilityBadge availability={availability} size="sm" />
              ) : null}
            </div>
          ),
          value: versionId,
          disabled: availability == null,
          href: addLeadingSlash(
            pickVersionSlug({
              currentVersionSlug,
              defaultSlug,
              slug,
            })
          ),
          icon: authed ? (
            <Lock className="text-(color:--grayscale-a9) size-4 self-center" />
          ) : (
            icon
          ),
          className: hidden ? "opacity-50" : undefined,
        })
      )}
      contentProps={{
        "data-testid": "version-dropdown-content",
      }}
      side="bottom"
      align="start"
    >
      <Badge
        rounded
        data-testid="version-dropdown"
        variant="outlined-subtle"
        interactive
      >
        {currentVersion?.icon}
        {currentVersion?.title}
        <ChevronDown className="transition-transform data-[state=open]:rotate-180" />
      </Badge>
    </FernLinkDropdown>
  );
}

function pickVersionSlug({
  currentVersionSlug,
  defaultSlug,
  slug,
}: {
  currentVersionSlug?: string;
  defaultSlug?: string;
  slug: string;
}): string {
  if (!defaultSlug) {
    return slug;
  }

  if (currentVersionSlug != null && slug.startsWith(currentVersionSlug)) {
    return slug;
  }

  return defaultSlug;
}
