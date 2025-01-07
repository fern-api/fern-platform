import { BuiltWithFern as BuiltWithFernComponent } from "@fern-docs/components";
import { createContext, useContext } from "react";
import { useDomain, useFeatureFlag } from "../atoms";

export const BuiltWithFern: React.FC<{ className?: string }> = ({
  className,
}) => {
  const domain = useDomain();
  const isWhitelabeled = useFeatureFlag("isWhitelabeled");
  const hideBuiltWithFern = useContext(HideBuiltWithFernContext);

  if (isWhitelabeled || hideBuiltWithFern) {
    return null;
  }

  return (
    <BuiltWithFernComponent
      utmCampaign="buildWith"
      utmMedium="docs"
      utmSource={domain}
      className={className}
    />
  );
};

export const HideBuiltWithFernContext = createContext(false);
