import { DocsV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import { useTheme } from "next-themes";
import Link from "next/link";
import { FernImage } from "../components/FernImage";
import { DEFAULT_LOGO_HEIGHT } from "../config";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useNavigationContext } from "../navigation-context";
import { useDocsSelectors } from "../selectors/useDocsSelectors";
import { VersionDropdown } from "./VersionDropdown";

export interface HeaderLogoSectionProps {
    config: DocsV1Read.DocsConfig;
}

export const HeaderLogoSection: React.FC<HeaderLogoSectionProps> = ({
    config: { logo, logoV2, logoHeight, logoHref },
}) => {
    const { resolvedTheme: theme } = useTheme();
    const { resolveFile } = useDocsContext();
    const { activeNavigatable } = useNavigationContext();
    const { activeVersionContext } = useDocsSelectors();
    const logoImageHeight = logoHeight ?? DEFAULT_LOGO_HEIGHT;

    const definitionInfo = activeNavigatable?.context.root.info;
    const hasMultipleVersions = definitionInfo?.type === "versioned";
    const activeVersionId =
        activeVersionContext.type === "versioned" ? activeVersionContext.version.info.id : undefined;
    const activeVersionSlug =
        activeVersionContext.type === "versioned" ? activeVersionContext.version.info.slug : undefined;

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
                            priority={theme === "light"}
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
                            priority={theme === "dark"}
                            loading="eager"
                            quality={100}
                        />
                    )}
                </>
            );
        }
    };

    return (
        <div className="relative flex h-full flex-1 shrink-0 items-center space-x-3 py-1">
            {logoHref != null ? (
                <Link href={logoHref} className="flex items-center">
                    {renderLogoContent()}
                </Link>
            ) : (
                <div className="flex items-center">{renderLogoContent()}</div>
            )}
            {hasMultipleVersions && (
                <div>
                    <VersionDropdown
                        versions={definitionInfo.versions}
                        selectedVersionName={activeVersionId}
                        selectedVersionSlug={activeVersionSlug}
                    />
                </div>
            )}
        </div>
    );
};
