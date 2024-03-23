import { DocsV1Read } from "@fern-api/fdr-sdk";
import { SidebarVersionInfo } from "@fern-ui/fdr-utils";
import cn from "clsx";
import Link from "next/link";
import { FernImage } from "../components/FernImage";
import { DEFAULT_LOGO_HEIGHT } from "../config";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { VersionDropdown } from "./VersionDropdown";

export interface HeaderLogoSectionProps {
    logoHeight: DocsV1Read.Height | undefined;
    logoHref: DocsV1Read.Url | undefined;

    // currentTabIndex: number | undefined;
    // tabs: SidebarTab[];
    currentVersionIndex: number | undefined;
    versions: SidebarVersionInfo[];
}

export const HeaderLogoSection: React.FC<HeaderLogoSectionProps> = ({
    logoHeight,
    logoHref,
    // currentTabIndex,
    // tabs,
    currentVersionIndex,
    versions,
}) => {
    const { colors, resolveFile } = useDocsContext();
    const logoImageHeight = logoHeight ?? DEFAULT_LOGO_HEIGHT;

    const imageClassName = "max-h-full object-contain";

    const renderLogoContent = () => {
        if (colors == null) {
            return null;
        }

        if (colors.dark != null && colors.light != null) {
            return (
                <>
                    {colors.light.logo != null && (
                        <FernImage
                            src={resolveFile(colors.light.logo)}
                            className={cn(imageClassName, "block dark:hidden")}
                            height={logoImageHeight}
                            style={{ height: logoImageHeight }}
                            priority={true}
                            loading="eager"
                            quality={100}
                        />
                    )}
                    {colors.dark.logo != null && (
                        <FernImage
                            src={resolveFile(colors.dark.logo)}
                            className={cn(imageClassName, "hidden dark:block")}
                            height={logoImageHeight}
                            style={{ height: logoImageHeight }}
                            priority={true}
                            loading="eager"
                            quality={100}
                        />
                    )}
                </>
            );
        } else {
            const logoFile = colors.light?.logo ?? colors.dark?.logo;

            if (logoFile == null) {
                return null;
            }

            return (
                <FernImage
                    src={resolveFile(logoFile)}
                    className={cn(imageClassName, "block")}
                    height={logoImageHeight}
                    style={{ height: logoImageHeight }}
                    priority={true}
                    loading="eager"
                    quality={100}
                />
            );
        }
    };

    return (
        <div className="relative flex h-full min-w-fit flex-1 shrink-0 items-center gap-2 py-1">
            <div className="flex items-center gap-2 pr-4">
                {logoHref != null ? (
                    <Link href={logoHref} className="fern-logo-container">
                        {renderLogoContent()}
                    </Link>
                ) : (
                    <div className="fern-logo-container">{renderLogoContent()}</div>
                )}
                {versions.length > 1 && (
                    <div>
                        <VersionDropdown currentVersionIndex={currentVersionIndex} versions={versions} />
                    </div>
                )}
            </div>
        </div>
    );
};
