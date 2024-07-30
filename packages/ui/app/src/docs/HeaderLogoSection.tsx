import cn from "clsx";
import { useAtomValue } from "jotai";
import { PropsWithChildren, ReactElement } from "react";
import { DOCS_ATOM, LOGO_HREF_ATOM, LOGO_TEXT_ATOM, VERSIONS_ATOM, useColors, useFile, useLogoHeight } from "../atoms";
import { FernImage } from "../components/FernImage";
import { FernLink } from "../components/FernLink";
import { VersionDropdown } from "./VersionDropdown";

export function HeaderLogoSection(): ReactElement {
    const logoHref = useAtomValue(LOGO_HREF_ATOM);
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

function FernFileImage({ fileId, ...props }: Omit<FernImage.Props, "src"> & { fileId: string }): ReactElement {
    return <FernImage src={useFile(fileId)} {...props} />;
}

function FernLogoImage(): ReactElement | null {
    const colors = useColors();
    const logoImageHeight = useLogoHeight();
    const imageClassName = "max-h-full object-contain";
    const title = useAtomValue(DOCS_ATOM).title || "Logo";

    if (colors.dark != null && colors.light != null) {
        return (
            <>
                {colors.light.logo != null && (
                    <FernFileImage
                        alt={title}
                        fileId={colors.light.logo}
                        className={cn(imageClassName, "block dark:hidden")}
                        height={logoImageHeight}
                        style={{ height: logoImageHeight }}
                        priority={true}
                        loading="eager"
                        quality={100}
                    />
                )}
                {colors.dark.logo != null && (
                    <FernFileImage
                        alt={title}
                        fileId={colors.dark.logo}
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
            <FernFileImage
                fileId={logoFile}
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
