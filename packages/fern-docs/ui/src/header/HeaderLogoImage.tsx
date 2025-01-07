import { DocsV1Read } from "@fern-api/fdr-sdk";
import { useAtomValue } from "jotai";
import { ComponentPropsWithoutRef, forwardRef, ReactElement } from "react";
import { DOCS_ATOM, LOGO_IMAGE_ATOM, useFile, useLogoHeight } from "../atoms";
import { FernImage } from "../components/FernImage";

const FernFileImage = forwardRef<
  HTMLImageElement,
  Omit<ComponentPropsWithoutRef<typeof FernImage>, "src"> & {
    fileId: DocsV1Read.FileId;
  }
>(({ fileId, ...props }, ref) => {
  return <FernImage {...props} ref={ref} src={useFile(fileId)} />;
});

FernFileImage.displayName = "FernFileImage";

const FernFileOrUrlImage = forwardRef<
  HTMLImageElement,
  Omit<ComponentPropsWithoutRef<typeof FernImage>, "src"> & {
    fileIdOrUrl: DocsV1Read.FileIdOrUrl;
  }
>(({ fileIdOrUrl, ...props }, ref) => {
  if (fileIdOrUrl.type === "fileId") {
    return <FernFileImage {...props} ref={ref} fileId={fileIdOrUrl.value} />;
  }
  return (
    <FernImage
      {...props}
      ref={ref}
      src={{ type: "url", url: fileIdOrUrl.value }}
    />
  );
});

FernFileOrUrlImage.displayName = "FernFileOrUrlImage";

export function HeaderLogoImage(): ReactElement | null {
  const logoImageHeight = useLogoHeight();
  const title = useAtomValue(DOCS_ATOM).title ?? "Logo";
  const { light, dark } = useAtomValue(LOGO_IMAGE_ATOM);

  if (light != null && dark != null) {
    return (
      <>
        <FernFileOrUrlImage
          alt={title}
          fileIdOrUrl={light}
          className="fern-logo-light"
          height={logoImageHeight}
          priority={true}
          loading="eager"
          quality={100}
        />
        <FernFileOrUrlImage
          alt={title}
          fileIdOrUrl={dark}
          className="fern-logo-dark"
          height={logoImageHeight}
          priority={true}
          loading="eager"
          quality={100}
        />
      </>
    );
  }

  const logoFile = light ?? dark;

  if (logoFile == null) {
    return null;
  }

  return (
    <FernFileOrUrlImage
      alt={title}
      fileIdOrUrl={logoFile}
      className="fern-logo"
      height={logoImageHeight}
      style={{ height: logoImageHeight }}
      priority={true}
      loading="eager"
      quality={100}
    />
  );
}
