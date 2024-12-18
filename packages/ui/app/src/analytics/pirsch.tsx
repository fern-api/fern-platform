import Script from "next/script";
import { ReactNode } from "react";

// TODO: send events to pirsch
export default function PirschScript({ identificationCode }: { identificationCode: string }): ReactNode {
    return <Script defer src="https://api.pirsch.io/pa.js" id="pianjs" data-code={identificationCode} />;
}
