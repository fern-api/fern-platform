import cn from "clsx";
import { useAtomValue } from "jotai";
import { PropsWithChildren, ReactElement } from "react";
import { LOGO_TEXT_ATOM } from "../atoms/logo";
import { VERSIONS_ATOM } from "../atoms/navigation";
import { FernImage } from "../components/FernImage";
import { FernLink } from "../components/FernLink";
import { DEFAULT_LOGO_HEIGHT } from "../config";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { VersionDropdown } from "./VersionDropdown";

export function HeaderLogoSection(): ReactElement {
    const { logoHref } = useDocsContext();
    const versions = useAtomValue(VERSIONS_ATOM);
    const logoText = useAtomValue(LOGO_TEXT_ATOM);

    return (
        <div className="relative flex h-full min-w-fit flex-1 shrink-0 items-center gap-2 py-1">
            <div className="flex items-center gap-2 pr-4">
                <FernLogoContainer href={logoHref}>
                    <FernLogoImage />
                    {logoText != null && logoText.length > 0 && (
                        <span className="text-[1.5rem] lowercase font-heading ml-1 font-light text-accent">
                            {logoText}
                        </span>
                    )}
                </FernLogoContainer>
                {versions.length > 1 && (
                    <div>
                        <VersionDropdown />
                    </div>
                )}
            </div>
        </div>
    );
}

function FernLogoImage(): ReactElement | null {
    const { colors, resolveFile, logoHeight } = useDocsContext();
    if (colors == null) {
        return null;
    }

    const logoImageHeight = logoHeight ?? DEFAULT_LOGO_HEIGHT;
    const imageClassName = "max-h-full object-contain";
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
}

function FernLogoContainer({ children, href }: PropsWithChildren<{ href: string | undefined }>): ReactElement {
    const container = <div className="fern-logo-container">{children}</div>;
    return href != null ? <FernLink href={href}>{container}</FernLink> : container;
}
