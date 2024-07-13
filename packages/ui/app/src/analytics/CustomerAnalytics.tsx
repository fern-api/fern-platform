import { GoogleAnalytics } from "@next/third-parties/google";
import { useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { isEqual } from "lodash-es";
import { ReactElement, memo } from "react";
import { DOCS_ATOM } from "../atoms";
import { GoogleTagManager } from "./GoogleTagManager";

const ANALYTICS_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.analytics ?? {}, isEqual);

export const CustomerAnalytics = memo(function CustomerAnalytics(): ReactElement | null {
    const { ga4, gtm } = useAtomValue(ANALYTICS_ATOM);
    return (
        <>
            {ga4 != null && <GoogleAnalytics gaId={ga4.measurementId} />}
            {gtm != null && <GoogleTagManager {...gtm} />}
        </>
    );
});
