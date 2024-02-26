import { VersionInfo } from "@fern-api/fdr-sdk";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { EndpointAvailabilityTag } from "../api-page/endpoints/EndpointAvailabilityTag";
import { FernButton } from "../components/FernButton";
import { FernDropdown } from "../components/FernDropdown";
import { useNavigationContext } from "../navigation-context";
import { getVersionAvailabilityLabel } from "../util/fern";

export declare namespace VersionDropdown {
    export interface Props {
        currentVersionIndex: number | null | undefined;
        versions: VersionInfo[];
    }
}

// TODO: move this into utils, or standardize this upstream
function createSlugHref(basePath: string | undefined, slug: string) {
    return basePath != null && basePath.trim().length > 1 ? `${basePath.trim()}/${slug}` : `/${slug}`;
}

export const VersionDropdown: React.FC<VersionDropdown.Props> = ({ currentVersionIndex, versions }) => {
    const { basePath } = useNavigationContext();
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
                    value: slug,
                    disabled: availability == null,
                    href: createSlugHref(basePath, slug),
                }))}
            >
                <FernButton
                    intent="primary"
                    variant="outlined"
                    text={
                        currentVersion?.availability != null &&
                        currentVersion.availability !== "Stable" &&
                        currentVersion.availability !== "GenerallyAvailable" &&
                        !currentVersion.id.toLowerCase().includes(currentVersion.availability.toLowerCase()) ? (
                            <span className="inline-flex items-center gap-2">
                                {currentVersion.id}
                                <EndpointAvailabilityTag availability={currentVersion.availability} />
                            </span>
                        ) : (
                            currentVersion?.id
                        )
                    }
                    rightIcon={<CaretDownIcon className="transition-transform data-[state=open]:rotate-180" />}
                />
            </FernDropdown>
        </div>
    );
};
