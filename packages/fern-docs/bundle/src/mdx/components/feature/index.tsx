import { Feature as FeatureComponent } from "../../../components/feature-flags/Feature";
import { FeatureFlagDebug } from "../../../components/feature-flags/FeatureFlagDebug";
import { FeatureProps } from "../../../components/feature-flags/types";

export const Feature = (props: FeatureProps) => (
  <FeatureFlagDebug {...props}>
    <FeatureComponent {...props} />
  </FeatureFlagDebug>
);
