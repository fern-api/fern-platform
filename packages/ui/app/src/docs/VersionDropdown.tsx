import { getVersionAvailabilityLabel, SidebarVersionInfo } from "@fern-ui/fdr-utils";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { FernButton } from "../components/FernButton";
import { FernDropdown } from "../components/FernDropdown";

export declare namespace VersionDropdown {
    export interface Props {
        currentVersionIndex: number | null | undefined;
        versions: SidebarVersionInfo[];
    }
}

export const VersionDropdown: React.FC<VersionDropdown.Props> = ({ currentVersionIndex, versions }) => {
    if (versions.length <= 1) {
        return null;
    }
    const currentVersion = versions[currentVersionIndex ?? 0];
    return (
        <div className="flex w-32">
            <FernDropdown
                value={currentVersion?.id}
                options={versions.map(({ id: versionName, availability, slug }) => ({
                    type: "value",
                    label: versionName,
                    helperText: availability != null ? getVersionAvailabilityLabel(availability) : undefined,
                    value: versionName,
                    disabled: availability == null,
                    href: "/" + slug.join("/"),
                }))}
            >
                <FernButton
                    intent="primary"
                    variant="outlined"
                    text={currentVersion?.id}
                    rightIcon={<CaretDownIcon className="transition-transform data-[state=open]:rotate-180" />}
                    disableAutomaticTooltip
                />
            </FernDropdown>
        </div>
    );
};
