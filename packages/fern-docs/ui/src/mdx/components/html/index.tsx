import { FdrAPI, type DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import cn from "clsx";
import { useAtomValue } from "jotai";
import {
  AnchorHTMLAttributes,
  Children,
  ComponentProps,
  FC,
  ReactElement,
  cloneElement,
  createElement,
  forwardRef,
  isValidElement,
} from "react";
import Zoom from "react-medium-image-zoom";
import {
  FILES_ATOM,
  LAYOUT_CONTENT_GUIDE_WIDTH_ATOM,
  LAYOUT_CONTENT_OVERVIEW_WIDTH_ATOM,
  LAYOUT_CONTENT_PAGE_WIDTH_ATOM,
  LAYOUT_CONTENT_REFERENCE_COLUMN_WIDTH_ATOM,
  LAYOUT_CONTENT_REFERENCE_WIDTH_ATOM,
  useEdgeFlags,
} from "../../../atoms";
import { FernAnchor } from "../../../components/FernAnchor";
import { FernImage } from "../../../components/FernImage";
import { FernLink } from "../../../components/FernLink";
import { useWithAside } from "../../../contexts/api-page";
import { useFrontmatter } from "../../../contexts/frontmatter";
import { toPixelValue } from "../../../util/to-pixel-value";

export const HeadingRenderer = (
  level: number,
  props: ComponentProps<"h1">
): ReactElement => {
  return (
    <FernAnchor href={`#${props.id}`}>
      {createElement(`h${level}`, props)}
    </FernAnchor>
  );
};

export const P: FC<{ variant: "api" | "markdown" } & ComponentProps<"p">> = ({
  variant,
  className,
  ...rest
}) => {
  return <p {...rest} />;
};

export const Strong: FC<ComponentProps<"strong">> = ({
  className,
  ...rest
}) => {
  return <strong {...rest} className={cn(className, "font-semibold")} />;
};

export const Ol: FC<ComponentProps<"ol">> = ({ className, ...rest }) => {
  return (
    <ol
      {...rest}
      className={cn(className, "mb-3 list-outside list-decimal space-y-2")}
    />
  );
};

export const Ul: FC<ComponentProps<"ul">> = ({ className, ...rest }) => {
  return (
    <ul
      {...rest}
      className={cn(className, "mb-3 list-outside list-disc space-y-2")}
    />
  );
};

export const Li: FC<ComponentProps<"li">> = ({ className, ...rest }) => {
  return <li {...rest} className={cn(className)} />;
};

export const A: FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  className,
  children,
  href,
  ...rest
}) => {
  const cnCombined = cn("fern-mdx-link", className);
  const hideExternalLinkIcon =
    isValidElement(children) &&
    (children.type === "img" || children.type === Image);

  return (
    <FernLink
      className={cnCombined}
      href={href ?? {}}
      {...rest}
      showExternalLinkIcon={!hideExternalLinkIcon}
    >
      {Children.map(children, (child) =>
        !isValidElement(child)
          ? child
          : isImgElement(child)
            ? cloneElement<ImgProps>(child, { noZoom: true })
            : child.type === "img"
              ? createElement(Image, { ...child.props, noZoom: true })
              : child
      )}
    </FernLink>
  );
};

export interface ImgProps extends ComponentProps<"img"> {
  /**
   * @default false
   */
  noZoom?: boolean;
  /**
   * overrides `noZoom` if true
   * @default false
   */
  enableZoom?: boolean;
}

