import { useAtomValue } from "jotai";
import { ReactElement } from "react";
import { DOCS_ATOM, LOGO_ATOM } from "../atoms";
import { FernImage } from "../components/FernImage";

export function HeaderLogoImage(): ReactElement | null {
  const title = useAtomValue(DOCS_ATOM).title ?? "Logo";
  const { light, dark, height } = useAtomValue(LOGO_ATOM);

  if (light != null && dark != null) {
    return (
      <>
        <FernImage
          alt={title}
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
          alt={title}
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
      alt={title}
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
