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

    const currentVersion = versions.find(({ id }) => id === currentVersionId);

    if (versions.length <= 1) {
        return null;
    }
    return (
        <div className="flex w-32">
            <FernLinkDropdown
                value={currentVersionId}
                options={versions.map(({ id, title, availability, slug }) => ({
                    type: "value",
                    label: title,
                    helperText: availability != null ? getVersionAvailabilityLabel(availability) : undefined,
                    value: id,
                    disabled: availability == null,
                    href: urljoin("/", slug, unversionedSlug),
                }))}
            >
                <FernButton
                    intent="primary"
                    variant="outlined"
                    text={currentVersion?.title ?? currentVersionId}
                    rightIcon={<CaretDownIcon className="transition-transform data-[state=open]:rotate-180" />}
                    disableAutomaticTooltip
                />
            </FernLinkDropdown>
        </div>
    );
};
