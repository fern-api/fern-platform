import { DocsV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import Image, { ImageProps } from "next/image";
import { ReactElement } from "react";

export declare namespace FernImage {
    export interface Props extends Omit<ImageProps, "src" | "alt"> {
        // FDR may return a URL or an image object depending on the version of the Fern CLI used to build the docs.
        // If the file has width/height metadata, we can render it using next/image for optimized loading.
        src: DocsV1Read.File_ | undefined;
        alt?: string;
        maxWidth?: number; // from docs.yml
    }
}

export function FernImage({ src, ...props }: FernImage.Props): ReactElement | null {
    if (src == null) {
        return null;
    }
    return visitDiscriminatedUnion(src, "type")._visit({
        url: ({ url }) => {
            const { fill, loader, quality, priority, placeholder, blurDataURL, unoptimized, ...imgProps } = props;
            return <img {...imgProps} src={url} />;
        },
        image: ({ url, width: realWidth, height: realHeight, blurDataUrl, alt }) => {
            const { width: layoutWidth, height: layoutHeight, maxWidth } = props;
            const { width, height } = getDimensions(layoutWidth, layoutHeight, realWidth, realHeight, maxWidth);
            return (
                <Image
                    {...props}
                    src={url}
                    width={width}
                    height={height}
                    alt={props.alt ?? alt ?? ""}
                    placeholder={props.placeholder ?? (blurDataUrl != null ? "blur" : "empty")}
                    blurDataURL={props.blurDataURL ?? blurDataUrl}
                    unoptimized={props.unoptimized ?? url.includes(".svg")}
                    overrideSrc={url}
                />
            );
        },
        _other: () => null,
    });
}

function getDimensions(
    layoutWidth: number | `${number}` | undefined,
    layoutHeight: number | `${number}` | undefined,
    realWidth: number,
    realHeight: number,
    maxWidth?: number,
): { width: number; height: number } {
    layoutWidth = typeof layoutWidth === "string" ? parseInt(layoutWidth, 10) : layoutWidth;
    layoutHeight = typeof layoutHeight === "string" ? parseInt(layoutHeight, 10) : layoutHeight;
    if (layoutWidth != null && layoutHeight != null) {
        if (maxWidth != null && layoutWidth > maxWidth) {
            const ratio = maxWidth / layoutWidth;
            return { width: maxWidth, height: layoutHeight * ratio };
        }

        return { width: layoutWidth, height: layoutHeight };
    }
    if (layoutWidth != null) {
        if (maxWidth != null && layoutWidth > maxWidth) {
            layoutWidth = maxWidth;
        }
        const ratio = layoutWidth / realWidth;
        return { width: layoutWidth, height: realHeight * ratio };
    }
    if (layoutHeight != null) {
        if (maxWidth != null && realWidth > maxWidth) {
            const ratio = maxWidth / realWidth;
            const height = realHeight * ratio;
            if (height <= layoutHeight) {
                return { width: maxWidth, height };
            }
        }

        const ratio = layoutHeight / realHeight;
        return { width: realWidth * ratio, height: layoutHeight };
    }
    if (maxWidth != null && realWidth > maxWidth) {
        const ratio = maxWidth / realWidth;
        return { width: maxWidth, height: realHeight * ratio };
    }
    return { width: realWidth, height: realHeight };
}
