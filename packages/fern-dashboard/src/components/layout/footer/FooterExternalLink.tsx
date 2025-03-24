import { FooterText } from "./FooterText";

export declare namespace FooterExternalLink {
  export interface Props {
    text: string;
    href: string;
  }
}

export const FooterExternalLink = ({
  href,
  text,
}: FooterExternalLink.Props) => {
  return (
    <a href={href} target="_blank">
      <FooterText className="hover:text-gray-1100" text={text} />
    </a>
  );
};
