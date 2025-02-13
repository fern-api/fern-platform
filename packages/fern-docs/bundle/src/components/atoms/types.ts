import { FileData } from "@/server/types";

export interface DefaultNavbarLink {
  type: "filled" | "outlined" | "minimal" | "primary" | "secondary";
  href: string;
  text: string | undefined;
  icon: string | undefined;
  rightIcon: string | undefined;
  rounded: boolean | undefined;
  className: string | undefined;
  id: string | undefined;
  returnToQueryParam: string | undefined;
}

export interface GithubNavbarLink {
  type: "github";
  href: string;
  className: string | undefined;
  id: string | undefined;
}

export type NavbarLink = DefaultNavbarLink | GithubNavbarLink;

export interface LogoConfiguration {
  height: number | undefined;
  href: string | undefined;
  light: FileData | undefined;
  dark: FileData | undefined;
}

export interface JsConfig {
  remote:
    | {
        url: string;
        strategy:
          | "beforeInteractive"
          | "afterInteractive"
          | "lazyOnload"
          | undefined;
      }[]
    | undefined;
  inline: string[] | undefined;
}
