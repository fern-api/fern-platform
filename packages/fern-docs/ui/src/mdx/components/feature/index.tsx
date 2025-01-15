import { Feature as FeatureComponent } from "../../../feature-flags/Feature";
import { FeatureFlagDebug } from "../../../feature-flags/FeatureFlagDebug";
import { FeatureProps } from "../../../feature-flags/types";

export const Feature = (props: FeatureProps) => (
  <FeatureFlagDebug {...props}>
    <FeatureComponent {...props} />
  </FeatureFlagDebug>
);
