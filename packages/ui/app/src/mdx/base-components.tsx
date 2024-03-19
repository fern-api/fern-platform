import { useMounted } from "@fern-ui/react-commons";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import Link from "next/link";
import {
    AnchorHTMLAttributes,
    Children,
    cloneElement,
    ComponentProps,
    createElement,
    DetailedHTMLProps,
    FC,
    ImgHTMLAttributes,
    isValidElement,
    ReactElement,
    ReactNode,
} from "react";
import Zoom from "react-medium-image-zoom";
import { AbsolutelyPositionedAnchor } from "../commons/AbsolutelyPositionedAnchor";
import { FernCard } from "../components/FernCard";
import { useNavigationContext } from "../contexts/navigation-context";
import { onlyText } from "../util/onlyText";
import "./base-components.scss";

export const Table: FC<ComponentProps<"table">> = ({ className, ...rest }) => {
    return (
        <FernCard className="fern-table not-prose">
            <table {...rest} className={classNames(className)} />
        </FernCard>
    );
};

export const Thead: FC<ComponentProps<"thead">> = ({ className, ...rest }) => {
    return <thead {...rest} className={classNames(className)} />;
};

export const Tbody: FC<ComponentProps<"tbody">> = ({ className, ...rest }) => {
    return <tbody {...rest} className={classNames(className)} />;
};

export const Tr: FC<ComponentProps<"tr">> = ({ className, ...rest }) => {
    return <tr {...rest} className={classNames(className)} />;
};

export const Th: FC<ComponentProps<"th">> = ({ className, ...rest }) => {
    return <th {...rest} className={classNames(className, "text-left truncate p-3")} />;
};

export const Td: FC<ComponentProps<"td">> = ({ className, children, ...rest }) => {
    const childrenAsString = onlyText(children);
    return (
        <td
            {...rest}
            className={classNames(className, "p-3", {
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
 * @see https://github.com/remarkjs/react-markdown/issues/404#issuecomment-604019030
 */
const flatten = (
    text: string,
    child: ReactNode,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
    return typeof child === "string"
        ? text + child
        : Children.toArray((child as ReactElement).props.children).reduce(flatten, text);
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

function getSlugFromChildren(children: ReactNode): string {
    const text = Children.toArray(children).reduce(flatten, "");
    return getSlugFromText(text);
}

export const HeadingRenderer = (level: number, props: ComponentProps<"h1">): ReactElement => {
    const slug = getSlugFromChildren(props.children);
    return createElement(
        `h${level}`,
        { id: slug, ...props },
        <AbsolutelyPositionedAnchor href={{ hash: slug, pathname: useCurrentPathname() }} />,
        <span>{props.children}</span>,
    );
};

export const P: FC<{ variant: "api" | "markdown" } & ComponentProps<"p">> = ({ variant, className, ...rest }) => {
    return <p {...rest} />;
};

export const Strong: FC<ComponentProps<"strong">> = ({ className, ...rest }) => {
    return <strong {...rest} className={classNames(className, "font-semibold")} />;
};

export const Ol: FC<ComponentProps<"ol">> = ({ className, ...rest }) => {
    return <ol {...rest} className={classNames(className, "list-outside list-decimal space-y-2 mb-3")} />;
};

export const Ul: FC<ComponentProps<"ul">> = ({ className, ...rest }) => {
    return <ul {...rest} className={classNames(className, "list-outside list-disc space-y-2 mb-3")} />;
};

export const Li: FC<ComponentProps<"li">> = ({ className, ...rest }) => {
    return <li {...rest} className={classNames(className, "marker:text-inherit")} />;
};

const RelativePathAnchor: FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({ className, children, href, ...rest }) => {
    const { resolvedPath } = useNavigationContext();
    const classNamesCombined = classNames("fern-mdx-link", className);
    const newHref = href != null ? `/${resolvedPath.fullSlug}/${href}` : undefined;

    return (
        <Link className={classNamesCombined} href={newHref ?? "#"} {...rest}>
            {isValidElement(children) && isImgElement(children)
                ? cloneElement<ImgProps>(children, { disableZoom: true })
                : children}
        </Link>
    );
};

export const A: FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({ className, children, href, ...rest }) => {
    const isExternalUrl = href?.startsWith("http") || href?.startsWith("mailto:") || href?.startsWith("tel:");

    if (!isExternalUrl && href != null && !href.startsWith("/")) {
        return (
            <RelativePathAnchor className={className} href={href} {...rest}>
                {children}
            </RelativePathAnchor>
        );
    }

    const classNamesCombined = classNames("fern-mdx-link", className);

    const hideExternalLinkIcon = isValidElement(children) && (children.type === "img" || children.type === Img);

    return (
        <Link className={classNamesCombined} href={href ?? "#"} target={isExternalUrl ? "_blank" : undefined} {...rest}>
            {isValidElement(children) && isImgElement(children)
                ? cloneElement<ImgProps>(children, { disableZoom: true })
                : children}

            {isExternalUrl && !hideExternalLinkIcon && <ExternalLinkIcon className="external-link-icon" />}
        </Link>
    );
};

interface ImgProps extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    disableZoom?: boolean;
}

function isImgElement(element: ReactNode): element is ReactElement<ImgProps> {
    return isValidElement(element) && element.type === Img;
}

export const Img: FC<ImgProps> = ({ className, src, alt, disableZoom, ...rest }) => {
    const mounted = useMounted();
    if (!mounted || disableZoom) {
        return <img {...rest} className={classNames(className, "max-w-full")} src={src} alt={alt} />;
    }
    return (
        <Zoom>
            <img {...rest} className={classNames(className, "max-w-full")} src={src} alt={alt} />
        </Zoom>
    );
};

export function getSlugFromText(text: string): string {
    if (text == null) {
        return "";
    }
    return text.toLowerCase().replace(/\W/g, "-").replace(/-+/g, "-");
}
