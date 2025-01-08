import { DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { useAtomValue } from "jotai";
import {
  ComponentProps,
  ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  ReactElement,
  ReactNode,
  useContext,
} from "react";
import Zoom from "react-medium-image-zoom";
import { FILES_ATOM, useFeatureFlags } from "../../../atoms";
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
  ComponentPropsWithoutRef<"img"> & {
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
>((props, ref) => {
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

  const fernImage = (
    <FernImage
      ref={ref}
      src={src}
      width={toPixelValue(width)}
      height={toPixelValue(height)}
      {...rest}
      style={{
        // since the `toPixelValue` will return undefined for non-pixel values, we need to preserve the original values using the `style` prop
        width,
        height,
        ...style,
      }}
    />
  );

  const isImageZoomDisabled = useIsImageZoomDisabled({
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
export function isImageElement(
  element: ReactElement
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
  const isImageZoomDisabledFeatureFlag = useFeatureFlags().isImageZoomDisabled;

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
