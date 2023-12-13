import { useRouter } from "next/router";
import { DEFAULT_LOGO_HEIGHT } from "../config";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useNavigationContext } from "../navigation-context";
import { useDocsSelectors } from "../selectors/useDocsSelectors";
import { VersionDropdown } from "./VersionDropdown";

export declare namespace HeaderLogoSection {}

export const HeaderLogoSection: React.FC = () => {
    const router = useRouter();
    const { navigateToPath } = useNavigationContext();
    const { resolveFile, docsDefinition, theme } = useDocsContext();
    const { definitionInfo, activeVersionContext } = useDocsSelectors();
    const { logo, logoV2, logoHeight, logoHref } = docsDefinition.config;

    // const [mounted, setMounted] = useState(false);

    // useEffect(() => {
    //     setMounted(true);
    // }, []);

    // if (!mounted || theme == null) {
    //     return null;
    // }

    const logoForTheme = logoV2 != null ? logoV2[theme ?? "light"] : logo;
    const hasMultipleVersions = definitionInfo.type === "versioned";
    const activeVersionId =
        activeVersionContext.type === "versioned" ? activeVersionContext.version.info.id : undefined;
    const activeVersionSlug =
        activeVersionContext.type === "versioned" ? activeVersionContext.version.info.slug : undefined;
    const hasLogo = logoForTheme != null;
    const hasLogoHref = logoHref != null;

    const logoContent = hasLogo ? (
        <img
            src={resolveFile(logoForTheme)}
            className="max-h-full object-contain"
            style={{
                height: logoHeight ?? DEFAULT_LOGO_HEIGHT,
            }}
        />
    ) : null;

    return (
        <div className="relative flex h-full shrink-0 items-center space-x-3 py-1">
            {hasLogoHref ? (
                <a href={logoHref} className="flex items-center">
                    {logoContent}
                </a>
            ) : (
                <div className="flex items-center">{logoContent}</div>
            )}
            {hasMultipleVersions && (
                <div>
                    <VersionDropdown
                        versions={definitionInfo.versions}
                        selectedVersionName={activeVersionId}
                        selectedVersionSlug={activeVersionSlug}
                        onClickVersion={(versionSlug) => {
                            navigateToPath(versionSlug);
                            void router.replace(`/${versionSlug}`, undefined, { shallow: true });
                        }}
                    />
                </div>
            )}
        </div>
    );
};
