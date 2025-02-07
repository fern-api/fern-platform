"use client";

import { FernImage } from "@/components/image";
import { FernLink } from "@/components/link";
import { FileData } from "@/server/types";
import { PropsWithChildren } from "react";

export function HeaderLogoImage({
  light,
  dark,
  alt,
  height,
}: {
  light?: FileData;
  dark?: FileData;
  alt: string;
  height: number;
}) {
  if (light != null && dark != null) {
    return (
      <>
        <FernImage
          alt={alt}
          src={light.src}
          className="fern-logo-light"
          height={light.height}
          width={light.width}
          blurDataURL={light.blurDataURL}
          priority={true}
          loading="eager"
          quality={100}
          style={{ height, width: "auto" }}
        />
        <FernImage
          alt={alt}
          src={dark.src}
          className="fern-logo-dark"
          height={dark.height}
          width={dark.width}
          blurDataURL={dark.blurDataURL}
          priority={true}
          loading="eager"
          quality={100}
          style={{ height, width: "auto" }}
        />
      </>
    );
  }

  const logoFile = light ?? dark;

  if (logoFile == null) {
    return null;
  }

  return (
    <FernImage
      alt={alt}
      src={logoFile.src}
      className="fern-logo"
      height={logoFile.height}
      width={logoFile.width}
      blurDataURL={logoFile.blurDataURL}
      priority={true}
      loading="eager"
      quality={100}
      style={{ height, width: "auto" }}
    />
  );
}

export function HeaderLogoContainer({
  children,
  href,
}: PropsWithChildren<{ href: string | undefined }>) {
  const container = <div className="fern-logo-container">{children}</div>;
  return href != null ? (
    <FernLink href={href}>{container}</FernLink>
  ) : (
    container
  );
}
