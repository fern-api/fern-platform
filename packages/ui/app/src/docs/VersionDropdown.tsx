import { type DocsNode } from "@fern-api/fdr-sdk";
import { getVersionAvailabilityLabel } from "@fern-ui/app-utils";
import classNames from "classnames";
import { FernMenu, FernMenuItem } from "../components/FernMenu";
import { useNavigationContext } from "../navigation-context";

export declare namespace VersionDropdown {
    export interface Props {
        versions: DocsNode.Version[];
        selectedVersionName: string | undefined;
        selectedVersionSlug: string | undefined;
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
}) => {
    const { basePath } = useNavigationContext();
    return (
        <div className="flex w-32">
            <FernMenu text={selectedVersionName ?? ""}>
                {versions.map(({ info: { id: versionName, availability, slug } }) => (
                    <FernMenuItem
                        key={versionName}
                        selected={slug === selectedVersionSlug}
                        href={createSlugHref(basePath, slug)}
                    >
                        {(active) => (
                            <>
                                <span className="font-mono text-sm font-normal">{versionName}</span>
                                {availability != null && (
                                    <span
                                        className={classNames(
                                            "rounded px-1 py-0.5 text-[11px] font-normal border",
                                            {
                                                "bg-accent-highlight border-transparent":
                                                    slug === selectedVersionSlug && !active,
                                                "bg-tag-default border-transparent":
                                                    slug !== selectedVersionSlug && !active,
                                            },
                                            {
                                                "border-accent-primary-light/75 dark:border-accent-primary-dark/75":
                                                    active,
                                            },
                                        )}
                                    >
                                        {getVersionAvailabilityLabel(availability)}
                                    </span>
                                )}
                            </>
                        )}
                    </FernMenuItem>
                ))}
            </FernMenu>
        </div>
    );
};
