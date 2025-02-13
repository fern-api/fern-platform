import { Lock, NavArrowDown } from "iconoir-react";

import { FernButton } from "@fern-docs/components";
import { addLeadingSlash } from "@fern-docs/utils";
import { getVersionAvailabilityLabel } from "@fern-platform/fdr-utils";

import { useCurrentVersion, useVersions } from "@/state/navigation";

import { FernLinkDropdown } from "../components/FernLinkDropdown";

export declare namespace VersionDropdown {
  export interface Props {}
}

export const VersionDropdown: React.FC<VersionDropdown.Props> = () => {
  const versions = useVersions();
  const currentVersion = useCurrentVersion();

  if (versions.length <= 1) {
    return null;
  }

  return (
    <div className="flex max-w-32">
      <FernLinkDropdown
        value={currentVersion?.versionId}
        options={versions.map(
          ({
            versionId,
            title,
            availability,
            slug,
            pointsTo,
            hidden,
            authed,
          }) => ({
            type: "value",
            label: title,
            helperText:
              availability != null
                ? getVersionAvailabilityLabel(availability)
                : undefined,
            value: versionId,
            disabled: availability == null,
            href: addLeadingSlash(pointsTo ?? slug),
            icon: authed ? (
              <Lock className="text-faded size-4 self-center" />
            ) : undefined,
            className: hidden ? "opacity-50" : undefined,
          })
        )}
        contentProps={{
          "data-testid": "version-dropdown-content",
        }}
      >
        <FernButton
          data-testid="version-dropdown"
          intent="primary"
          variant="outlined"
          text={currentVersion?.title ?? currentVersion?.versionId}
          rightIcon={
            <NavArrowDown className="transition-transform data-[state=open]:rotate-180" />
          }
          disableAutomaticTooltip
        />
      </FernLinkDropdown>
    </div>
  );
};
