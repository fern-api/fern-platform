import {
  ComponentProps,
  ReactElement,
  ReactNode,
  createContext,
  forwardRef,
  useContext,
} from "react";
import Zoom from "react-medium-image-zoom";

import { useEdgeFlags } from "../../../atoms";
import { FernImage } from "../../../components/FernImage";
import { useFrontmatter } from "../../../contexts/frontmatter";
import { toPixelValue } from "../../../util/to-pixel-value";

const NoZoomContext = createContext<boolean>(false);

export function NoZoom({ children }: { children: ReactNode }) {
  return (
    <NoZoomContext.Provider value={true}>{children}</NoZoomContext.Provider>
  );
}

export const Image = forwardRef<
  HTMLImageElement,
  React.ComponentPropsWithoutRef<"img"> & {
    /**
     * @default false
     */
    noZoom?: boolean;
    /**
     * overrides `noZoom` if true
     * @default false
     */
    enableZoom?: boolean;

    // other props from next/image that are supported
    fill?: boolean | undefined;
    quality?: number | `${number}` | undefined;
    priority?: boolean | undefined;
    loading?: "eager" | "lazy" | undefined;
    blurDataURL?: string | undefined;
    unoptimized?: boolean | undefined;
  }
>((props, ref) => {
  const {
    src,
    width,
    height,
    noZoom: isImageZoomDisabledProp = false,
    enableZoom: isImageZoomEnabledOverride = false,
    style,
    ...rest
  } = props;

  const isImageZoomDisabled = useIsImageZoomDisabled({
    noZoom: isImageZoomDisabledProp,
    enableZoom: isImageZoomEnabledOverride,
  });

  if (!src) {
    return null;
  }

  const fernImage = (
    <FernImage
      ref={ref}
      src={src}
      width={toPixelValue(width)}
      height={toPixelValue(height)}
      {...rest}
      alt={rest.alt ?? ""}
      className="mx-auto"
    />
  );

  if (isImageZoomDisabled) {
    return fernImage;
  }

  return (
    <Zoom zoomImg={{ src }} classDialog="custom-backdrop" wrapElement="span">
      {fernImage}
    </Zoom>
  );
});

Image.displayName = "Image";

/**
 * @param element - React element
 * @returns true if the element is an `Image` component
 */
export function isImageElement(
  element: ReactElement<any>
): element is ReactElement<ComponentProps<typeof Image>> {
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
function useIsImageZoomDisabled({
  noZoom,
  enableZoom,
}: {
  noZoom: boolean;
  enableZoom: boolean;
}) {
  const isImageZoomDisabledContext = useContext(NoZoomContext);
  const isImageZoomDisabledFeatureFlag = useEdgeFlags().isImageZoomDisabled;

  const { "no-image-zoom": isImageZoomDisabledFrontmatter, layout } =
    useFrontmatter();

  const isImageZoomDisabledLayout =
    isImageZoomDisabledFrontmatter ?? layout === "custom";

  return isImageZoomDisabledContext ||
    isImageZoomDisabledFeatureFlag ||
    isImageZoomDisabledLayout
    ? !enableZoom
    : noZoom;
}
