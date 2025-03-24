import { FernIcon } from "../../theme/FernIcon";
import { FooterExternalLink } from "./FooterExternalLink";
import { FooterText } from "./FooterText";

export function Footer() {
  return (
    <div className="flex items-center gap-6">
      <FernIcon className="w-4" />
      <FooterText text="/" />
      <FooterExternalLink href="https://buildwithfern.com" text="Home" />
      <FooterExternalLink href="https://buildwithfern.com/learn" text="Docs" />
      <FooterExternalLink
        href="https://buildwithfern.com/book-a-demo/demo"
        text="Contact"
      />
    </div>
  );
}
