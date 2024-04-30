import { DocsV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import cn from "clsx";
import { toNumber } from "lodash-es";
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
    useState,
} from "react";
import Zoom from "react-medium-image-zoom";
import { AbsolutelyPositionedAnchor } from "../commons/AbsolutelyPositionedAnchor";
import { FernCard } from "../components/FernCard";
import { FernImage } from "../components/FernImage";
import { FernLink } from "../components/FernLink";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useNavigationContext } from "../contexts/navigation-context";
import { onlyText } from "../util/onlyText";
import "./base-components.scss";

export const Table: FC<ComponentProps<"table">> = ({ className, ...rest }) => {
    return (
        <FernCard className="fern-table not-prose">
            <table {...rest} className={cn(className)} />
        </FernCard>
    );
};

export const Thead: FC<ComponentProps<"thead">> = ({ className, ...rest }) => {
    return <thead {...rest} className={cn(className)} />;
};

export const Tbody: FC<ComponentProps<"tbody">> = ({ className, ...rest }) => {
    return <tbody {...rest} className={cn(className)} />;
};

export const Tr: FC<ComponentProps<"tr">> = ({ className, ...rest }) => {
    return <tr {...rest} className={cn(className)} />;
};

export const Th: FC<ComponentProps<"th">> = ({ className, ...rest }) => {
    return <th {...rest} className={cn(className, "text-left truncate p-3")} />;
};

export const Td: FC<ComponentProps<"td">> = ({ className, children, ...rest }) => {
    const childrenAsString = onlyText(children);
    return (
        <td
            {...rest}
            className={cn(className, "p-3", {
                // if the table has many columns, do not collapse short string content into multi-line:
                "whitespace-nowrap": childrenAsString.length < 100,
                // prevent table's auto sizing from collapsing a paragraph into a tall-skinny column of broken sentences:
                "min-w-sm": childrenAsString.length > 200,
            })}
        >
            {children}
        </td>
    );
};

/**
 * By default, next will use /host/current/slug in SSG.
 * Because of our custom routing (PathResolver) implementation, we need to override the pathname to be /basePath/current/slug.
 * @returns /basepath/current/slug
 */
export function useCurrentPathname(): string {
    const { resolvedPath } = useNavigationContext();
    return `/${resolvedPath.fullSlug}`;
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
    return <li {...rest} className={cn(className, "marker:text-inherit")} />;
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
                      ? cloneElement<ImgProps>(child, { disableZoom: true })
                      : child.type === "img"
                        ? createElement(Image, { ...child.props, disableZoom: true })
                        : child,
            )}
        </FernLink>
    );
};

export interface ImgProps extends ComponentProps<"img"> {
    disableZoom?: boolean;
}

function isImgElement(element: ReactElement): element is ReactElement<ImgProps> {
    return element.type === Image;
}

export const Image: FC<ImgProps> = ({ className, src, height, width, disableZoom, ...rest }) => {
    const { files, layout } = useDocsContext();
    const [isLoaded, setIsLoaded] = useState(false);
    const fernImageSrc = useMemo((): DocsV1Read.File_ | undefined => {
        if (src == null) {
            return undefined;
        }

        if (src.startsWith("file:")) {
            const fileId = src.slice(5);
            return files[fileId];
        }

        return { type: "url", url: src };
    }, [files, src]);
    const maxWidth = useMemo(() => {
        return layout?.contentWidth == null
            ? 44 * 16
            : visitDiscriminatedUnion(layout.contentWidth, "type")._visit({
                  px: (px) => px.value,
                  rem: (rem) => rem.value * 16,
                  _other: () => 44 * 16,
              });
    }, [layout?.contentWidth]);

    const image = (
        <FernImage
            src={fernImageSrc}
            {...rest}
            height={height != null ? toNumber(height) : undefined}
            width={height != null ? toNumber(width) : undefined}
            // initial load should be optimized for speed.
            // after the image is loaded, we can switch to higher quality, which is better for zooming.
            maxWidth={isLoaded ? undefined : maxWidth}
            quality={isLoaded ? undefined : 100}
            onLoad={() => {
                setIsLoaded(true);
            }}
        />
    );

    if (disableZoom) {
        return image;
    }

    return <Zoom>{image}</Zoom>;
};
