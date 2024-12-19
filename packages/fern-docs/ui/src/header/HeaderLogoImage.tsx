import { DocsV1Read } from "@fern-api/fdr-sdk";
import { useAtomValue } from "jotai";
import { ReactElement } from "react";
import { DOCS_ATOM, LOGO_IMAGE_ATOM, useFile, useLogoHeight } from "../atoms";
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
}: Omit<FernImage.Props, "src"> & {
    fileIdOrUrl: DocsV1Read.FileIdOrUrl;
}): ReactElement {
    if (fileIdOrUrl.type === "fileId") {
        return <FernFileImage fileId={fileIdOrUrl.value} {...props} />;
    }
    return (
        <FernImage src={{ type: "url", url: fileIdOrUrl.value }} {...props} />
    );
}

export function HeaderLogoImage(): ReactElement | null {
    const logoImageHeight = useLogoHeight();
    const title = useAtomValue(DOCS_ATOM).title ?? "Logo";
    const { light, dark } = useAtomValue(LOGO_IMAGE_ATOM);

    if (light != null && dark != null) {
        return (
            <>
                <FernFileOrUrlImage
                    alt={title}
                    fileIdOrUrl={light}
                    className="fern-logo-light"
                    height={logoImageHeight}
                    style={{ height: logoImageHeight }}
                    priority={true}
                    loading="eager"
                    quality={100}
                />
                <FernFileOrUrlImage
                    alt={title}
                    fileIdOrUrl={dark}
                    className="fern-logo-dark"
                    height={logoImageHeight}
                    style={{ height: logoImageHeight }}
                    priority={true}
                    loading="eager"
                    quality={100}
                />
            </>
        );
    }

    const logoFile = light ?? dark;

    if (logoFile == null) {
        return null;
    }

    return (
        <FernFileOrUrlImage
            alt={title}
            fileIdOrUrl={logoFile}
            className="fern-logo"
            height={logoImageHeight}
            style={{ height: logoImageHeight }}
            priority={true}
            loading="eager"
            quality={100}
        />
    );
}
