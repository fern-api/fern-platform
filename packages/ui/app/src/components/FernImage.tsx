import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import Image, { ImageProps } from "next/image";
import { ReactElement } from "react";

export declare namespace FernImage {
    export interface Props extends Omit<ImageProps, "src" | "alt"> {
        // FDR may return a URL or an image object depending on the version of the Fern CLI used to build the docs.
        // If the file has width/height metadata, we can render it using next/image for optimized loading.
        src: DocsV1Read.File_ | undefined;
        alt?: string;
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
            const { width: layoutWidth, height: layoutHeight } = props;
            const { width, height } = getDimensions(layoutWidth, layoutHeight, realWidth, realHeight);
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
): { width: number; height: number } {
    layoutWidth = typeof layoutWidth === "string" ? parseInt(layoutWidth, 10) : layoutWidth;
    layoutHeight = typeof layoutHeight === "string" ? parseInt(layoutHeight, 10) : layoutHeight;
    if (layoutWidth != null && isNaN(layoutWidth)) {
        layoutWidth = undefined;
    }
    if (layoutHeight != null && isNaN(layoutHeight)) {
        layoutHeight = undefined;
    }
    if (layoutWidth != null && layoutHeight != null) {
        return { width: layoutWidth, height: layoutHeight };
    }
    if (layoutWidth != null) {
        return { width: layoutWidth, height: (layoutWidth / realWidth) * realHeight };
    }
    if (layoutHeight != null) {
        return { width: (layoutHeight / realHeight) * realWidth, height: layoutHeight };
    }
    return { width: realWidth, height: realHeight };
}
