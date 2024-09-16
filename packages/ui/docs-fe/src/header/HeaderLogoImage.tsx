import { useAtomValue } from "jotai";
import { ReactElement } from "react";
import { DOCS_ATOM, useColors, useFile, useLogoHeight } from "../atoms";
import { FernImage } from "../components/FernImage";

function FernFileImage({ fileId, ...props }: Omit<FernImage.Props, "src"> & { fileId: string }): ReactElement {
    return <FernImage src={useFile(fileId)} {...props} />;
}

export function HeaderLogoImage(): ReactElement | null {
    const colors = useColors();
    const logoImageHeight = useLogoHeight();
    const title = useAtomValue(DOCS_ATOM).title ?? "Logo";

    if (colors.dark != null && colors.light != null) {
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
