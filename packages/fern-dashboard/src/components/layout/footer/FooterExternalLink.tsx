import React from "react";

import { FooterText } from "./FooterText";

export declare namespace FooterExternalLink {
  export interface Props {
    href: string;
    children: React.JSX.Element | string;
  }
}

export const FooterExternalLink = ({
  href,
  children,
}: FooterExternalLink.Props) => {
  return (
    <a href={href} target="_blank">
      <FooterText hoverable>{children}</FooterText>
    </a>
  );
};
