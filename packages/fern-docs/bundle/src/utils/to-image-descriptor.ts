import { FileIdOrUrl } from "@fern-api/fdr-sdk/docs";

export function toImageDescriptor(
  files: Record<
    string,
    { url: string; width?: number; height?: number; alt?: string }
  >,
  image: FileIdOrUrl | undefined,
  width?: number,
  height?: number
): { url: string; width?: number; height?: number; alt?: string } | undefined {
  if (image == null) {
    return undefined;
  }

  if (image.type === "url") {
    return { url: image.value };
  }

  const file = files[image.value];
  if (file == null) {
    return undefined;
  }
  return {
    url: file.url,
    width: width ?? file.width,
    height: height ?? file.height,
    alt: file.alt,
  };
}
