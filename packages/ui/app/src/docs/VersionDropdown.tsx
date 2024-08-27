import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernButton } from "@fern-ui/components";
import { getVersionAvailabilityLabel } from "@fern-ui/fdr-utils";
import { NavArrowDown } from "iconoir-react";
import { useAtomValue } from "jotai";
import { CURRENT_VERSION_ID_ATOM, UNVERSIONED_SLUG_ATOM, VERSIONS_ATOM } from "../atoms";
import { FernLinkDropdown } from "../components/FernLinkDropdown";
import { useToHref } from "../hooks/useHref";

export declare namespace VersionDropdown {
    export interface Props {}
}

export const VersionDropdown: React.FC<VersionDropdown.Props> = () => {
    const versions = useAtomValue(VERSIONS_ATOM);
    const currentVersionId = useAtomValue(CURRENT_VERSION_ID_ATOM);
    const unversionedSlug = useAtomValue(UNVERSIONED_SLUG_ATOM);
    const toHref = useToHref();

    const currentVersion = versions.find(({ id }) => id === currentVersionId);

    if (versions.length <= 1) {
        return null;
    }
    return (
        <div className="flex max-w-32">
            <FernLinkDropdown
                value={currentVersionId}
                options={versions.map(({ id, title, availability, slug }) => ({
                    type: "value",
                    label: title,
                    helperText: availability != null ? getVersionAvailabilityLabel(availability) : undefined,
                    value: id,
                    disabled: availability == null,
                    href: toHref(FernNavigation.utils.slugjoin(slug, unversionedSlug)),
                }))}
            >
                <FernButton
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
