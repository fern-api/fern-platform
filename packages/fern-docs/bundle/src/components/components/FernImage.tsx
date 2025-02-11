/* eslint-disable @next/next/no-img-element */
import { RemotePattern } from "next/dist/shared/lib/image-config";
import Image from "next/image";
import { ComponentPropsWithoutRef, forwardRef } from "react";

import { UnreachableCaseError } from "ts-essentials";

// TODO: move this to a shared location
const NEXT_IMAGE_HOSTS = [
  "fdr-prod-docs-files.s3.us-east-1.amazonaws.com",
  "fdr-prod-docs-files-public.s3.amazonaws.com",
  "fdr-dev2-docs-files.s3.us-east-1.amazonaws.com",
  "fdr-dev2-docs-files-public.s3.amazonaws.com",
  "files.buildwithfern.com",
  "files-dev2.buildwithfern.com",
];

export const FernImage = forwardRef<
  HTMLImageElement,
  ComponentPropsWithoutRef<typeof Image>
>((props, ref) => {
  const {
    src,
    alt,
    width,
    height,
    fill,
    loader,
    quality,
    priority,
    loading,
    placeholder,
    blurDataURL,
    unoptimized,
    overrideSrc,
    onLoadingComplete,
    layout,
    objectFit,
    objectPosition,
    lazyBoundary,
    lazyRoot,
    ...rest
  } = props;

  if (src == null) {
    return null;
  }

  const originalSrc = getSrc(src);
  const { host, pathname } = safeGetUrl(originalSrc);

  const aspectRatio = withAspectRatio(withDimensions(props));

  // nextjs requires a strict allowlist of hosts for <Image>
  // so we'll fall back to <img> if the host is not in the allowlist (or if no custom loader is provided)
  if (
    ((!host || !NEXT_IMAGE_HOSTS.includes(host)) && !loader) ||
    (!width && !height)
  ) {
    return (
      <img
        ref={ref}
        {...rest}
        src={originalSrc}
        alt={alt}
        width={width}
        height={height}
        fetchPriority={priority ? "high" : undefined}
        loading={loading}
        // on local dev, the preflight css for <img> tags is `max-width: 100%; height: auto;`
        // which causes the image height to be ignored. we'll use the inline style prop to override this behavior:
        style={{
          aspectRatio,
          ...props.style,
        }}
      />
    );
  }

  // if we're here, we're using the <Image> component
  // we'll use the inline style prop to override the aspect ratio
  // and pass the rest of the props to the <Image> component
  return (
    <Image
      ref={ref}
      {...rest}
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      loader={loader}
      quality={quality}
      priority={priority}
      loading={loading}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      unoptimized={
        pathname?.endsWith(".gif") || pathname?.endsWith(".svg") || unoptimized
      }
      overrideSrc={originalSrc}
      onLoadingComplete={onLoadingComplete}
      layout={layout}
      objectFit={objectFit}
      objectPosition={objectPosition}
      lazyBoundary={lazyBoundary}
      lazyRoot={lazyRoot}
      // on local dev, the preflight css for <img> tags is `max-width: 100%; height: auto;`
      // which causes the image height to be ignored. we'll use the inline style prop to override this behavior:
      style={{
        aspectRatio,
        ...props.style,
      }}
    />
  );
});

FernImage.displayName = "FernImage";

function safeGetUrl(src: string): {
  host: string | undefined;
  pathname: string | undefined;
} {
  try {
    const url = new URL(src, "https://n");
    return { host: url.host, pathname: url.pathname.toLowerCase() };
  } catch (_e) {
    return { host: undefined, pathname: undefined };
  }
}

function getSrc(src: ComponentPropsWithoutRef<typeof Image>["src"]): string {
  if (typeof src === "string") {
    return src;
  }
  if (typeof src === "object" && "src" in src) {
    return src.src;
  }
  if (typeof src === "object" && "default" in src) {
    return src.default.src;
  }
  throw new UnreachableCaseError(src);
}

function withDimensions(
  props: ComponentPropsWithoutRef<typeof Image>
): { width: number; height: number } | undefined {
  if (props.width != null && props.height != null) {
    return { width: Number(props.width), height: Number(props.height) };
  }
  if (
    typeof props.src === "object" &&
    "width" in props.src &&
    "height" in props.src
  ) {
    return { width: props.src.width, height: props.src.height };
  }
  if (typeof props.src === "object" && "default" in props.src) {
    return { width: props.src.default.width, height: props.src.default.height };
  }
  return undefined;
}

function withAspectRatio(
  dimensions: { width: number; height: number } | undefined
): number | undefined {
  if (dimensions == null) {
    return undefined;
  }
  return dimensions.width / dimensions.height;
}
