import { BuiltWithFern as BuiltWithFernComponent } from "@fern-ui/components";
import { useDomain, useFeatureFlags } from "../atoms";

export const BuiltWithFern: React.FC<{ className?: string }> = ({ className }) => {
    const domain = useDomain();
    const { isWhitelabeled } = useFeatureFlags();

    if (isWhitelabeled) {
        return null;
    }

    return <BuiltWithFernComponent utmCampaign="buildWith" utmMedium="docs" utmSource={domain} className={className} />;
};
