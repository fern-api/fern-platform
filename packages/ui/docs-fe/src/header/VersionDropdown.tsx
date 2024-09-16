import { getVersionAvailabilityLabel } from "@fern-platform/fdr-utils";
import { FernButton } from "@fern-ui/components";
import { NavArrowDown } from "iconoir-react";
import { useAtomValue } from "jotai";
import { CURRENT_VERSION_ID_ATOM, VERSIONS_ATOM } from "../atoms";
import { FernLinkDropdown } from "../components/FernLinkDropdown";
import { useToHref } from "../hooks/useHref";

export const VersionDropdown: React.FC = () => {
    const versions = useAtomValue(VERSIONS_ATOM);
    const currentVersionId = useAtomValue(CURRENT_VERSION_ID_ATOM);
    const toHref = useToHref();

    const currentVersion = versions.find(({ id }) => id === currentVersionId);

    if (versions.length <= 1) {
        return null;
    }

    return (
        <div className="flex max-w-32">
            <FernLinkDropdown
                value={currentVersionId}
                options={versions.map(({ id, title, availability, slug, pointsTo }) => ({
                    type: "value",
                    label: title,
                    helperText: availability != null ? getVersionAvailabilityLabel(availability) : undefined,
                    value: id,
                    disabled: availability == null,
                    href: toHref(pointsTo ?? slug),
                }))}
                contentProps={{
                    "data-testid": "version-dropdown-content",
                }}
            >
                <FernButton
                    data-testid="version-dropdown"
                    intent="primary"
                    variant="outlined"
                    text={currentVersion?.title ?? currentVersionId}
                    rightIcon={<NavArrowDown className="transition-transform data-[state=open]:rotate-180" />}
                    disableAutomaticTooltip
                />
            </FernLinkDropdown>
        </div>
    );
};
