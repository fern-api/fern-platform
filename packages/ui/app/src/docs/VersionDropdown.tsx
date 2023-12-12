import { type DocsNode } from "@fern-api/fdr-sdk";
import { getVersionAvailabilityLabel } from "@fern-ui/app-utils";
import classNames from "classnames";
import { Menu, MenuItem } from "./Menu";

export declare namespace VersionDropdown {
    export interface Props {
        versions: DocsNode.Version[];
        selectedVersionName: string | undefined;
        selectedVersionSlug: string | undefined;
        onClickVersion: (versionSlug: string) => void;
    }
}

export const VersionDropdown: React.FC<VersionDropdown.Props> = ({
    versions,
    selectedVersionName,
    selectedVersionSlug,
    onClickVersion,
}) => {
    return (
        <div className="flex w-32">
            <Menu text={selectedVersionName ?? ""}>
                {versions.map(({ info: { id: versionName, slug: versionSlug, availability } }) => (
                    <MenuItem
                        key={versionName}
                        selected={versionSlug === selectedVersionSlug}
                        href={`/${versionSlug}`}
                        onClick={() => onClickVersion(versionSlug)}
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
                                                    versionSlug === selectedVersionSlug && !active,
                                                "bg-tag-default-light dark:bg-tag-default-dark border-transparent":
                                                    versionSlug !== selectedVersionSlug && !active,
                                            },
                                            {
                                                "border-accent-primary/75": active,
                                            }
                                        )}
                                    >
                                        {getVersionAvailabilityLabel(availability)}
                                    </span>
                                )}
                            </>
                        )}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
};
