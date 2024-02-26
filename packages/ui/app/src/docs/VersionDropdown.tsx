import { DocsV1Read, type DocsNode } from "@fern-api/fdr-sdk";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { EndpointAvailabilityTag } from "../api-page/endpoints/EndpointAvailabilityTag";
import { FernButton } from "../components/FernButton";
import { FernDropdown } from "../components/FernDropdown";
import { useNavigationContext } from "../navigation-context";
import { getVersionAvailabilityLabel } from "../util/fern";

export declare namespace VersionDropdown {
    export interface Props {
        versions: DocsNode.Version[];
        selectedVersionName: string | undefined;
        selectedVersionSlug: string | undefined;
        selectedVersionAvailability: DocsV1Read.VersionAvailability | null | undefined;
    }
}

// TODO: move this into utils, or standardize this upstream
function createSlugHref(basePath: string | undefined, slug: string) {
    return basePath != null && basePath.trim().length > 1 ? `${basePath.trim()}/${slug}` : `/${slug}`;
}

export const VersionDropdown: React.FC<VersionDropdown.Props> = ({
    versions,
    selectedVersionName,
    selectedVersionSlug,
    selectedVersionAvailability,
}) => {
    const { basePath } = useNavigationContext();
    return (
        <div className="flex w-32">
            <FernDropdown
                value={selectedVersionSlug}
                options={versions.map(({ info: { id: versionName, availability, slug } }) => ({
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
                        selectedVersionAvailability != null &&
                        selectedVersionAvailability !== "Stable" &&
                        selectedVersionAvailability !== "GenerallyAvailable" ? (
                            <span className="inline-flex items-center gap-2">
                                {selectedVersionName}
                                <EndpointAvailabilityTag availability={selectedVersionAvailability} />
                            </span>
                        ) : (
                            selectedVersionName
                        )
                    }
                    rightIcon={<CaretDownIcon className="transition-transform data-[state=open]:rotate-180" />}
                />
            </FernDropdown>
        </div>
    );
};
