import Script from "next/script";
import { ReactNode } from "react";

export default function PlausibleScript({ domain }: { domain: string }): ReactNode {
    return <Script id="plausible" defer src="https://plausible.io/js/script.js" data-domain={domain} />;
}
