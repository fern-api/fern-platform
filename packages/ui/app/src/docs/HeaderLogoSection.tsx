import { DocsV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import Link from "next/link";
import { FernImage } from "../components/FernImage";
import { DEFAULT_LOGO_HEIGHT } from "../config";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { SidebarVersionInfo } from "../sidebar/types";
import { VersionDropdown } from "./VersionDropdown";

export interface HeaderLogoSectionProps {
    logo: DocsV1Read.FileId | undefined;
    logoV2: DocsV1Read.LogoV2 | undefined;
    logoHeight: DocsV1Read.Height | undefined;
    logoHref: DocsV1Read.Url | undefined;

    // currentTabIndex: number | undefined;
    // tabs: SidebarTab[];
    currentVersionIndex: number | undefined;
    versions: SidebarVersionInfo[];
}

export const HeaderLogoSection: React.FC<HeaderLogoSectionProps> = ({
    logo,
    logoV2,
    logoHeight,
    logoHref,
    // currentTabIndex,
    // tabs,
    currentVersionIndex,
    versions,
}) => {
    const { resolveFile } = useDocsContext();
    const logoImageHeight = logoHeight ?? DEFAULT_LOGO_HEIGHT;

    const imageClassName = "max-h-full object-contain";

    const renderLogoContent = () => {
        if (logoV2 == null) {
            if (logo != null) {
                return (
                    <FernImage
                        src={resolveFile(logo)}
                        className={imageClassName}
                        height={logoImageHeight}
                        style={{ height: logoImageHeight }}
                        priority={true}
                        loading="eager"
                        quality={100}
                    />
                );
            }
            return null;
        } else {
            return (
                <>
                    {logoV2["light"] != null && (
                        <FernImage
                            src={resolveFile(logoV2["light"])}
                            className={classNames(imageClassName, "block dark:hidden")}
                            height={logoImageHeight}
                            style={{ height: logoImageHeight }}
                            priority={true}
                            loading="eager"
                            quality={100}
                        />
                    )}
                    {logoV2["dark"] != null && (
                        <FernImage
                            src={resolveFile(logoV2["dark"])}
                            className={classNames(imageClassName, "hidden dark:block")}
                            height={logoImageHeight}
                            style={{ height: logoImageHeight }}
                            priority={true}
                            loading="eager"
                            quality={100}
                        />
                    )}
                </>
            );
        }
    };

    return (
        <div className="relative flex h-full min-w-fit flex-1 shrink-0 items-center space-x-2 py-1">
            <div className="flex items-center pr-4">
                {logoHref != null ? (
                    <Link href={logoHref} className="flex shrink-0 items-center">
                        {renderLogoContent()}
                    </Link>
                ) : (
                    <div className="flex shrink-0 items-center">{renderLogoContent()}</div>
                )}
                {/* {tabs.length > 1 && (
                <div style={{ marginBottom: -1 * logoImageHeight * 0.125 }}>
                    <span
                        className="t-accent tracking-tight"
                        style={{
                            fontSize: logoImageHeight,
                            lineHeight: `${logoImageHeight * 0.875}px`,
                            fontFamily: "var(--typography-heading-font-family)",
                        }}
                    >
                        {tabs[currentTabIndex ?? 0]?.title}
                    </span>
                </div>
            )} */}
                {versions.length > 1 && (
                    <div>
                        <VersionDropdown currentVersionIndex={currentVersionIndex} versions={versions} />
                    </div>
                )}
            </div>
        </div>
    );
};
