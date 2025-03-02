import { ArrowUpRight } from "lucide-react";

import { FernTooltip, FernTooltipProvider } from "@fern-docs/components";
import { addLeadingSlash } from "@fern-docs/utils";

import { FernLinkButton } from "./FernLinkButton";

export const ApiReferenceButton: React.FC<{ slug: string }> = ({ slug }) => {
  const href = addLeadingSlash(slug);
  return (
    <FernTooltipProvider>
      <FernTooltip content="Open in API reference">
        <FernLinkButton
          className="-m-1"
          rounded
          variant="minimal"
          icon={<ArrowUpRight className="size-icon" />}
          href={href}
          scroll={true}
        />
      </FernTooltip>
    </FernTooltipProvider>
  );
};