export const Image = forwardRef<HTMLImageElement, ImgProps>((props, ref) => {
  const {
    src: srcProp,
    width,
    height,
    noZoom: isImageZoomDisabledProp = false,
    enableZoom: isImageZoomEnabledOverride = false,
    style,
    ...rest
  } = props;

  const files = useAtomValue(FILES_ATOM);
  const src = srcProp ? selectFile(files, srcProp) : undefined;

  const maxWidth = useMaxLayoutWidth();

  const fernImage = (
    <FernImage
      ref={ref}
      src={src}
      width={toPixelValue(width)}
      height={toPixelValue(height)}
      style={{
        // since the `toPixelValue` will return undefined for non-pixel values, we need to preserve the original values using the `style` prop
        width,
        height,
        maxWidth,
        ...style,
      }}
      {...rest}
    />
  );

  const isImageZoomDisabled = useIsImageZoomDisabbled({
    noZoom: isImageZoomDisabledProp,
    enableZoom: isImageZoomEnabledOverride,
  });

  if (isImageZoomDisabled) {
    return fernImage;
  }

  return (
    <Zoom zoomImg={{ src: src?.url }} classDialog="custom-backdrop">
      {fernImage}
    </Zoom>
  );
});

Image.displayName = "Image";

/**
 * @param element - React element
 * @returns true if the element is an `Image` component
 */
function isImgElement(
  element: ReactElement
): element is ReactElement<ImgProps> {
  return element.type === Image;
}

/**
 * There are multiple ways to disable (or enable) image zoom:
 * - feature flag (set in the edge config) will disable image zoom globally, which can be overridden with `enableZoom`
 * - frontmatter can set `no-image-zoom` to true, which will disable image zoom for that page, and specific images can be overridden with `enableZoom`
 * - if layout is set to `custom`, by default the `no-image-zoom` frontmatter is interpreted as `true` but can be overridden as `no-image-zoom: false`
 * - otherwise, if `noZoom` is true, image zoom is disabled, false otherwise
 *
 * @param opts - Options
 * @returns true if image zoom is disabled
 */
function useIsImageZoomDisabbled({
  noZoom,
  enableZoom,
}: {
  noZoom: boolean;
  enableZoom: boolean;
}) {
  const isImageZoomDisabledFeatureFlag = useEdgeFlags().isImageZoomDisabled;

  const { "no-image-zoom": isImageZoomDisabledFrontmatter, layout } =
    useFrontmatter();

  const isImageZoomDisabledLayout =
    isImageZoomDisabledFrontmatter ?? layout === "custom";

  return isImageZoomDisabledFeatureFlag || isImageZoomDisabledLayout
    ? !enableZoom
    : noZoom;
}

function useMaxLayoutWidth(): number | undefined {
  // guide is the default layout
  const hasAside = useWithAside();
  const { layout = hasAside ? "reference" : "guide" } = useFrontmatter();

  const guideWidth = useAtomValue(LAYOUT_CONTENT_GUIDE_WIDTH_ATOM);
  const overviewWidth = useAtomValue(LAYOUT_CONTENT_OVERVIEW_WIDTH_ATOM);
  const pageWidth = useAtomValue(LAYOUT_CONTENT_PAGE_WIDTH_ATOM);
  const referenceWidth = useAtomValue(LAYOUT_CONTENT_REFERENCE_WIDTH_ATOM);
  const referenceColumnWidth = useAtomValue(
    LAYOUT_CONTENT_REFERENCE_COLUMN_WIDTH_ATOM
  );

  switch (layout) {
    case "guide":
      return guideWidth;
    case "overview":
      return overviewWidth;
    case "reference":
      return hasAside ? referenceColumnWidth : referenceWidth;
    case "page":
      return pageWidth;
    default:
      return undefined;
  }
}

/**
 * Conforms the `src` prop to the File type.
 * @param files - Files map
 * @param src - Source
 * @returns File
 */
function selectFile(
  files: Record<string, DocsV1Read.File_>,
  src: string
): DocsV1Read.File_ | undefined {
  if (src == null) {
    return undefined;
  }

  // `file:` is a special signifier that the src references a file in the Files record.
  // which was functionality introduced in https://github.com/fern-api/fern/pull/3847
  // but this will be deprecated so that any string in the src prop can be used to lookup a file in the Files record,
  // and fallback as "url" if not found.
  const fileId = FdrAPI.FileId(src.startsWith("file:") ? src.slice(5) : src);
  return files[fileId] ?? { type: "url", url: FdrAPI.Url(src) };
}
