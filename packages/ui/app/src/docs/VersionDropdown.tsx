import { FernButton } from "@fern-ui/components";
import { getVersionAvailabilityLabel } from "@fern-ui/fdr-utils";
import { CaretDownIcon } from "@radix-ui/react-icons";
import urljoin from "url-join";
import { FernLinkDropdown } from "../components/FernLinkDropdown";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useNavigationContext } from "../contexts/navigation-context";

export declare namespace VersionDropdown {
    export interface Props {}
}

export const VersionDropdown: React.FC<VersionDropdown.Props> = () => {
    const { versions, currentVersionId } = useDocsContext();
    const { unversionedSlug } = useNavigationContext();

    if (versions.length <= 1) {
        return null;
    }
    return (
        <div className="flex w-32">
            <FernLinkDropdown
                value={currentVersionId}
                options={versions.map(({ id: versionName, availability, slug }) => ({
                    type: "value",
                    label: versionName,
                    helperText: availability != null ? getVersionAvailabilityLabel(availability) : undefined,
                    value: versionName,
                    disabled: availability == null,
                    href: urljoin("/", slug, unversionedSlug),
                }))}
            >
                <FernButton
                    intent="primary"
                    variant="outlined"
                    text={currentVersionId}
                    rightIcon={<CaretDownIcon className="transition-transform data-[state=open]:rotate-180" />}
                    disableAutomaticTooltip
                />
            </FernLinkDropdown>
        </div>
    );
};
