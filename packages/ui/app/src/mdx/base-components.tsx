import { DocsV1Read } from "@fern-api/fdr-sdk";
import cn from "clsx";
import { useAtomValue } from "jotai";
import {
    AnchorHTMLAttributes,
    Children,
    cloneElement,
    ComponentProps,
    createElement,
    FC,
    isValidElement,
    ReactElement,
    useMemo,
} from "react";
import Zoom from "react-medium-image-zoom";
import { useFeatureFlags } from "../atoms/flags";
import { SLUG_ATOM } from "../atoms/location";
import { AbsolutelyPositionedAnchor } from "../commons/AbsolutelyPositionedAnchor";
import { FernImage } from "../components/FernImage";
import { FernLink } from "../components/FernLink";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useFrontmatter } from "./frontmatter-context";

/**
 * By default, next will use /host/current/slug in SSG.
 * Because of our custom routing (PathResolver) implementation, we need to override the pathname to be /basePath/current/slug.
 * @returns /basepath/current/slug
 */
export function useCurrentPathname(): string {
    const currentSlug = useAtomValue(SLUG_ATOM);
    return `/${currentSlug}`;
}

export const HeadingRenderer = (level: number, props: ComponentProps<"h1">): ReactElement => {
    return createElement(
        `h${level}`,
        {
            id: props.id,
            "data-anchor": props.id,
            ...props,
            className: cn(props.className, "flex items-center relative group/anchor-container mb-3"),
        },
        <AbsolutelyPositionedAnchor href={{ hash: props.id, pathname: useCurrentPathname() }} />,
        <span>{props.children}</span>,
    );
};

export const P: FC<{ variant: "api" | "markdown" } & ComponentProps<"p">> = ({ variant, className, ...rest }) => {
    return <p {...rest} />;
};

export const Strong: FC<ComponentProps<"strong">> = ({ className, ...rest }) => {
    return <strong {...rest} className={cn(className, "font-semibold")} />;
};

export const Ol: FC<ComponentProps<"ol">> = ({ className, ...rest }) => {
    return <ol {...rest} className={cn(className, "list-outside list-decimal space-y-2 mb-3")} />;
};

export const Ul: FC<ComponentProps<"ul">> = ({ className, ...rest }) => {
    return <ul {...rest} className={cn(className, "list-outside list-disc space-y-2 mb-3")} />;
};

export const Li: FC<ComponentProps<"li">> = ({ className, ...rest }) => {
    return <li {...rest} className={cn(className)} />;
};

export const A: FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({ className, children, href, ...rest }) => {
    const cnCombined = cn("fern-mdx-link", className);
    const hideExternalLinkIcon = isValidElement(children) && (children.type === "img" || children.type === Image);

    return (
        <FernLink className={cnCombined} href={href ?? {}} {...rest} showExternalLinkIcon={!hideExternalLinkIcon}>
            {Children.map(children, (child) =>
                !isValidElement(child)
                    ? child
                    : isImgElement(child)
                      ? cloneElement<ImgProps>(child, { noZoom: true })
                      : child.type === "img"
                        ? createElement(Image, { ...child.props, noZoom: true })
                        : child,
            )}
        </FernLink>
    );
};

export interface ImgProps extends ComponentProps<"img"> {
    noZoom?: boolean;
    enableZoom?: boolean;
}

function isImgElement(element: ReactElement): element is ReactElement<ImgProps> {
    return element.type === Image;
}

export const Image: FC<ImgProps> = ({ className, src, width: w, height: h, noZoom, enableZoom, style, ...rest }) => {
    const { files } = useDocsContext();
    const { "no-image-zoom": noImageZoom } = useFrontmatter();

    const fernImageSrc = useMemo((): DocsV1Read.File_ | undefined => {
        if (src == null) {
            return undefined;
        }

        // if src starts with `file:`, assume it's a referenced file; fallback to src if not found
        if (src.startsWith("file:")) {
            const fileId = src.slice(5);
            return files[fileId] ?? { type: "url", url: src };
        }

        return { type: "url", url: src };
    }, [files, src]);

    const width = stripUnits(w);
    const height = stripUnits(h);

    const fernImage = (
        <FernImage
            src={fernImageSrc}
            width={width}
            height={height}
            style={{
                width: w,
                height: h,
                ...style,
            }}
            {...rest}
        />
    );

    const { isImageZoomDisabled } = useFeatureFlags();

    if (isImageZoomDisabled || noImageZoom ? !enableZoom : noZoom) {
        return fernImage;
    }

    return (
        <Zoom zoomImg={{ src: fernImageSrc?.url }} classDialog="custom-backdrop">
            {fernImage}
        </Zoom>
    );
};

// preserves pixel widths and heights, but strips units from other values
function stripUnits(str: string | number | undefined): number | `${number}` | undefined {
    if (str == null || typeof str === "number") {
        return str;
    } else if (/^\d+$/.test(str)) {
        // if str is a number, return it as a string
        return str as `${number}`;
    } else if (/^\d+(\.\d+)?(px)$/.test(str)) {
        // if str is a number followed by "px", return the number as a string
        return str.slice(0, -2) as `${number}`;
    }

    // TODO: handle rem

    return undefined;
}
