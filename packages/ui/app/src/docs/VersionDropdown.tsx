import { FernButton } from "@fern-ui/components";
import { SidebarVersionInfo, getVersionAvailabilityLabel } from "@fern-ui/fdr-utils";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { FernLinkDropdown } from "../components/FernLinkDropdown";
import { useNavigationContext } from "../contexts/navigation-context";

export declare namespace VersionDropdown {
    export interface Props {
        currentVersionIndex: number | null | undefined;
        versions: SidebarVersionInfo[];
    }
}

export const VersionDropdown: React.FC<VersionDropdown.Props> = ({ currentVersionIndex, versions }) => {
    const { unversionedSlug } = useNavigationContext();

    if (versions.length <= 1) {
        return null;
    }
    const currentVersion = versions[currentVersionIndex ?? 0];
    return (
        <div className="flex w-32">
            <FernLinkDropdown
                value={currentVersion?.id}
                options={versions.map(({ id: versionName, availability, slug }) => ({
                    type: "value",
                    label: versionName,
                    helperText: availability != null ? getVersionAvailabilityLabel(availability) : undefined,
                    value: versionName,
                    disabled: availability == null,
                    href: `${slug.length > 0 ? `/${slug.join("/")}` : ""}${unversionedSlug.length > 0 ? `/${unversionedSlug.join("/")}` : ""}`,
                }))}
            >
                <FernButton
                    intent="primary"
                    variant="outlined"
                    text={currentVersion?.id}
                    rightIcon={<CaretDownIcon className="transition-transform data-[state=open]:rotate-180" />}
                    disableAutomaticTooltip
                />
            </FernLinkDropdown>
        </div>
    );
};
