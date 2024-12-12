import { DocsV1Read } from "@fern-api/fdr-sdk";
import { useAtomValue } from "jotai";
import { ReactElement } from "react";
import { DOCS_ATOM, LOGO_OVERRIDE_ATOM, useColors, useFile, useLogoHeight } from "../atoms";
import { FernImage } from "../components/FernImage";

function FernFileImage({
    fileId,
    ...props
}: Omit<FernImage.Props, "src"> & { fileId: DocsV1Read.FileId }): ReactElement {
    return <FernImage src={useFile(fileId)} {...props} />;
}

function FernFileOrUrlImage({
    fileIdOrUrl,
    ...props
}: Omit<FernImage.Props, "src"> & { fileIdOrUrl: DocsV1Read.FileIdOrUrl }): ReactElement {
    if (fileIdOrUrl.type === "fileId") {
        return <FernFileImage fileId={fileIdOrUrl.value} {...props} />;
    }
    return <FernImage src={{ type: "url", url: fileIdOrUrl.value }} {...props} />;
}

export function HeaderLogoImage(): ReactElement | null {
    const colors = useColors();
    const logoImageHeight = useLogoHeight();
    const title = useAtomValue(DOCS_ATOM).title ?? "Logo";
    const logoConfiguration = useAtomValue(LOGO_OVERRIDE_ATOM);
    console.log("logoConfiguration", logoConfiguration);

    if (logoConfiguration != null) {
        const lightLogo = logoConfiguration.light;
        const darkLogo = logoConfiguration.dark;

        return (
            <>
                {lightLogo != null && (
                    <FernFileOrUrlImage
                        alt={title}
                        fileIdOrUrl={lightLogo}
                        className="fern-logo-light"
                        height={logoImageHeight}
                        style={{ height: logoImageHeight }}
                        priority={true}
                        loading="eager"
                        quality={100}
                    />
                )}
                {darkLogo != null && (
                    <FernFileOrUrlImage
                        alt={title}
                        fileIdOrUrl={darkLogo}
                        className="fern-logo-dark"
                        height={logoImageHeight}
                        style={{ height: logoImageHeight }}
                        priority={true}
                        loading="eager"
                        quality={100}
                    />
                )}
            </>
        );
    } else if (colors.dark != null && colors.light != null) {
        return (
            <>
                {colors.light.logo != null && (
                    <FernFileImage
                        alt={title}
                        fileId={colors.light.logo}
                        className="fern-logo-light"
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
                        className="fern-logo-dark"
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
                className="fern-logo"
                height={logoImageHeight}
                style={{ height: logoImageHeight }}
                priority={true}
                loading="eager"
                quality={100}
            />
        );
    }
}
